import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title() }}</h3>
      <p class="text-3xl font-bold" [style.color]="numberColor()">{{ value() }}</p>
      <p class="text-sm text-gray-500 mt-1">{{ description() }}</p>
    </div>
  `
})
export class StatCardComponent {
  title = input.required<string>();
  value = input.required<number>();
  description = input.required<string>();
  numberColor = input<string>('#374151'); // default gray color
}
