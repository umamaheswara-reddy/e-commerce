import { Injectable, signal } from '@angular/core';
import {
  optionMatchingTerm,
  productOptionsMatchingTerm,
} from '../search-utils';
import {
  Entity,
  ENTITY_TYPE_LABELS,
  ProductCategory,
} from '../../../core/models/entities.interface';
import { EntityType } from '../../../core/models/entity-type.enum';
import { KeyValuePair } from '../../../core/models/key-value-pair.interface';
import { SearchTermEntity } from '../models/search.types';
import { STUB_PRODUCT_CATEGORIES } from '../../../core/data/product-categories.stub';
import { STUB_ENTITIES } from '../../../core/data/entities.stub';

@Injectable({ providedIn: 'root' })
export class SearchService {
  readonly entities = signal<SearchTermEntity[]>(STUB_ENTITIES);
  readonly productCategories = signal<ProductCategory[]>(
    STUB_PRODUCT_CATEGORIES
  );

  getEntityDropdownOptions(): KeyValuePair<EntityType>[] {
    return Object.entries(ENTITY_TYPE_LABELS).map(([key, label]) => ({
      id: key as EntityType,
      label,
    }));
  }

  /**
   * Main filter method.
   */
  filterByEntityAndSearch(
    selectedEntityType: EntityType,
    term: string | null
  ): SearchTermEntity[] {
    const normalizedTerm = term?.trim().toLowerCase() ?? '';

    return this.entities().filter((entity) =>
      this.matchesEntity(entity, selectedEntityType, normalizedTerm)
    );
  }

  /**
   * Determines whether a given entity matches the search term
   * and selected entity type.
   */
  private matchesEntity(
    entity: SearchTermEntity,
    filterType: EntityType,
    term: string
  ): boolean {
    // "All" → just match by term
    if (filterType === EntityType.All) {
      return this.matchesEntityByType(entity, term);
    }

    // Other types → must match both type and term
    if (entity.type !== filterType) return false;

    return this.matchesEntityByType(entity, term);
  }

  /**
   * Type-specific filtering logic (reused everywhere).
   */
  private matchesEntityByType(entity: SearchTermEntity, term: string): boolean {
    switch (entity.type) {
      case EntityType.Product:
        return productOptionsMatchingTerm(term, entity, {
          id: 'root',
          label: 'root',
          children: this.productCategories(),
        } as ProductCategory);

      case EntityType.Brand:
      case EntityType.Deal:
      case EntityType.Trending:
      case EntityType.NewArrival:
        return optionMatchingTerm(term, entity.label);

      default:
        return false;
    }
  }
}
