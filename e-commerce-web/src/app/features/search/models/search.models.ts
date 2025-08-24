import { Entity } from '../../../core/models/entity.models';
import { EntityType } from '../../../core/models/entity-type.enum';

/**
 * Union type for all searchable entities.
 */
export type SearchTermEntity = Exclude<Entity, { type: EntityType.All }>;

export interface ProductCategory {
  id: string;
  label: string;
  children?: ProductCategory[];
}
