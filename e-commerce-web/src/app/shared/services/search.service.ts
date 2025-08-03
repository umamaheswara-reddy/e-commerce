import { Injectable, Signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  getFilteredOptions(
    control: FormControl,
    options: string[]
  ): Signal<string[]> {
    return toSignal(
      control.valueChanges.pipe(
        startWith(''),
        map((value) => this.filterOptions(value || '', options))
      ),
      { initialValue: options }
    );
  }

  private filterOptions(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }
}
