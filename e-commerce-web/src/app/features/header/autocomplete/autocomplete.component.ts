import { Component, signal, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
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

  // Get all top-level categories for the dropdown
  readonly categories = computed<Category[]>(() => {
    const allCategories: Category[] = [];
    this.searchService.options().forEach((option) => {
      if (option.categories) {
        allCategories.push(...option.categories);
      }
    });
    return allCategories;
  });

  // Result of filtered options using service
  readonly filteredOptions = computed(() => {
    // Depend on both search and category controls
    const searchTerm = (this.searchControl.value || '').toLowerCase();
    const selectedCategoryId = this.categoryControl.value;

    // Get base options
    let options = this.searchService.options();

    // Apply category filter if selected
    if (selectedCategoryId) {
      options = options.filter((option) => {
        // Check if option has categories and if any category matches
        return option.categories?.some((category) =>
          this.isCategoryInHierarchy(category, selectedCategoryId)
        );
      });
    }

    // Apply search term filter
    return this.searchService.filterAutocompleteResults(searchTerm, options);
  });

  // Remove the constructor as it's no longer needed

  // Check if category or any of its children matches the selected category ID
  private isCategoryInHierarchy(category: Category, targetId: string): boolean {
    // Check if current category matches
    if (category.id === targetId) return true;

    // Check children recursively
    if (category.children) {
      return category.children.some((child) =>
        this.isCategoryInHierarchy(child, targetId)
      );
    }

    return false;
  }

  // Selected option (optional use in parent or UI)
  readonly selectedOption = signal<AutocompleteOption | undefined>(undefined);

  // Callback when option selected
  onOptionSelected(option: AutocompleteOption) {
    this.selectedOption.set(option);
    this.searchControl.setValue(option.label);
  }

  // Clear the search box and category filter
  clearSearch(): void {
    this.searchControl.setValue(null);
    this.categoryControl.setValue('');
    this.selectedOption.set(undefined);
  }
}
