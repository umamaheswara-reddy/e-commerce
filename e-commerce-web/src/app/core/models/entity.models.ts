import { EntityType } from './entity-type.enum';
import { KeyValuePair } from './key-value-pair.interface';

export interface BaseEntity<T extends string | number> extends KeyValuePair<T> {
  type: EntityType;
  metadata?: Record<string, any>;
}

export interface Category extends BaseEntity<string> {
  type: EntityType.Category;
  parentId?: string;
  children?: Category[];
}

export interface Product extends BaseEntity<string> {
  type: EntityType.Product;
  brand?: string;
  price?: number;
  categoryIds?: string[];
}

export interface Brand extends BaseEntity<string> {
  type: EntityType.Brand;
  country?: string;
}
export interface Deal extends BaseEntity<string> {
  type: EntityType.Deal;
}

export interface Trending extends BaseEntity<string> {
  type: EntityType.Trending;
}

export interface NewArrival extends BaseEntity<string> {
  type: EntityType.NewArrival;
}

export type Entity = Product | Brand | Deal | Trending | NewArrival;
type LabelEntityType = Exclude<EntityType, EntityType.Category>;
export const ENTITY_TYPE_LABELS: Record<LabelEntityType, string> = {
  [EntityType.All]: 'All',
  [EntityType.Product]: 'Products',
  [EntityType.Deal]: 'Deals',
  [EntityType.Trending]: 'Trending',
  [EntityType.NewArrival]: 'New Arrivals',
  [EntityType.Brand]: 'Brands',
};
