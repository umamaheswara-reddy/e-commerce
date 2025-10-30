import {
  Component,
  Input,
  ChangeDetectionStrategy,
  signal,
  ChangeDetectorRef,
  inject,
  forwardRef,
  computed,
  Injector,
  AfterViewInit,
  DestroyRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { interval, map, distinctUntilChanged } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  E_INPUT_DEFAULT_OPTIONS,
  EInputOptions,
} from '../../tokens/e-ui.tokens';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'e-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
  <mat-form-field [appearance]="options().appearance || 'outline'" class="w-full">
      <mat-label>{{ label }}</mat-label>

      <input
        matInput
        [type]="type"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="markAsTouched()"
      />

      <mat-error *ngIf="showError()">
        {{ firstErrorMessage() }}
      </mat-error>
    </mat-form-field>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EInputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class EInputComponent implements ControlValueAccessor, AfterViewInit {
  @Input() label = '';
  @Input() type = 'text';

  value = signal('');
  options = signal<EInputOptions>({ appearance: 'outline', floatLabel:'always' });

  // Resolve NgControl lazily to avoid circular DI when FormControlName and
  // this component are constructed on the same element.
  private injector = inject(Injector);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID) as Object;
  private ngControl?: NgControl | null = null;
  private defaults = inject(E_INPUT_DEFAULT_OPTIONS);
  private cdr = inject(ChangeDetectorRef);

  private onChange = (v: any) => {};
  private onTouched = () => {};

  constructor() {
    this.options.set(this.defaults);
    // Do not resolve NgControl here; resolve in ngAfterViewInit instead.
  }

  ngAfterViewInit(): void {
    // Try to retrieve NgControl from the element injector now that child
    // directives (e.g., FormControlName) are constructed.
    try {
      this.ngControl = this.injector.get(NgControl, null as any);
    } catch {
      this.ngControl = null;
    }

    if (this.ngControl) {
      // Trigger change detection when control status changes
      this.ngControl.control?.statusChanges
        ?.pipe(startWith(this.ngControl.control.status), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.cdr.markForCheck();
        });

      // Only start polling in the browser — polling uses setInterval which
      // prevents Angular Universal (SSR) from becoming stable and will cause
      // server-side render timeouts. For SSR we skip polling and rely on the
      // parent to trigger change detection when marking the form touched.
  if (isPlatformBrowser(this.platformId as Object)) {
        interval(120)
          .pipe(
            map(() => !!this.ngControl?.control?.touched),
            distinctUntilChanged(),
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe(() => this.cdr.markForCheck());
      }
    }
  }

  writeValue(v: any): void {
    this.value.set(v ?? '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  markAsTouched() {
    this.onTouched();
  }

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  showError() {
    const control = this.ngControl?.control;
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  firstErrorMessage(): string | null {
    const control = this.ngControl?.control;
    if (!control?.errors) return null;

    const errors = control.errors;
    if (errors['required']) return `${this.label} is required`;
    if (errors['email']) return `Please enter a valid email`;
    if (errors['minlength'])
      return `${this.label} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength'])
      return `${this.label} must be at most ${errors['maxlength'].requiredLength} characters`;
    return `Invalid ${this.label}`;
  }
}
