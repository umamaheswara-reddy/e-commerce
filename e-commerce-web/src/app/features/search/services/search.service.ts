import { Injectable, signal } from '@angular/core';
import {
  optionMatchingTerm,
  productOptionsMatchingTerm,
  allEntityOptionsMatchingTerm,
} from '../search-utils';
import {
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

  getEntityDropdownOptions(): KeyValuePair<string>[] {
    const entityOptions: KeyValuePair<string>[] = [];

    Object.entries(ENTITY_TYPE_LABELS).forEach(([key, label]) =>
      entityOptions.push({ id: key, label })
    );

    return entityOptions;
  }

  /**
   * Filters entities by enitty and search term.
   */
  filterByEntityAndSearch(
    selectedId: string | null,
    searchTerm: string | null
  ): SearchTermEntity[] {
    const normalizedId = selectedId?.trim() ?? '';
    const normalizedTerm = searchTerm?.trim().toLowerCase() ?? '';

    if (!normalizedTerm && !normalizedId) {
      return this.entities();
    }

    let filtered: SearchTermEntity[];

    if (!normalizedId) {
      // no entity filter id, just filter by search term
      filtered = allEntityOptionsMatchingTerm(
        normalizedTerm,
        this.entities(),
        this.productCategories()
      );
    } else {
      // get entity type of selected id from entities
      const selectedEntity = this.entities().find((e) => e.id === normalizedId);
      if (!selectedEntity) {
        filtered = this.entities();
      } else {
        switch (selectedEntity.type) {
          case EntityType.Product:
            var productEntities = this.entities().filter(
              (pe) => pe.type === EntityType.Product
            );
            filtered = productEntities.filter((entity) =>
              productOptionsMatchingTerm(
                normalizedId,
                entity,
                this.productCategories()[0]
              )
            );
            break;
          case EntityType.Deal:
          case EntityType.Trending:
          case EntityType.NewArrival:
          case EntityType.Brand:
            // filter entities that exactly match the selected entity id or type
            filtered = this.entities().filter(
              (entity) =>
                entity.id === normalizedId &&
                optionMatchingTerm(normalizedTerm, entity.label)
            );
            break;
          default:
            filtered = this.entities().filter((entity) =>
              optionMatchingTerm(normalizedTerm, entity.label)
            );
        }
      }
    }

    return filtered;
  }
}
