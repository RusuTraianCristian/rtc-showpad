import { Component, ChangeDetectionStrategy, input, signal, computed, ElementRef, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lazy-image',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative overflow-hidden" [class]="containerClass()">
      @if (isIntersecting() && !imageError()) {
        <img
          [src]="src()"
          [alt]="alt()"
          [class]="imageClass()"
          (load)="onImageLoad()"
          (error)="onImageError()"
          [style.opacity]="imageLoaded() ? '1' : '0'"
          style="transition: opacity 0.3s ease-in-out;"
          loading="lazy"
        />
      }

      @if (!isIntersecting() || (!imageLoaded() && !imageError())) {
        <div
          [class]="placeholderClass()"
          class="flex items-center justify-center bg-gray-100"
        >
          @if (!isIntersecting()) {
            <!-- Placeholder while not in viewport -->
            <div class="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
          } @else if (!imageLoaded() && !imageError()) {
            <!-- Loading spinner -->
            <div class="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-500"></div>
          }
        </div>
      }

      @if (imageError()) {
        <div
          [class]="placeholderClass()"
          class="flex items-center justify-center bg-gray-100"
        >
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
      }
    </div>
  `
})
export class LazyImageComponent implements OnInit, OnDestroy {
  src = input.required<string>();
  alt = input.required<string>();
  imageClass = input<string>('');
  containerClass = input<string>('');
  placeholderClass = input<string>('w-full h-full');

  private elementRef = inject(ElementRef);
  private observer?: IntersectionObserver;

  protected isIntersecting = signal(false);
  protected imageLoaded = signal(false);
  protected imageError = signal(false);

  ngOnInit(): void {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.isIntersecting.set(true);
              this.observer?.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px' // Start loading 50px before image enters viewport
        }
      );

      this.observer.observe(this.elementRef.nativeElement);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.isIntersecting.set(true);
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }

  onImageError(): void {
    this.imageError.set(true);
  }
}
