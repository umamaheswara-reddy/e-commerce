import {
  Category,
  Product,
  Brand,
  Deal,
  Trending,
  NewArrival,
} from '../../../core/models/entities.interface';
import { EntityType } from '../../../core/models/entity-type.enum';

/**
 * Union type for all searchable entities.
 */
export type SearchEntity =
  | Category
  | Product
  | Brand
  | Deal
  | Trending
  | NewArrival;

export type ExcludeSearchEntityTypes<TExcluded extends EntityType> = Exclude<
  SearchEntity,
  { type: TExcluded }
>;
