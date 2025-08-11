import { Injectable, signal } from '@angular/core';
import { optionMatchesCategory, optionMatchesTerm } from '../search-utils';
import { STUB_CATEGORIES } from '../../../core/data/categories.stub';
import { STUB_ENTITIES } from '../../../core/data/entities.stub';
import { Category } from '../../../core/models/entities.interface';
import { EntityType } from '../../../core/models/entity-type.enum';
import { KeyValuePair } from '../../../core/models/key-value-pair.interface';
import { ENTITY_TYPE_LABELS, SearchEntity } from '../models/search.types';

@Injectable({ providedIn: 'root' })
export class SearchService {
  readonly categories = signal<SearchEntity[]>(STUB_CATEGORIES);
  readonly entities = signal<SearchEntity[]>(STUB_ENTITIES);

  getEntityDropdownOptions(): KeyValuePair<string>[] {
    const options = this.getFilteredEntities();

    return options.map((option) => ({
      id: option.label === 'All Categories' ? '' : option.id,
      label: option.label,
    }));
  }

  getFilteredEntities(includeNested = false): KeyValuePair<string>[] {
    const options: KeyValuePair<string>[] = [];

    // 1. Add "All Categories" option from ENTITY_TYPE_LABELS first
    options.push({
      id: EntityType.Category,
      label: ENTITY_TYPE_LABELS[EntityType.Category],
    });

    // 2. Add top-level categories from data (actual category entities)
    const topCategories = this.categories().filter(
      (c) => c.type === EntityType.Category
    );

    topCategories.forEach((cat) =>
      options.push({ id: cat.id, label: cat.label })
    );

    // 3. Add other entity types except 'category' to avoid duplication
    Object.entries(ENTITY_TYPE_LABELS)
      .filter(([key]) => key !== EntityType.Category)
      .forEach(([key, label]) => options.push({ id: key, label }));

    return options;
  }

  /**
   * Filters entities by category and search term.
   * Category filter is skipped for non-category-aware entity types.
   */
  filterByCategoryAndSearch(
    selectedId: string | null,
    searchTerm: string | null,
    searchEntities: SearchEntity[],
    onExactMatch?: (category: Category) => void
  ): SearchEntity[] {
    const normalizedId = selectedId?.trim() ?? '';
    const normalizedTerm = searchTerm?.trim().toLowerCase() ?? '';

    if (!normalizedTerm && !normalizedId) {
      return searchEntities;
    }

    let filtered: SearchEntity[];

    if (!normalizedId) {
      // no filter id, just filter by search term
      filtered = searchEntities.filter((entity) =>
        optionMatchesTerm(entity, normalizedTerm)
      );
    } else {
      // get entity type of selected id from entities
      const selectedEntity = this.entities().find((e) => e.id === normalizedId);
      if (!selectedEntity) {
        filtered = searchEntities;
      } else {
        switch (selectedEntity.type) {
          case EntityType.Category:
            filtered = searchEntities.filter(
              (entity) =>
                optionMatchesCategory(entity, normalizedId) &&
                optionMatchesTerm(entity, normalizedTerm)
            );
            break;
          case EntityType.Deal:
          case EntityType.Trending:
          case EntityType.NewArrival:
          case EntityType.Brand:
            // filter entities that exactly match the selected entity id or type
            filtered = searchEntities.filter(
              (entity) =>
                entity.id === normalizedId &&
                optionMatchesTerm(entity, normalizedTerm)
            );
            break;
          default:
            filtered = searchEntities.filter((entity) =>
              optionMatchesTerm(entity, normalizedTerm)
            );
        }
      }
    }

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
