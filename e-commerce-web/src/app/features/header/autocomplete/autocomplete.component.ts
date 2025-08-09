import {
  Component,
  signal,
  inject,
  input,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';

import { SearchService } from '../../search/services/search.service';
import { formControlSignal } from '../../../utils/form-utils';
import { EntityType } from '../../../core/models/entity-type.enum';
import { SearchEntity } from '../../search/models/search.models';

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
  readonly searchTermSig = formControlSignal(this.searchControl, '');
  readonly selectedCategoryIdSig = formControlSignal(this.categoryControl, '');

  // Category dropdown list
  readonly categoryList = computed(() =>
    this.searchService.getCategoryList().filter((c) => !!c.label)
  );

  // Filtered options (exclude categories)
  readonly filteredOptions = computed(() => {
    const searchableEntities = this.searchService
      .entities()
      .filter((e) => e.type !== EntityType.Category);

    return this.searchService.filterByCategoryAndSearch(
      this.selectedCategoryIdSig(),
      this.searchTermSig(),
      searchableEntities,
      (exactMatch) => this.onOptionSelected(exactMatch)
    );
  });

  // Selected option
  readonly selectedSearchEntity = signal<SearchEntity | undefined>(undefined);

  constructor() {
    // Auto-select category if search term exactly matches one
    effect(() => {
      const term = this.searchTermSig()?.trim().toLowerCase();
      if (!term) return;

      const matchingCategory = this.categoryList().find(
        (c) => c.label.toLowerCase() === term
      );

      if (
        matchingCategory &&
        this.selectedCategoryIdSig() !== matchingCategory.id
      ) {
        this.categoryControl.setValue(matchingCategory.id);
      }
    });
  }

  // Handle option selection
  onOptionSelected(selectedSearchEntity: SearchEntity) {
    this.selectedSearchEntity.set(selectedSearchEntity);
    this.searchControl.setValue(selectedSearchEntity.label);
  }

  // Clear all fields
  clearSearch(): void {
    this.searchControl.setValue(null);
    this.categoryControl.setValue('');
    this.selectedSearchEntity.set(undefined);
  }
}
