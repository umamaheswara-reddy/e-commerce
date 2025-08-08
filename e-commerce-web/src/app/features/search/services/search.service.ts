import { Injectable, signal } from '@angular/core';
import {
  Category,
  AutocompleteOption,
} from '../models/autocomplete-option.model';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  // All available options as a signal — later can be replaced by API data
  readonly options = signal<AutocompleteOption[]>([
    {
      id: '1',
      label: 'Electronics',
      type: 'category',
      categories: [
        {
          id: '1-1',
          name: 'Laptops & Computers',
          children: [
            { id: '1-1-1', name: 'Gaming Laptops' },
            { id: '1-1-2', name: 'Ultrabooks' },
          ],
        },
        {
          id: '1-2',
          name: 'Smartphones',
          children: [
            { id: '1-2-1', name: 'Android' },
            { id: '1-2-2', name: 'iOS' },
          ],
        },
      ],
    },
    { id: '2', label: 'Summer Sale - Up to 50% off', type: 'deal' },
    { id: '3', label: 'Wireless Headphones', type: 'product' },
    { id: '4', label: 'New Arrivals in Home & Kitchen', type: 'new-arrival' },
    { id: '5', label: 'Samsung Galaxy S23', type: 'product' },
    { id: '6', label: 'Top Deals', type: 'trending' },
    { id: '7', label: 'Nike Brand', type: 'brand' },
  ]);

  /**
   * Filters options by category and search term.
   * Detects exact match and triggers optional callback.
   */
  filterByCategoryAndSearch(
    categoryId: string,
    searchTerm: string,
    options: AutocompleteOption[],
    onExactMatch?: (option: AutocompleteOption) => void
  ): AutocompleteOption[] {
    const term = (searchTerm || '').trim().toLowerCase();
    if (!term && !categoryId) return options;

    const filtered = options.filter((option) => {
      // Filter by category if provided
      if (categoryId && !this.optionMatchesCategory(option, categoryId)) {
        return false;
      }
      // Filter by search term if provided
      if (term && !this.optionMatchesTerm(option, term)) {
        return false;
      }
      return true;
    });

    // Handle exact match case
    if (term && onExactMatch) {
      const match = options.find((opt) => opt.label.toLowerCase() === term);
      if (match) {
        onExactMatch(match);
      }
    }

    return filtered;
  }

  /** Checks if an option matches a search term in its label or nested categories */
  private optionMatchesTerm(option: AutocompleteOption, term: string): boolean {
    if (option.label.toLowerCase().includes(term)) {
      return true;
    }
    return (
      !!option.categories && this.searchInCategories(option.categories, term)
    );
  }

  /** Checks if an option belongs to a specific category id */
  private optionMatchesCategory(
    option: AutocompleteOption,
    categoryId: string
  ): boolean {
    if (!option.categories) return false;
    return this.categoryTreeContainsId(option.categories, categoryId);
  }

  /** Recursively searches categories for a term */
  private searchInCategories(categories: Category[], term: string): boolean {
    for (const category of categories) {
      if (category.name.toLowerCase().includes(term)) {
        return true;
      }
      if (
        category.children &&
        this.searchInCategories(category.children, term)
      ) {
        return true;
      }
    }
    return false;
  }

  /** Recursively checks if a category tree contains a specific id */
  private categoryTreeContainsId(categories: Category[], id: string): boolean {
    for (const category of categories) {
      if (category.id === id) {
        return true;
      }
      if (
        category.children &&
        this.categoryTreeContainsId(category.children, id)
      ) {
        return true;
      }
    }
    return false;
  }
}
