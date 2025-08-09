import { BaseEntity } from './base-entity.interface';
import { EntityType } from './entity-type.enum';

export interface Category extends BaseEntity<string> {
  type: EntityType.Category;
  parentId?: string;
  children?: Category[];
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
