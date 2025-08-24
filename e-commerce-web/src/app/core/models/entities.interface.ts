import { BaseEntity } from './base-entity.interface';
import { EntityType } from './entity-type.enum';

export interface ProductCategory {
  id: string;
  label: string;
  parentId?: string;
  children?: ProductCategory[];
}

export interface Product extends BaseEntity<string> {
  type: EntityType.Product;
  brand?: string;
  price?: number;
  categoryIds?: string[]; // Array of category IDs this product belongs to
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

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  [EntityType.All]: 'All',
  [EntityType.Product]: 'Products',
  [EntityType.Deal]: 'Deals',
  [EntityType.Trending]: 'Trending',
  [EntityType.NewArrival]: 'New Arrivals',
  [EntityType.Brand]: 'Brands',
};
