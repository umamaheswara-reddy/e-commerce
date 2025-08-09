import { Injectable, signal } from '@angular/core';
import {
  optionMatchesCategory,
  optionMatchesTerm,
} from '../../../utils/search-utils';
import { STUB_CATEGORIES } from '../models/categories.stub';
import { STUB_ENTITIES } from '../models/entities.stub';
import { Category } from '../../../core/models/entities.interface';
import { EntityType } from '../../../core/models/entity-type.enum';
import { KeyValuePair } from '../../../core/models/key-value-pair.interface';
import { SearchEntity } from '../models/search.models';

@Injectable({ providedIn: 'root' })
export class SearchService {
  readonly categories = signal<SearchEntity[]>(STUB_CATEGORIES);
  readonly entities = signal<SearchEntity[]>(STUB_ENTITIES);

  getCategoryList(includeNested = false): KeyValuePair<string>[] {
    const seen = new Set<string>();
    const result: KeyValuePair<string>[] = [];

    const collect = (category: Category) => {
      if (!seen.has(category.label)) {
        seen.add(category.label);
        result.push({ id: category.id, label: category.label });
      }
      if (includeNested && category.children?.length) {
        category.children.forEach(collect);
      }
    };

    this.categories()
      .filter((c): c is Category => c.type === EntityType.Category)
      .forEach(collect);

    return result.sort((a, b) => a.label.localeCompare(b.label));
  }

  /**
   * Filters entities by category and search term.
   * Category filter is skipped for non-category-aware entity types.
   */
  filterByCategoryAndSearch(
    categoryId: string | null,
    searchTerm: string | null,
    searchEntities: SearchEntity[],
    onExactMatch?: (category: Category) => void
  ): SearchEntity[] {
    const normalizedCategoryId = categoryId?.trim() ?? '';
    const normalizedTerm = searchTerm?.trim().toLowerCase() ?? '';

    if (!normalizedTerm && !normalizedCategoryId) {
      return searchEntities;
    }

    const filtered = searchEntities.filter(
      (entity) =>
        optionMatchesCategory(entity, normalizedCategoryId) &&
        optionMatchesTerm(entity, normalizedTerm)
    );

    if (normalizedTerm && onExactMatch) {
      this.handleExactCategoryMatch(
        searchEntities,
        normalizedTerm,
        onExactMatch
      );
    }

    return filtered;
  }

  private handleExactCategoryMatch(
    searchEntities: SearchEntity[],
    term: string,
    callback: (category: Category) => void
  ): void {
    const match = searchEntities.find(
      (opt): opt is Category =>
        opt.type === EntityType.Category && opt.label.toLowerCase() === term
    );
    if (match) callback(match);
  }
}
