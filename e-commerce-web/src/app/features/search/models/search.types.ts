import { Entity } from '../../../core/models/entities.interface';
import { EntityType } from '../../../core/models/entity-type.enum';

/**
 * Union type for all searchable entities.
 */
export type SearchTermEntity = Exclude<Entity, { type: EntityType.All }>;
