import { Component, signal, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

import { SearchService } from '../../search/services/search.service';
import {
  AutocompleteOption,
  Category,
} from '../../search/models/autocomplete-option.model';

@Component({
  selector: 'app-header-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatSelectModule,
  ],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss',
})
export class HeaderAutocompleteComponent {
  private searchService = inject(SearchService);

  // External flag to control styling
  noOptionCheck = input<boolean>(false);

  // Form controls
  readonly searchControl = new FormControl<string | null>(null);
  readonly categoryControl = new FormControl<string>('');

  // Reactive signals from form controls
  readonly searchTermSig = toSignal(
    this.searchControl.valueChanges.pipe(
      startWith(this.searchControl.value ?? '')
    ),
    { initialValue: '' }
  );

  readonly selectedCategoryIdSig = toSignal(
    this.categoryControl.valueChanges.pipe(
      startWith(this.categoryControl.value ?? '')
    ),
    { initialValue: '' }
  );

  // All top-level categories for dropdown
  readonly categories = computed<Category[]>(() => {
    const allCategories: Category[] = [];
    this.searchService.options().forEach((option) => {
      if (option.categories) {
        allCategories.push(...option.categories);
      }
    });
    return allCategories;
  });

  // Filtered options using reusable service method
  readonly filteredOptions = computed(() => {
    return this.searchService.filterByCategoryAndSearch(
      this.selectedCategoryIdSig(),
      this.searchTermSig(),
      this.searchService.options()
    );
  });

  // Selected option signal
  readonly selectedOption = signal<AutocompleteOption | undefined>(undefined);

  // Handle option selection
  onOptionSelected(option: AutocompleteOption) {
    this.selectedOption.set(option);
    this.searchControl.setValue(option.label);
  }

  // Clear everything
  clearSearch(): void {
    this.searchControl.setValue(null);
    this.categoryControl.setValue('');
    this.selectedOption.set(undefined);
  }
}
