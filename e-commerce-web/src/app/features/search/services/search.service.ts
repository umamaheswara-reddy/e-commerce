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
  // All available options as a signal
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

  getAutocompleteResults(
    control: FormControl,
    onExactMatch?: (option: AutocompleteOption) => void
  ): Signal<AutocompleteOption[]> {
    let lastMatchId: string | undefined;
    return toSignal(
      control.valueChanges.pipe(
        startWith(''),
        map((value) => {
          const normalized = (value || '').toLowerCase();
          const filtered = this.filterAutocompleteResults(
            normalized,
            this.options()
          );

          if (onExactMatch) {
            const match = this.options().find(
              (opt) => opt.label.toLowerCase() === normalized
            );
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

  private searchInCategories(
    categories: Category[],
    filterValue: string
  ): boolean {
    for (const category of categories) {
      if (category.name.toLowerCase().includes(filterValue)) {
        return true;
      }
      if (
        category.children &&
        this.searchInCategories(category.children, filterValue)
      ) {
        return true;
      }
    }
    return false;
  }

  private filterAutocompleteResults(
    value: string,
    options: AutocompleteOption[]
  ): AutocompleteOption[] {
    const filterValue = value.toLowerCase();
    return options.filter((option) => {
      // Check the option itself
      if (option.label.toLowerCase().includes(filterValue)) {
        return true;
      }

      // Check nested categories if they exist
      if (
        option.categories &&
        this.searchInCategories(option.categories, filterValue)
      ) {
        return true;
      }

      return false;
    });
  }
}
