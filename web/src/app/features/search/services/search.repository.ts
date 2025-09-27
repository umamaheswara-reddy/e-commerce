import { Injectable, signal } from '@angular/core';
import { STUB_ENTITIES } from '../../../core/data/entities.stub';
import { STUB_PRODUCT_CATEGORIES } from '../../../core/data/product-categories.stub';
import { Category, SearchTermEntity } from '../models/search.models';

@Injectable({ providedIn: 'root' })
export class SearchRepository {
  readonly entities = signal<SearchTermEntity[]>(STUB_ENTITIES);
  readonly productCategories = signal<Category[]>(STUB_PRODUCT_CATEGORIES);

  getEntities(): SearchTermEntity[] {
    return this.entities();
  }

  getProductCategories(): Category[] {
    return this.productCategories();
  }
}
