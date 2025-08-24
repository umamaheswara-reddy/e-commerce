import { Injectable } from '@angular/core';
import { EntityType } from '../../../core/models/entity-type.enum';
import { SearchService } from './search.service';

@Injectable({ providedIn: 'root' })
export class SearchFacade {
  constructor(private service: SearchService) {}

  getEntityDropdownOptions() {
    return this.service.getEntityDropdownOptions();
  }

  getFilteredOptions(entityType: EntityType, term: string | null) {
    return this.service.filterByEntityAndSearch(entityType, term);
  }

  getAutoSelectedEntityType(term: string): EntityType | null {
    return this.service.autoSelectEntityType(term);
  }
}
