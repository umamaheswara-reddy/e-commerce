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

  // Search input form control
  readonly searchControl = new FormControl<string | null>(null);

  // Category selection form control
  readonly categoryControl = new FormControl<string>('');

  // Reactive signals for form control values
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

  // All top-level categories for the dropdown
  readonly categories = computed<Category[]>(() => {
    const allCategories: Category[] = [];
    this.searchService.options().forEach((option) => {
      if (option.categories) {
        allCategories.push(...option.categories);
      }
    });
    return allCategories;
  });

  // Filtered options (reactive to both search term and category)
  readonly filteredOptions = computed(() => {
    const searchTerm = (this.searchTermSig() || '').toLowerCase();
    const selectedCategoryId = this.selectedCategoryIdSig();

    let options = this.searchService.options();

    // Apply category filter
    if (selectedCategoryId) {
      options = options.filter((option) =>
        option.categories?.some((category) =>
          this.isCategoryInHierarchy(category, selectedCategoryId)
        )
      );
    }

    // Apply search term filter
    return this.searchService.filterAutocompleteResults(searchTerm, options);
  });

  // Selected option (optional)
  readonly selectedOption = signal<AutocompleteOption | undefined>(undefined);

  // Check if category or any of its children matches the selected category ID
  private isCategoryInHierarchy(category: Category, targetId: string): boolean {
    if (category.id === targetId) return true;
    if (category.children) {
      return category.children.some((child) =>
        this.isCategoryInHierarchy(child, targetId)
      );
    }
    return false;
  }

  // When option is selected
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
