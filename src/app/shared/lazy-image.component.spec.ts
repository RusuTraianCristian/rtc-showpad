import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LazyImageComponent } from './lazy-image.component';

describe('LazyImageComponent', () => {
  let component: LazyImageComponent;
  let fixture: ComponentFixture<LazyImageComponent>;
  let mockIntersectionObserver: jasmine.Spy;
  let mockObserverInstance: jasmine.SpyObj<IntersectionObserver>;

  beforeEach(async () => {
    // Mock IntersectionObserver
    mockObserverInstance = jasmine.createSpyObj('IntersectionObserver', ['observe', 'unobserve', 'disconnect']);
    mockIntersectionObserver = jasmine.createSpy('IntersectionObserver').and.returnValue(mockObserverInstance);
    (window as any).IntersectionObserver = mockIntersectionObserver;

    await TestBed.configureTestingModule({
      imports: [LazyImageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LazyImageComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    delete (window as any).IntersectionObserver;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set up IntersectionObserver on init', () => {
    // Set required inputs
    fixture.componentRef.setInput('src', 'test-image.jpg');
    fixture.componentRef.setInput('alt', 'test image');

    component.ngOnInit();

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      jasmine.any(Function),
      { rootMargin: '50px' }
    );
    expect(mockObserverInstance.observe).toHaveBeenCalled();
  });

  it('should show image when intersecting after callback is triggered', () => {
    // Set required inputs
    fixture.componentRef.setInput('src', 'test-image.jpg');
    fixture.componentRef.setInput('alt', 'test image');

    component.ngOnInit();
    fixture.detectChanges();

    // Initially should show placeholder
    let compiled = fixture.nativeElement;
    let placeholder = compiled.querySelector('.animate-pulse');
    expect(placeholder).toBeTruthy();

    // Get the callback function passed to IntersectionObserver
    const callback = mockIntersectionObserver.calls.argsFor(0)[0];

    // Simulate intersection
    const mockEntry = { isIntersecting: true, target: fixture.nativeElement };
    callback([mockEntry]);
    fixture.detectChanges();

    // Should now show loading spinner
    compiled = fixture.nativeElement;
    const spinner = compiled.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('should show loading spinner when intersecting but image not loaded', () => {
    // Set required inputs
    fixture.componentRef.setInput('src', 'test-image.jpg');
    fixture.componentRef.setInput('alt', 'test image');

    component.ngOnInit();

    // Simulate intersection
    const callback = mockIntersectionObserver.calls.argsFor(0)[0];
    const mockEntry = { isIntersecting: true, target: fixture.nativeElement };
    callback([mockEntry]);

    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const spinner = compiled.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('should show error icon when image fails to load', () => {
    // Set required inputs
    fixture.componentRef.setInput('src', 'invalid-image.jpg');
    fixture.componentRef.setInput('alt', 'test image');

    component.onImageError();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const errorIcon = compiled.querySelector('svg');
    expect(errorIcon).toBeTruthy();
  });

  it('should fall back to immediate loading when IntersectionObserver is not available', () => {
    delete (window as any).IntersectionObserver;

    // Set required inputs
    fixture.componentRef.setInput('src', 'test-image.jpg');
    fixture.componentRef.setInput('alt', 'test image');

    component.ngOnInit();
    fixture.detectChanges();

    // Should show loading spinner immediately
    const compiled = fixture.nativeElement;
    const spinner = compiled.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('should disconnect observer on destroy', () => {
    // Set required inputs
    fixture.componentRef.setInput('src', 'test-image.jpg');
    fixture.componentRef.setInput('alt', 'test image');

    component.ngOnInit();
    component.ngOnDestroy();

    expect(mockObserverInstance.disconnect).toHaveBeenCalled();
  });

  it('should render placeholder when not intersecting', () => {
    // Set required inputs
    fixture.componentRef.setInput('src', 'test-image.jpg');
    fixture.componentRef.setInput('alt', 'test image');

    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const placeholder = compiled.querySelector('.animate-pulse');
    expect(placeholder).toBeTruthy();
  });

  it('should apply custom CSS classes', () => {
    // Set inputs with custom classes
    fixture.componentRef.setInput('src', 'test-image.jpg');
    fixture.componentRef.setInput('alt', 'test image');
    fixture.componentRef.setInput('containerClass', 'custom-container-class');

    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const container = compiled.querySelector('.custom-container-class');
    expect(container).toBeTruthy();
  });

  it('should have proper accessibility attributes', () => {
    // Set required inputs
    fixture.componentRef.setInput('src', 'test-image.jpg');
    fixture.componentRef.setInput('alt', 'Test Pokemon Image');

    component.ngOnInit();

    // Simulate intersection to show image
    const callback = mockIntersectionObserver.calls.argsFor(0)[0];
    const mockEntry = { isIntersecting: true, target: fixture.nativeElement };
    callback([mockEntry]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const image = compiled.querySelector('img');
    expect(image?.getAttribute('alt')).toBe('Test Pokemon Image');
  });
});
