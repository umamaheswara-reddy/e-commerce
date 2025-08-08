import { Injectable, signal } from '@angular/core';
import {
  Category,
  EntityType,
  KeyValuePair,
  SearchEntity,
} from '../models/product.models';
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
   * Filters options by category and search term.
   * Detects exact match and triggers optional callback.
   */
  filterByCategoryAndSearch(
    categoryId: string | null,
    searchTerm: string | null,
    searchEntities: SearchEntity[],
    onExactMatch?: (category: Category) => void
  ): SearchEntity[] {
    const normalizedCategoryId = categoryId ?? '';
    const term = (searchTerm ?? '').trim().toLowerCase();

    if (!term && !normalizedCategoryId) return searchEntities;

    const filtered = searchEntities.filter((entity) => {
      // Only Category entities participate in category/term matching
      if (entity.type === EntityType.Category) {
        if (
          normalizedCategoryId &&
          !optionMatchesCategory(entity as Category, normalizedCategoryId)
        ) {
          return false;
        }
        if (term && !optionMatchesTerm(entity as Category, term)) {
          return false;
        }
      }
      return true;
    });

    // Trigger exact match callback only for categories
    if (term && onExactMatch) {
      const match = searchEntities.find(
        (opt): opt is Category =>
          opt.type === EntityType.Category && opt.label.toLowerCase() === term
      );
      if (match) {
        onExactMatch(match);
      }
    }

    return filtered;
  }
}
