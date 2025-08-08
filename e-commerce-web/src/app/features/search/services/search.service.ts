import { Injectable, signal } from '@angular/core';
import {
  AutocompleteOption,
  Category,
} from '../models/autocomplete-option.model';
import {
  optionMatchesCategory,
  optionMatchesTerm,
} from '../../../utils/search-utils';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  // All available options as a signal — later can be replaced by API data
  readonly options = signal<AutocompleteOption[]>([
    {
      id: 'cat-1',
      label: 'Electronics & Gadgets',
      type: 'category',
      categories: [
        {
          id: 'cat-1-1',
          name: 'Laptops & Computers',
          children: [
            { id: 'cat-1-1-1', name: 'Gaming Laptops' },
            { id: 'cat-1-1-2', name: 'Ultrabooks' },
            { id: 'cat-1-1-3', name: '2-in-1 Convertibles' },
          ],
        },
        {
          id: 'cat-1-2',
          name: 'Smartphones',
          children: [
            { id: 'cat-1-2-1', name: 'Android Phones' },
            { id: 'cat-1-2-2', name: 'iPhones' },
          ],
        },
        {
          id: 'cat-1-3',
          name: 'Wearable Tech',
          children: [
            { id: 'cat-1-3-1', name: 'Smartwatches' },
            { id: 'cat-1-3-2', name: 'Fitness Trackers' },
          ],
        },
      ],
    },
    {
      id: 'cat-2',
      label: 'Home & Kitchen',
      type: 'category',
      categories: [
        {
          id: 'cat-2-1',
          name: 'Appliances',
          children: [
            { id: 'cat-2-1-1', name: 'Refrigerators' },
            { id: 'cat-2-1-2', name: 'Microwaves' },
            { id: 'cat-2-1-3', name: 'Coffee Machines' },
          ],
        },
        {
          id: 'cat-2-2',
          name: 'Furniture',
          children: [
            { id: 'cat-2-2-1', name: 'Sofas' },
            { id: 'cat-2-2-2', name: 'Dining Tables' },
          ],
        },
      ],
    },
    {
      id: 'cat-3',
      label: 'Sports & Outdoors',
      type: 'category',
      categories: [
        {
          id: 'cat-3-1',
          name: 'Cycling',
          children: [
            { id: 'cat-3-1-1', name: 'Mountain Bikes' },
            { id: 'cat-3-1-2', name: 'Road Bikes' },
          ],
        },
        {
          id: 'cat-3-2',
          name: 'Camping',
          children: [
            { id: 'cat-3-2-1', name: 'Tents' },
            { id: 'cat-3-2-2', name: 'Sleeping Bags' },
          ],
        },
      ],
    },

    // Products
    {
      id: 'prod-1',
      label: 'Samsung Galaxy S23 Ultra',
      type: 'product',
      metadata: { brand: 'Samsung', price: 1199 },
    },
    {
      id: 'prod-2',
      label: 'Apple MacBook Air M3',
      type: 'product',
      metadata: { brand: 'Apple', price: 1499 },
    },
    {
      id: 'prod-3',
      label: 'Sony WH-1000XM5 Noise Cancelling Headphones',
      type: 'product',
      metadata: { brand: 'Sony', price: 399 },
    },
    {
      id: 'prod-4',
      label: 'Dyson V15 Detect Cordless Vacuum',
      type: 'product',
      metadata: { brand: 'Dyson', price: 749 },
    },

    // Deals
    {
      id: 'deal-1',
      label: 'Summer Sale – Up to 50% Off Electronics',
      type: 'deal',
    },
    {
      id: 'deal-2',
      label: 'Buy 1 Get 1 Free – Kitchen Essentials',
      type: 'deal',
    },

    // Trending
    {
      id: 'trend-1',
      label: 'Top Deals on Smart Home Devices',
      type: 'trending',
    },
    {
      id: 'trend-2',
      label: 'Trending: Minimalist Furniture Designs',
      type: 'trending',
    },

    // New Arrivals
    {
      id: 'new-1',
      label: 'New Arrival: GoPro Hero 12 Black',
      type: 'new-arrival',
    },
    {
      id: 'new-2',
      label: 'Just Launched: Nike Air Zoom Pegasus 40',
      type: 'new-arrival',
    },

    // Brands
    {
      id: 'brand-1',
      label: 'Nike',
      type: 'brand',
      metadata: { country: 'USA' },
    },
    {
      id: 'brand-2',
      label: 'Adidas',
      type: 'brand',
      metadata: { country: 'Germany' },
    },
    {
      id: 'brand-3',
      label: 'Samsung',
      type: 'brand',
      metadata: { country: 'South Korea' },
    },
    {
      id: 'brand-4',
      label: 'Apple',
      type: 'brand',
      metadata: { country: 'USA' },
    },
  ]);

  /**
   * Get a flat list of { id, name } for all categories.
   * This is used for the category dropdown.
   */
  getCategoryList(): { id: string; name: string }[] {
    const seen = new Set<string>();
    const result: { id: string; name: string }[] = [];

    const collectCategories = (categories: Category[]) => {
      for (const category of categories) {
        if (!seen.has(category.name)) {
          seen.add(category.name);
          result.push({ id: category.id, name: category.name });
        }
        if (category.children) {
          collectCategories(category.children);
        }
      }
    };

    this.options()
      .filter((opt) => opt.type === 'category' && opt.categories)
      .forEach((opt) => collectCategories(opt.categories!));

    // Sort alphabetically by name
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get all autocomplete labels (for search autocomplete panel).
   */
  getAutocompleteLabels(): string[] {
    return this.options().map((opt) => opt.label);
  }

  /**
   * Filters options by category and search term.
   * Detects exact match and triggers optional callback.
   */

  filterByCategoryAndSearch(
    categoryId: string | null,
    searchTerm: string | null,
    options: AutocompleteOption[],
    onExactMatch?: (option: AutocompleteOption) => void
  ): AutocompleteOption[] {
    const normalizedCategoryId = categoryId ?? '';
    const term = (searchTerm ?? '').trim().toLowerCase();

    if (!term && !normalizedCategoryId) return options;

    const filtered = options.filter((option) => {
      if (
        normalizedCategoryId &&
        !optionMatchesCategory(option, normalizedCategoryId)
      )
        return false;
      if (term && !optionMatchesTerm(option, term)) return false;
      return true;
    });

    if (term && onExactMatch) {
      const match = options.find((opt) => opt.label.toLowerCase() === term);
      if (match) {
        onExactMatch(match);
      }
    }

    return filtered;
  }
}
