import { Injectable, signal } from '@angular/core';
import {
  Category,
  EntityType,
  KeyValuePair,
  Product,
  SearchEntity,
} from '../models/entity.models';
import {
  optionMatchesCategory,
  optionMatchesTerm,
} from '../../../utils/search-utils';
import { STUB_CATEGORIES } from '../models/categories.stub';
import { STUB_PRODUCTS } from '../models/products.stub';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  // Use stub data that can be easily replaced with API data later
  readonly categories = signal<SearchEntity[]>(STUB_CATEGORIES);
  readonly products = signal<SearchEntity[]>(STUB_PRODUCTS);

  /**
   * Get a list of categories { id, label }.
   * Can return only top-level or all nested categories based on `includeNested`.
   */
  getCategoryList(includeNested = false): KeyValuePair<string>[] {
    const seen = new Set<string>();
    const result: KeyValuePair<string>[] = [];

    const collect = (category: Category) => {
      if (!seen.has(category.label)) {
        seen.add(category.label);
        result.push({ id: category.id, label: category.label });
      }
      if (includeNested && category.children?.length) {
        category.children.forEach(collect);
      }
    };

    this.categories()
      .filter((c): c is Category => c.type === EntityType.Category)
      .forEach(collect);

    return result.sort((a, b) => a.label.localeCompare(b.label));
  }

  /**
   * Get all autocomplete labels (for search autocomplete panel).
   */
  getAutocompleteLabels(): string[] {
    return this.categories().map((opt) => opt.label);
  }

  /**
   * Filters search entities by category and search term.
   * Detects exact match and triggers optional callback.
   */
  filterByCategoryAndSearch(
    categoryId: string | null,
    searchTerm: string | null,
    searchEntities: SearchEntity[],
    onExactMatch?: (category: Category) => void
  ): SearchEntity[] {
    const normalizedCategoryId = categoryId?.trim() ?? '';
    const normalizedTerm = searchTerm?.trim().toLowerCase() ?? '';

    if (!normalizedTerm && !normalizedCategoryId) {
      return searchEntities;
    }

    const filtered = searchEntities.filter((entity) =>
      this.entityMatches(entity, normalizedCategoryId, normalizedTerm)
    );

    if (normalizedTerm && onExactMatch) {
      this.handleExactCategoryMatch(
        searchEntities,
        normalizedTerm,
        onExactMatch
      );
    }

    return filtered;
  }

  /**
   * Checks if an entity matches the given categoryId and term.
   */
  private entityMatches(
    entity: SearchEntity,
    categoryId: string,
    term: string
  ): boolean {
    const matchers: Record<EntityType, () => boolean> = {
      [EntityType.Category]: () =>
        (!categoryId ||
          optionMatchesCategory(entity as Category, categoryId)) &&
        (!term || optionMatchesTerm(entity as Category, term)),

      [EntityType.Product]: () => {
        const { categoryId: prodCat, label } = entity as Product;
        return (
          (!categoryId || prodCat === categoryId) &&
          (!term || label.toLowerCase().includes(term))
        );
      },

      // Other entity types — could add real matching later
      [EntityType.Brand]: () =>
        !term || entity.label.toLowerCase().includes(term),
      [EntityType.Deal]: () =>
        !term || entity.label.toLowerCase().includes(term),
      [EntityType.Trending]: () =>
        !term || entity.label.toLowerCase().includes(term),
      [EntityType.NewArrival]: () =>
        !term || entity.label.toLowerCase().includes(term),
    };

    return matchers[entity.type]?.() ?? true;
  }

  /**
   * Finds exact category match by term and triggers callback.
   */
  private handleExactCategoryMatch(
    entities: SearchEntity[],
    term: string,
    callback: (category: Category) => void
  ): void {
    const match = entities.find(
      (opt): opt is Category =>
        opt.type === EntityType.Category && opt.label.toLowerCase() === term
    );
    if (match) {
      callback(match);
    }
  }
}
