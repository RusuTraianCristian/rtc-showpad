import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

export type ButtonVariant = 'normal' | 'muted' | 'heart' | 'success';

@Component({
  selector: 'app-custom-button',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (routerLink()) {
      <!-- Router Link Button -->
      <a
        [routerLink]="routerLink()"
        [class]="buttonClasses()"
      >
        @if (variant() === 'heart') {
          <!-- Heart Icon -->
          <svg width="16" height="16" viewBox="0 0 24 24" [attr.fill]="wishlisted() ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        } @else {
          <ng-content></ng-content>
        }
      </a>
    } @else {
      <!-- Regular Button -->
      <button
        type="button"
        (click)="buttonClick.emit()"
        [class]="buttonClasses()"
        [disabled]="disabled()"
      >
        @if (variant() === 'heart') {
          <!-- Heart Icon -->
          <svg width="16" height="16" viewBox="0 0 24 24" [attr.fill]="wishlisted() ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        } @else {
          <ng-content></ng-content>
        }
      </button>
    }
  `,
  styles: [`
    @property --amethyst-dark-property {
      syntax: '<color>';
      inherits: true;
      initial-value: #8369B4FF;
    }

    @property --amethyst-light-property {
      syntax: '<color>';
      inherits: true;
      initial-value: #CCB6F1FF;
    }

    .custom-button {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      align-content: center;
      justify-items: center;
      outline: none;
      border: none;
      cursor: pointer;
      user-select: none;
      text-decoration: none;
      -webkit-transition: all .25s ease-in-out;
      -moz-transition: all .25s ease-in-out;
      -ms-transition: all .25s ease-in-out;
      -o-transition: all .25s ease-in-out;
      transition: all .25s ease-in-out;
      font-family: var(--font-inter, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
      text-align: center;
      box-sizing: border-box;
      font-weight: 500;
      border-radius: 6px;
      width: fit-content;
    }

    /* Normal variant - main branded style */
    .custom-button.normal {
      -webkit-box-shadow: 0px 3px 5px 0px rgba(0,0,0,0.25);
      -moz-box-shadow: 0px 3px 5px 0px rgba(0,0,0,0.25);
      box-shadow: 0px 3px 5px 0px rgba(0,0,0,0.25);
      background-color: var(--amethyst-dark-property);
      background-image: linear-gradient(45deg, var(--amethyst-dark-property), var(--amethyst-light-property));
      transition: --amethyst-dark-property .25s, --amethyst-light-property .25s;
      color: #000000;
      min-height: 30px;
      line-height: 1.4;
      padding: 12px 20px;
      gap: calc(20px / 2);
      font-size: 18px;
    }

    .custom-button.normal:hover {
      --amethyst-dark-property: #8369B4FF;
      --amethyst-light-property: #8369B4FF;
    }

    /* Muted variant - subtle gray style */
    .custom-button.muted {
      background-color: #f3f4f6;
      color: #374151;
      min-height: 30px;
      line-height: 1.4;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
    }

    .custom-button.muted:hover {
      background-color: #e5e7eb;
    }

    /* Success variant - muted green style for caught Pokemon */
    .custom-button.success {
      background-color: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
      min-height: 30px;
      line-height: 1.4;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
    }

    .custom-button.success:hover {
      background-color: #dcfce7;
    }

    /* Heart variant - circular button with heart icon */
    .custom-button.heart {
      background-color: #ffffff;
      border: 2px solid #e5e7eb;
      color: #374151;
      min-height: 32px;
      min-width: 32px;
      line-height: 1;
      padding: 6px;
      font-size: 16px;
      font-weight: 400;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .custom-button.heart:hover {
      border-color: #d1d5db;
      background-color: #f9fafb;
    }

    .custom-button.heart.wishlisted {
      color: #dc2626;
      border-color: #dc2626;
      background-color: #fef2f2;
    }

    .custom-button.heart.wishlisted:hover {
      background-color: #fee2e2;
    }

    .custom-button:disabled,
    .custom-button[aria-disabled="true"] {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .custom-button:disabled:hover,
    .custom-button[aria-disabled="true"]:hover {
      background-color: inherit;
      --amethyst-dark-property: #8369B4FF;
      --amethyst-light-property: #CCB6F1FF;
    }

    .custom-button.muted:disabled:hover,
    .custom-button.muted[aria-disabled="true"]:hover {
      background-color: #f3f4f6;
    }

    .custom-button.success:disabled:hover,
    .custom-button.success[aria-disabled="true"]:hover {
      background-color: #dcfce7;
    }
  `]
})
export class CustomButtonComponent {
  // Input for router link (optional)
  routerLink = input<string | null>(null);

  // Input for button variant
  variant = input<ButtonVariant>('normal');

  // Input for disabled state
  disabled = input<boolean>(false);

  // Input for additional CSS classes
  additionalClasses = input<string>('');

  // Input for wishlisted state (for heart variant)
  wishlisted = input<boolean>(false);

  // Output for button click events
  buttonClick = output<void>();

  // Computed button classes
  protected buttonClasses = (): string => {
    const baseClass = 'custom-button';
    const variantClass = this.variant();
    const additional = this.additionalClasses();
    const wishlistedClass = this.variant() === 'heart' && this.wishlisted() ? 'wishlisted' : '';

    return `${baseClass} ${variantClass} ${wishlistedClass} ${additional}`.trim();
  };
}
