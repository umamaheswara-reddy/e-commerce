import { Entity } from '../../../core/models/entity.models';
import { EntityType } from '../../../core/models/entity-type.enum';

/**
 * Searchable entities except All.
 */
export type SearchTermEntity = Exclude<Entity, { type: EntityType.All }>;

export interface Category {
  id: string;
  label: string;
  children?: Category[];
}
