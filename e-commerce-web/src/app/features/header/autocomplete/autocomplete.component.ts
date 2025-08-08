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
import { Category, Item } from '../../search/models/product.models';

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

  // Cached category list — recomputes ONLY when options() changes
  readonly categories = computed<Item<string>[]>(() => {
    return this.searchService.getCategoryList();
  });

  // Filtered options using reusable service method
  readonly filteredOptions = computed(() => {
    return this.searchService.filterByCategoryAndSearch(
      this.selectedCategoryIdSig(),
      this.searchTermSig(),
      this.searchService.categories(),
      (exactMatch) => this.onOptionSelected(exactMatch) // optional
    );
  });

  // Selected option signal
  readonly selectedOption = signal<Category | undefined>(undefined);

  // Handle option selection
  onOptionSelected(option: Category) {
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
