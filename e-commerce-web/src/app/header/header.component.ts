import { signal, computed } from '@angular/core';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  searchControl = new FormControl('');
  options = signal(['Products', 'Categories', 'Deals', 'New Arrivals']);

  filteredOptions = toSignal(
    this.searchControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterOptions(value || ''))
    ),
    { initialValue: this.options() }
  );

  private filterOptions(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options().filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }
}
