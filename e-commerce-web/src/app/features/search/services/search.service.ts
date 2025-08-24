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
    const entityOptions: KeyValuePair<EntityType>[] = [];

    Object.entries(ENTITY_TYPE_LABELS).map(([key, label]) =>
      entityOptions.push({ id: key as EntityType, label })
    );

    return entityOptions;
  }

  /**
   * Filters entities by enitty and search term.
   */
  filterByEntityAndSearch(
    selectedEntityType: EntityType | null,
    term: string | null
  ): SearchTermEntity[] {
    const normalizedTerm = term?.trim().toLowerCase() ?? '';

    if (!selectedEntityType && normalizedTerm) {
      return this.entities(); // no filter
    }

    switch (selectedEntityType) {
      case EntityType.Product:
        return this.entities().filter(
          (entity) =>
            entity.type === EntityType.Product &&
            productOptionsMatchingTerm(normalizedTerm, entity, {
              id: 'root',
              label: 'root',
              children: this.productCategories(),
            } as ProductCategory)
        );

      case EntityType.Brand:
      case EntityType.Deal:
      case EntityType.Trending:
      case EntityType.NewArrival:
        return this.entities().filter(
          (entity) =>
            entity.type === selectedEntityType &&
            optionMatchingTerm(normalizedTerm, entity.label)
        );

      case EntityType.All:
      default:
        return this.allEntityOptionsMatchingTerm(
          normalizedTerm,
          this.productCategories()
        );
    }
  }

  allEntityOptionsMatchingTerm(
    term: string,
    productCategories: ProductCategory[]
  ): any {
    if (!term) {
      return this.entities(); // no filter, return all
    }

    return this.entities().filter((entity) => {
      switch (entity.type) {
        case EntityType.Product:
          // match product label or any product category
          return productOptionsMatchingTerm(term, entity, {
            id: 'root',
            label: 'root',
            children: productCategories,
          } as ProductCategory);

        case EntityType.Brand:
        case EntityType.Deal:
        case EntityType.Trending:
        case EntityType.NewArrival:
          return optionMatchingTerm(term, entity.label);

        default:
          return false;
      }
    });
  }
}
