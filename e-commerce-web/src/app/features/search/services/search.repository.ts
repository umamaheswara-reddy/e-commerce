import { Injectable, signal } from '@angular/core';
import { STUB_ENTITIES } from '../../../core/data/entities.stub';
import { STUB_PRODUCT_CATEGORIES } from '../../../core/data/product-categories.stub';
import { ProductCategory, SearchTermEntity } from '../models/search.models';

@Injectable({ providedIn: 'root' })
export class SearchRepository {
  readonly entities = signal<SearchTermEntity[]>(STUB_ENTITIES);
  readonly productCategories = signal<ProductCategory[]>(
    STUB_PRODUCT_CATEGORIES
  );

  getEntities(): SearchTermEntity[] {
    return this.entities();
  }

  getProductCategories(): ProductCategory[] {
    return this.productCategories();
  }
}
