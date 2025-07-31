import { Component, output, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppStateService } from '../services/app-state.service';
import { CustomButtonComponent } from './custom-button.component';

@Component({
  selector: 'app-user-modal',
  imports: [ReactiveFormsModule, CustomButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Modal Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h2 id="modal-title" class="text-2xl font-bold text-gray-900 mb-4 text-center">Welcome!</h2>
        <p id="modal-description" class="text-gray-600 mb-6 text-center">Please enter your name to continue</p>

        <div class="space-y-4">
          <div>
            <label for="userName" class="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              id="userName"
              type="text"
              [formControl]="nameControl"
              placeholder="Enter your name"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              [class.border-red-500]="nameControl.invalid && nameControl.touched"
              (keydown.enter)="saveUser()"
              [attr.aria-invalid]="nameControl.invalid && nameControl.touched"
              [attr.aria-describedby]="nameControl.invalid && nameControl.touched ? 'name-error' : null"
              autofocus
            />
            @if (nameControl.invalid && nameControl.touched) {
              <p class="text-red-500 text-sm mt-1">Name is required</p>
            }
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <app-custom-button
              (buttonClick)="saveUser()"
              [disabled]="nameControl.invalid || isSubmitting()"
            >
              @if (isSubmitting()) {
                <span>Saving...</span>
              } @else {
                <span>Continue</span>
              }
            </app-custom-button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserModalComponent {
  private appState = inject(AppStateService);

  nameControl = new FormControl('', [Validators.required, Validators.minLength(1)]);
  isSubmitting = signal(false);

  userSaved = output<string>();

  saveUser(): void {
    if (this.nameControl.valid && this.nameControl.value?.trim()) {
      this.isSubmitting.set(true);

      try {
        const name = this.nameControl.value.trim();
        this.appState.setUser(name);
        this.userSaved.emit(name);
      } catch (error) {
        console.error('Error saving user:', error);
      } finally {
        this.isSubmitting.set(false);
      }
    } else {
      this.nameControl.markAsTouched();
    }
  }
}
