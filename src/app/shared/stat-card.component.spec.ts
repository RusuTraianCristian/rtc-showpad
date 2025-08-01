import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatCardComponent } from './stat-card.component';
import { CommonModule } from '@angular/common';

describe('StatCardComponent', () => {
  let component: StatCardComponent;
  let fixture: ComponentFixture<StatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCardComponent, CommonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(StatCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title, value, and description correctly', () => {
    fixture.componentRef.setInput('title', 'Total Caught');
    fixture.componentRef.setInput('value', 42);
    fixture.componentRef.setInput('description', 'Pokemon caught so far');
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('h3');
    const valueElement = fixture.nativeElement.querySelector('.text-3xl');
    const descriptionElement = fixture.nativeElement.querySelector('.text-sm');

    expect(titleElement?.textContent.trim()).toBe('Total Caught');
    expect(valueElement?.textContent.trim()).toBe('42');
    expect(descriptionElement?.textContent.trim()).toBe('Pokemon caught so far');
  });

  it('should apply custom number color', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.componentRef.setInput('value', 10);
    fixture.componentRef.setInput('description', 'Test description');
    fixture.componentRef.setInput('numberColor', '#ff0000');
    fixture.detectChanges();

    const valueElement = fixture.nativeElement.querySelector('.text-3xl');
    expect(valueElement?.style.color).toBe('rgb(255, 0, 0)');
  });

  it('should use default number color when not specified', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.componentRef.setInput('value', 10);
    fixture.componentRef.setInput('description', 'Test description');
    fixture.detectChanges();

    const valueElement = fixture.nativeElement.querySelector('.text-3xl');
    expect(valueElement?.style.color).toBe('rgb(55, 65, 81)'); // #374151 in rgb
  });

  it('should display zero values correctly', () => {
    fixture.componentRef.setInput('title', 'Empty Collection');
    fixture.componentRef.setInput('value', 0);
    fixture.componentRef.setInput('description', 'No items yet');
    fixture.detectChanges();

    const valueElement = fixture.nativeElement.querySelector('.text-3xl');
    expect(valueElement?.textContent.trim()).toBe('0');
  });

  it('should handle large numbers correctly', () => {
    fixture.componentRef.setInput('title', 'Large Number');
    fixture.componentRef.setInput('value', 999999);
    fixture.componentRef.setInput('description', 'Very big number');
    fixture.detectChanges();

    const valueElement = fixture.nativeElement.querySelector('.text-3xl');
    expect(valueElement?.textContent.trim()).toBe('999999');
  });

  it('should handle negative numbers correctly', () => {
    fixture.componentRef.setInput('title', 'Negative Value');
    fixture.componentRef.setInput('value', -42);
    fixture.componentRef.setInput('description', 'Below zero');
    fixture.detectChanges();

    const valueElement = fixture.nativeElement.querySelector('.text-3xl');
    expect(valueElement?.textContent.trim()).toBe('-42');
  });

  it('should have proper styling classes', () => {
    fixture.componentRef.setInput('title', 'Test');
    fixture.componentRef.setInput('value', 10);
    fixture.componentRef.setInput('description', 'Test description');
    fixture.detectChanges();

    const cardElement = fixture.nativeElement.querySelector('div');
    expect(cardElement?.classList.contains('bg-white')).toBe(true);
    expect(cardElement?.classList.contains('p-6')).toBe(true);
    expect(cardElement?.classList.contains('rounded-lg')).toBe(true);
    expect(cardElement?.classList.contains('shadow-sm')).toBe(true);
  });

  it('should display empty strings correctly', () => {
    fixture.componentRef.setInput('title', '');
    fixture.componentRef.setInput('value', 0);
    fixture.componentRef.setInput('description', '');
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('h3');
    const descriptionElement = fixture.nativeElement.querySelector('.text-sm');

    expect(titleElement?.textContent.trim()).toBe('');
    expect(descriptionElement?.textContent.trim()).toBe('');
  });

  it('should handle long text correctly', () => {
    const longTitle = 'This is a very long title that might wrap to multiple lines';
    const longDescription = 'This is a very long description that might wrap to multiple lines and test how the component handles long text content';

    fixture.componentRef.setInput('title', longTitle);
    fixture.componentRef.setInput('value', 123);
    fixture.componentRef.setInput('description', longDescription);
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('h3');
    const descriptionElement = fixture.nativeElement.querySelector('.text-sm');

    expect(titleElement?.textContent.trim()).toBe(longTitle);
    expect(descriptionElement?.textContent.trim()).toBe(longDescription);
  });

  it('should be accessible with proper structure', () => {
    fixture.componentRef.setInput('title', 'Accessibility Test');
    fixture.componentRef.setInput('value', 42);
    fixture.componentRef.setInput('description', 'Testing accessibility');
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('h3');
    const valueElement = fixture.nativeElement.querySelector('.text-3xl');
    const descriptionElement = fixture.nativeElement.querySelector('.text-sm');

    expect(titleElement).toBeTruthy();
    expect(valueElement).toBeTruthy();
    expect(descriptionElement).toBeTruthy();

    // Verify semantic structure
    expect(titleElement?.tagName).toBe('H3');
    expect(valueElement?.tagName).toBe('P');
    expect(descriptionElement?.tagName).toBe('P');
  });
});
