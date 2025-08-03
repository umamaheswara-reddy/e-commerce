import { Component, signal, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SearchService } from '../../search/services/search.service';
import { AutocompleteOption } from '../../search/models/autocomplete-option.model';

@Component({
  selector: 'app-header-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
  ],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss',
})
export class HeaderAutocompleteComponent {
  private searchService = inject(SearchService);

  // External flag to control styling
  noOptionCheck = input<boolean>(false);

  // Search input form control
  readonly searchControl = new FormControl<string | null>('');

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

  // Result of filtered options using service
  readonly filteredOptions = this.searchService.getFilteredOptions(
    this.searchControl,
    this.options(),
    (match) => this.onOptionSelected(match)
  );

  // Selected option (optional use in parent or UI)
  readonly selectedOption = signal<AutocompleteOption | undefined>(undefined);

  // Callback when option selected
  onOptionSelected(option: AutocompleteOption) {
    this.selectedOption.set(option);
    this.searchControl.setValue(option.label);
  }

  // Clear the search box
  clearSearch(): void {
    this.searchControl.setValue(null);
    this.selectedOption.set(undefined);
  }
}
