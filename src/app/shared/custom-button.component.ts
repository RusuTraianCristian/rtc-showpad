import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-custom-button',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (routerLink()) {
      <!-- Router Link Button -->
      <a
        [routerLink]="routerLink()"
        class="custom-button"
        [class]="additionalClasses()"
      >
        <ng-content />
      </a>
    } @else {
      <!-- Regular Button -->
      <button
        type="button"
        (click)="buttonClick.emit()"
        class="custom-button"
        [class]="additionalClasses()"
      >
        <ng-content />
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
      display: flex;
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
      -webkit-box-shadow: 0px 3px 5px 0px rgba(0,0,0,0.25);
      -moz-box-shadow: 0px 3px 5px 0px rgba(0,0,0,0.25);
      box-shadow: 0px 3px 5px 0px rgba(0,0,0,0.25);
      background-color: var(--amethyst-dark-property);
      background-image: linear-gradient(45deg, var(--amethyst-dark-property), var(--amethyst-light-property));
      transition: --amethyst-dark-property .25s, --amethyst-light-property .25s;
      color: #000000;
      height: 50px;
      line-height: 50px;
      padding: 0 20px;
      gap: calc(20px / 2);
      font-size: 18px;
      font-weight: 500;
      border-radius: 6px;
    }

    .custom-button:hover {
      --amethyst-dark-property: #8369B4FF;
      --amethyst-light-property: #8369B4FF;
    }
  `]
})
export class CustomButtonComponent {
  // Input for router link (optional)
  routerLink = input<string | null>(null);

  // Input for additional CSS classes
  additionalClasses = input<string>('');

  // Output for button click events
  buttonClick = output<void>();
}
