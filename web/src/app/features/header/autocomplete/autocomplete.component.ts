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
import { formControlSignal } from '../../../utils/form-utils';
import { SearchTermEntity } from '../../search/models/search.models';
import { EntityType } from '../../../core/models/entity-type.enum';
import { SearchFacade } from '../../search/services/search.facade';

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
  private facade = inject(SearchFacade);

  // External flag to control styling
  noOptionCheck = input<boolean>(false);

  // Form controls
  readonly entityControl = new FormControl<EntityType>(EntityType.All, {
    nonNullable: true,
  });
  readonly searchControl = new FormControl<string | null>(null);

  // Reactive signals from form controls
  readonly searchTermSig = formControlSignal(this.searchControl, '');
  readonly selectedEntityTypeSig = formControlSignal(
    this.entityControl,
    EntityType.All
  );

  // Category dropdown list
  readonly entityDropdownOptions = computed(() =>
    this.facade.getEntityDropdownOptions()
  );

  // Filtered options (exclude categories)
  readonly filteredOptions = computed(() =>
    this.facade.getFilteredOptions(
      this.selectedEntityTypeSig(),
      this.searchTermSig()
    )
  );

  // Selected option
  readonly selectedSearchEntity = signal<SearchTermEntity | undefined>(
    undefined
  );

  constructor() {
    // Auto-select category if search term exactly matches one
    effect(() => {
      const term = this.searchTermSig()?.trim();
      if (!term) return;
      const autoType = this.facade.getAutoSelectedEntityType(term);
      if (autoType && this.selectedEntityTypeSig() !== autoType) {
        this.entityControl.setValue(autoType);
      }
    });
  }

  // Handle option selection
  onOptionSelected(selected: SearchTermEntity) {
    this.selectedSearchEntity.set(selected);
    this.searchControl.setValue(selected.label);
  }

  // Clear all fields
  clearSearch(): void {
    this.searchControl.setValue(null);
    this.entityControl.setValue(EntityType.All);
    this.selectedSearchEntity.set(undefined);
  }
}
