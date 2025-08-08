import { Injectable, signal } from '@angular/core';
import { Category, Item } from '../models/product.models';
import {
  optionMatchesCategory,
  optionMatchesTerm,
} from '../../../utils/search-utils';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  // All available categories as a signal — later can be replaced by API data
  readonly categories = signal<Category[]>([
    {
      id: 'cat-1',
      label: 'Electronics & Gadgets',
      type: 'category',
      children: [
        {
          id: 'cat-1-1',
          label: 'Laptops & Computers',
          children: [
            { id: 'cat-1-1-1', label: 'Gaming Laptops' },
            { id: 'cat-1-1-2', label: 'Ultrabooks' },
            { id: 'cat-1-1-3', label: '2-in-1 Convertibles' },
          ],
        },
        {
          id: 'cat-1-2',
          label: 'Smartphones',
          children: [
            { id: 'cat-1-2-1', label: 'Android Phones' },
            { id: 'cat-1-2-2', label: 'iPhones' },
          ],
        },
        {
          id: 'cat-1-3',
          label: 'Wearable Tech',
          children: [
            { id: 'cat-1-3-1', label: 'Smartwatches' },
            { id: 'cat-1-3-2', label: 'Fitness Trackers' },
          ],
        },
      ],
    },
    {
      id: 'cat-2',
      label: 'Home & Kitchen',
      type: 'category',
      children: [
        {
          id: 'cat-2-1',
          label: 'Appliances',
          children: [
            { id: 'cat-2-1-1', label: 'Refrigerators' },
            { id: 'cat-2-1-2', label: 'Microwaves' },
            { id: 'cat-2-1-3', label: 'Coffee Machines' },
          ],
        },
        {
          id: 'cat-2-2',
          label: 'Furniture',
          children: [
            { id: 'cat-2-2-1', label: 'Sofas' },
            { id: 'cat-2-2-2', label: 'Dining Tables' },
          ],
        },
      ],
    },
    {
      id: 'cat-3',
      label: 'Sports & Outdoors',
      type: 'category',
      children: [
        {
          id: 'cat-3-1',
          label: 'Cycling',
          children: [
            { id: 'cat-3-1-1', label: 'Mountain Bikes' },
            { id: 'cat-3-1-2', label: 'Road Bikes' },
          ],
        },
        {
          id: 'cat-3-2',
          label: 'Camping',
          children: [
            { id: 'cat-3-2-1', label: 'Tents' },
            { id: 'cat-3-2-2', label: 'Sleeping Bags' },
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
   * Get a flat list of { id, label } for all categories.
   * This is used for the category dropdown.
   */
  getCategoryList(): Item<string>[] {
    const seen = new Set<string>();
    const result: Item<string>[] = [];

    const collectCategories = (categories: Category[]) => {
      for (const category of categories) {
        if (!seen.has(category.label)) {
          seen.add(category.label);
          result.push({ id: category.id, label: category.label });
        }
      }
    };

    this.categories()
      .filter((c) => c.type === 'category' && c.children)
      .forEach((opt) => collectCategories(opt.children!));

    // Sort alphabetically by label
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
    options: Category[],
    onExactMatch?: (option: Category) => void
  ): Category[] {
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
