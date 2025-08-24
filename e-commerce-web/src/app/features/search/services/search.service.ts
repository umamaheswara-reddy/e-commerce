import { Injectable } from '@angular/core';
import {
  optionMatchingTerm,
  productOptionsMatchingTerm,
} from '../search-utils';
import { ENTITY_TYPE_LABELS } from '../../../core/models/entity.models';
import { EntityType } from '../../../core/models/entity-type.enum';
import { KeyValuePair } from '../../../core/models/key-value-pair.interface';
import { Category, SearchTermEntity } from '../models/search.models';
import { SearchRepository } from './search.repository';

@Injectable({ providedIn: 'root' })
export class SearchService {
  constructor(private repo: SearchRepository) {}

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
    return this.repo
      .getEntities()
      .filter((entity) =>
        this.matchesEntity(entity, selectedEntityType, normalizedTerm)
      );
  }

  autoSelectEntityType(term: string): EntityType | null {
    if (!term) return null;
    const options = this.getEntityDropdownOptions();
    const match = options.find(
      (c) => c.label.toLowerCase() === term.toLowerCase()
    );
    return match ? match.id : null;
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
          children: this.repo.getProductCategories(),
        } as Category);

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
