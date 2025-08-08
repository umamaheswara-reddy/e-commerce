import { Injectable, signal, Signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import {
  AutocompleteOption,
  Category,
} from '../models/autocomplete-option.model';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  // All available options as a signal (stubbed for now, can be replaced with API)
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
   * Wraps a FormControl's valueChanges into a reactive signal
   * that auto-filters based on current options.
   */
  getAutocompleteResults(
    control: FormControl,
    onExactMatch?: (option: AutocompleteOption) => void
  ): Signal<AutocompleteOption[]> {
    let lastMatchId: string | undefined;

    return toSignal(
      control.valueChanges.pipe(
        startWith(control.value ?? ''),
        map((value) => {
          const normalized = (value || '').toLowerCase();
          const filtered = this.filterBySearchTerm(normalized, this.options());

          if (onExactMatch) {
            const match = this.findExactMatch(normalized);
            if (match && match.id !== lastMatchId) {
              lastMatchId = match.id;
              onExactMatch(match);
            }
          }

          return filtered;
        })
      ),
      { initialValue: this.options() }
    );
  }

  /**
   * Filters options by search term.
   */
  filterBySearchTerm(
    searchTerm: string,
    options: AutocompleteOption[]
  ): AutocompleteOption[] {
    const term = searchTerm.toLowerCase();
    return options.filter((option) =>
      this.matchesOptionOrCategory(option, term)
    );
  }

  /**
   * Filters options by category ID (including nested categories).
   */
  filterByCategoryId(
    categoryId: string,
    options: AutocompleteOption[]
  ): AutocompleteOption[] {
    if (!categoryId) return options;

    return options.filter((option) =>
      option.categories?.some((cat) =>
        this.isCategoryInHierarchy(cat, categoryId)
      )
    );
  }

  /**
   * Filters options by BOTH category and search term.
   */
  filterByCategoryAndSearch(
    categoryId: string,
    searchTerm: string,
    options: AutocompleteOption[]
  ): AutocompleteOption[] {
    let result = this.filterByCategoryId(categoryId, options);
    if (searchTerm) {
      result = this.filterBySearchTerm(searchTerm, result);
    }
    return result;
  }

  /**
   * Finds an exact match for a term.
   */
  findExactMatch(normalizedTerm: string): AutocompleteOption | undefined {
    return this.options().find(
      (opt) => opt.label.toLowerCase() === normalizedTerm
    );
  }

  /**
   * Checks if an option matches a search term in its label or any of its categories.
   */
  private matchesOptionOrCategory(
    option: AutocompleteOption,
    term: string
  ): boolean {
    if (option.label.toLowerCase().includes(term)) return true;
    if (option.categories && this.searchInCategories(option.categories, term))
      return true;
    return false;
  }

  /**
   * Recursively searches within categories for a match.
   */
  private searchInCategories(categories: Category[], term: string): boolean {
    return categories.some(
      (category) =>
        category.name.toLowerCase().includes(term) ||
        (category.children && this.searchInCategories(category.children, term))
    );
  }

  /**
   * Checks if category or any of its children matches the target ID.
   */
  private isCategoryInHierarchy(category: Category, targetId: string): boolean {
    if (category.id === targetId) return true;
    if (
      category.children &&
      category.children.some((child) =>
        this.isCategoryInHierarchy(child, targetId)
      )
    ) {
      return true;
    }
    return false;
  }
}
