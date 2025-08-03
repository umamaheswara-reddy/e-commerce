import { Component, input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SearchService } from '../../shared/services/search.service';
import { AutocompleteOption } from './autocomplete-option.model';
import { MatOptionSelectionChange } from '@angular/material/core';

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

  readonly searchControl = new FormControl<string | null>('');
  readonly options = signal<AutocompleteOption[]>([
    {
      id: '1',
      label: 'Laptops & Computers',
      type: 'category',
    },
    {
      id: '2',
      label: 'Smartphones',
      type: 'category',
    },
    {
      id: '3',
      label: 'Summer Sale - Up to 50% off',
      type: 'deal',
    },
    {
      id: '4',
      label: 'Wireless Headphones',
      type: 'product',
    },
    { id: '5', label: 'New Arrivals in Home & Kitchen', type: 'new-arrival' },
    {
      id: '6',
      label: 'Samsung Galaxy S23',
      type: 'product',
    },
    { id: '7', label: 'Top Deals', type: 'trending' },
    { id: '8', label: 'Nike Brand', type: 'brand' },
  ]);

  readonly filteredOptions = this.searchService.getFilteredOptions(
    this.searchControl,
    this.options(),
    (match) => this.onOptionSelected(match)
  );

  noOptionCheck = input<boolean>(false);
  selectedOption?: AutocompleteOption;

  onOptionSelected(option: AutocompleteOption) {
    this.selectedOption = option;
    this.searchControl.setValue(option.label);
  }

  clearSearch(): void {
    this.searchControl.setValue(null); // Clears both input and selection
  }
}
