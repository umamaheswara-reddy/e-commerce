import { Injectable, signal, Signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { AutocompleteOption } from '../models/autocomplete-option.model';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  // All available options as a signal
  readonly options = signal<AutocompleteOption[]>([
    { id: '1', label: 'Laptops & Computers', type: 'category' },
    { id: '2', label: 'Smartphones', type: 'category' },
    { id: '3', label: 'Summer Sale - Up to 50% off', type: 'deal' },
    { id: '4', label: 'Wireless Headphones', type: 'product' },
    { id: '5', label: 'New Arrivals in Home & Kitchen', type: 'new-arrival' },
    { id: '6', label: 'Samsung Galaxy S23', type: 'product' },
    { id: '7', label: 'Top Deals', type: 'trending' },
    { id: '8', label: 'Nike Brand', type: 'brand' },
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

  private filterAutocompleteResults(
    value: string,
    options: AutocompleteOption[]
  ): AutocompleteOption[] {
    const filterValue = value.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(filterValue)
    );
  }
}
