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
import { SearchEntity, EntityType } from '../../search/models/entity.models';
import { formControlSignal } from '../../../utils/form-utils';

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

  // Filtered options (now includes products)
  readonly filteredOptions = computed(() => {
    const allEntities = [
      ...this.searchService.categories(),
      ...this.searchService.products(),
    ];

    // Get filtered entities
    let entities = this.searchService.filterByCategoryAndSearch(
      this.selectedCategoryIdSig(),
      this.searchTermSig(),
      allEntities,
      (exactMatch) => this.onOptionSelected(exactMatch)
    );

    // If "All Categories" is selected, remove categories completely
    if (this.selectedCategoryIdSig() === '') {
      entities = entities.filter(
        (entity) => entity.type !== EntityType.Category
      );
    }

    return entities;
  });

  // Selected option signal
  readonly selectedSearchEntity = signal<SearchEntity | undefined>(undefined);

  // Handle option selection
  onOptionSelected(selectedSearchEntity: SearchEntity) {
    this.selectedSearchEntity.set(selectedSearchEntity);
    this.searchControl.setValue(selectedSearchEntity.label);
  }

  // Clear everything
  clearSearch(): void {
    this.searchControl.setValue(null);
    this.categoryControl.setValue('');
    this.selectedSearchEntity.set(undefined);
  }
}
