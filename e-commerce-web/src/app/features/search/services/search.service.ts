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

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  // All available categories as a signal — later can be replaced by API data
  // Categories
  readonly categories = signal<SearchEntity[]>([
    {
      id: 'cat-1',
      label: 'Electronics & Gadgets',
      type: EntityType.Category,
      children: [
        {
          id: 'cat-1-1',
          label: 'Laptops & Computers',
          type: EntityType.Category,
          children: [
            {
              id: 'cat-1-1-1',
              label: 'Gaming Laptops',
              type: EntityType.Category,
            },
            { id: 'cat-1-1-2', label: 'Ultrabooks', type: EntityType.Category },
            {
              id: 'cat-1-1-3',
              label: '2-in-1 Convertibles',
              type: EntityType.Category,
            },
          ],
        },
        {
          id: 'cat-1-2',
          label: 'Smartphones',
          type: EntityType.Category,
          children: [
            {
              id: 'cat-1-2-1',
              label: 'Android Phones',
              type: EntityType.Category,
            },
            { id: 'cat-1-2-2', label: 'iPhones', type: EntityType.Category },
          ],
        },
        {
          id: 'cat-1-3',
          label: 'Wearable Tech',
          type: EntityType.Category,
          children: [
            {
              id: 'cat-1-3-1',
              label: 'Smartwatches',
              type: EntityType.Category,
            },
            {
              id: 'cat-1-3-2',
              label: 'Fitness Trackers',
              type: EntityType.Category,
            },
          ],
        },
      ],
    },
    {
      id: 'cat-2',
      label: 'Home & Kitchen',
      type: EntityType.Category,
      children: [
        {
          id: 'cat-2-1',
          label: 'Appliances',
          type: EntityType.Category,
          children: [
            {
              id: 'cat-2-1-1',
              label: 'Refrigerators',
              type: EntityType.Category,
            },
            { id: 'cat-2-1-2', label: 'Microwaves', type: EntityType.Category },
            {
              id: 'cat-2-1-3',
              label: 'Coffee Machines',
              type: EntityType.Category,
            },
          ],
        },
        {
          id: 'cat-2-2',
          label: 'Furniture',
          type: EntityType.Category,
          children: [
            { id: 'cat-2-2-1', label: 'Sofas', type: EntityType.Category },
            {
              id: 'cat-2-2-2',
              label: 'Dining Tables',
              type: EntityType.Category,
            },
          ],
        },
      ],
    },
    {
      id: 'cat-3',
      label: 'Sports & Outdoors',
      type: EntityType.Category,
      children: [
        {
          id: 'cat-3-1',
          label: 'Cycling',
          type: EntityType.Category,
          children: [
            {
              id: 'cat-3-1-1',
              label: 'Mountain Bikes',
              type: EntityType.Category,
            },
            { id: 'cat-3-1-2', label: 'Road Bikes', type: EntityType.Category },
          ],
        },
        {
          id: 'cat-3-2',
          label: 'Camping',
          type: EntityType.Category,
          children: [
            { id: 'cat-3-2-1', label: 'Tents', type: EntityType.Category },
            {
              id: 'cat-3-2-2',
              label: 'Sleeping Bags',
              type: EntityType.Category,
            },
          ],
        },
      ],
    },
  ]);

  // Products
  readonly products = signal([
    {
      id: 'prod-1',
      label: 'Samsung Galaxy S23 Ultra',
      type: EntityType.Product,
      metadata: { brand: 'Samsung', price: 1199 },
    },
    {
      id: 'prod-2',
      label: 'Apple MacBook Air M3',
      type: EntityType.Product,
      metadata: { brand: 'Apple', price: 1499 },
    },
    {
      id: 'prod-3',
      label: 'Sony WH-1000XM5 Noise Cancelling Headphones',
      type: EntityType.Product,
      metadata: { brand: 'Sony', price: 399 },
    },
    {
      id: 'prod-4',
      label: 'Dyson V15 Detect Cordless Vacuum',
      type: EntityType.Product,
      metadata: { brand: 'Dyson', price: 749 },
    },

    // Deals
    {
      id: 'deal-1',
      label: 'Summer Sale – Up to 50% Off Electronics',
      type: EntityType.Deal,
    },
    {
      id: 'deal-2',
      label: 'Buy 1 Get 1 Free – Kitchen Essentials',
      type: EntityType.Deal,
    },

    // Trending
    {
      id: 'trend-1',
      label: 'Top Deals on Smart Home Devices',
      type: EntityType.Trending,
    },
    {
      id: 'trend-2',
      label: 'Trending: Minimalist Furniture Designs',
      type: EntityType.Trending,
    },

    // New Arrivals
    {
      id: 'new-1',
      label: 'New Arrival: GoPro Hero 12 Black',
      type: EntityType.NewArrival,
    },
    {
      id: 'new-2',
      label: 'Just Launched: Nike Air Zoom Pegasus 40',
      type: EntityType.NewArrival,
    },

    // Brands
    {
      id: 'brand-1',
      label: 'Nike',
      type: EntityType.Brand,
      metadata: { country: 'USA' },
    },
    {
      id: 'brand-2',
      label: 'Adidas',
      type: EntityType.Brand,
      metadata: { country: 'Germany' },
    },
    {
      id: 'brand-3',
      label: 'Samsung',
      type: EntityType.Brand,
      metadata: { country: 'South Korea' },
    },
    {
      id: 'brand-4',
      label: 'Apple',
      type: EntityType.Brand,
      metadata: { country: 'USA' },
    },
  ]);

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
