import { Injectable, signal } from '@angular/core';
import {
  Category,
  EntityType,
  KeyValuePair,
  SearchEntity,
} from '../models/entity.models';
import {
  optionMatchesCategory,
  optionMatchesTerm,
} from '../../../utils/search-utils';
import { STUB_CATEGORIES } from '../models/categories.stub';
import { STUB_PRODUCTS } from '../models/products.stub';

@Injectable({ providedIn: 'root' })
export class SearchService {
  readonly categories = signal<SearchEntity[]>(STUB_CATEGORIES);
  readonly products = signal<SearchEntity[]>(STUB_PRODUCTS);

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

  getAutocompleteLabels(): string[] {
    return this.categories().map((opt) => opt.label);
  }

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
        (!normalizedCategoryId ||
          optionMatchesCategory(entity, normalizedCategoryId)) &&
        (!normalizedTerm || optionMatchesTerm(entity, normalizedTerm))
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
    entities: SearchEntity[],
    term: string,
    callback: (category: Category) => void
  ): void {
    const match = entities.find(
      (opt): opt is Category =>
        opt.type === EntityType.Category && opt.label.toLowerCase() === term
    );
    if (match) callback(match);
  }
}
