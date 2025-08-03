import { Component, input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SearchService } from '../../shared/services/search.service';

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

  readonly searchControl = new FormControl('');
  readonly options = signal([
    'Products',
    'Categories',
    'Deals',
    'New Arrivals',
  ]);
  readonly filteredOptions = this.searchService.getFilteredOptions(
    this.searchControl,
    this.options()
  );

  noOptionCheck = input<boolean>(false);
}
