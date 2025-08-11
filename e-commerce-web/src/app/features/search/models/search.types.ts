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
export type SearchTermEntity =
  | Category
  | Product
  | Brand
  | Deal
  | Trending
  | NewArrival;

export type ExcludeSearchEntityTypes<TExcluded extends EntityType> = Exclude<
  SearchTermEntity,
  { type: TExcluded }
>;

export const ENTITY_TYPE_LABELS: Record<string, string> = {
  [EntityType.Category]: 'All Categories',
  [EntityType.Product]: 'Products',
  [EntityType.Deal]: 'Deals',
  [EntityType.Trending]: 'Trending',
  [EntityType.NewArrival]: 'New Arrivals',
  [EntityType.Brand]: 'Brands',
};
