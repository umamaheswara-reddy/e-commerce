import { Injectable, Signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { AutocompleteOption } from '../models/autocomplete-option.model';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  getFilteredOptions(
    control: FormControl,
    options: AutocompleteOption[],
    onExactMatch?: (option: AutocompleteOption) => void
  ): Signal<AutocompleteOption[]> {
    let lastMatchId: string | undefined;
    return toSignal(
      control.valueChanges.pipe(
        startWith(''),
        map((value) => {
          const normalized = (value || '').toLowerCase();
          const filtered = this.filterOptions(normalized, options);

          if (onExactMatch) {
            const match = options.find(
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
      { initialValue: options }
    );
  }

  private filterOptions(
    value: string,
    options: AutocompleteOption[]
  ): AutocompleteOption[] {
    const filterValue = value.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(filterValue)
    );
  }
}
