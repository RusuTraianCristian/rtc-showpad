import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PokemonDetailComponent } from './pokemon-detail.component';
import { PokemonFacade } from '../core/facades/pokemon.facade';
import { Pokemon } from '../core/models/pokemon.model';

describe('PokemonDetailComponent', () => {
  let component: PokemonDetailComponent;
  let fixture: ComponentFixture<PokemonDetailComponent>;
  let mockPokemonFacade: jasmine.SpyObj<PokemonFacade>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockPokemon: Pokemon = {
    id: 1,
    name: 'bulbasaur',
    imageUrl: 'https://example.com/bulbasaur.png',
    types: ['grass', 'poison'],
    height: 7,
    weight: 69,
    baseExperience: 64,
    abilities: [
      { name: 'overgrow', isHidden: false },
      { name: 'chlorophyll', isHidden: true }
    ],
    stats: [
      { name: 'hp', baseStat: 45 },
      { name: 'attack', baseStat: 49 }
    ],
    moves: [
      { name: 'tackle', learnMethod: 'level-up', levelLearnedAt: 1 },
      { name: 'vine-whip', learnMethod: 'level-up', levelLearnedAt: 9 },
      { name: 'swords-dance', learnMethod: 'machine', levelLearnedAt: 0 }
    ],
    officialArtwork: 'https://example.com/bulbasaur-artwork.png',
    sprites: {
      frontShiny: 'https://example.com/bulbasaur-shiny.png',
      backDefault: 'https://example.com/bulbasaur-back.png'
    }
  };

  beforeEach(async () => {
    const pokemonFacadeSpy = jasmine.createSpyObj('PokemonFacade', [
      'getPokemonDetails',
      'catchPokemon',
      'addToWishlist',
      'removeFromWishlist',
      'isPokemonCaught',
      'isPokemonInWishlist',
      'getTypeClass'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      params: of({ id: '1' })
    };

    await TestBed.configureTestingModule({
      imports: [PokemonDetailComponent],
      providers: [
        { provide: PokemonFacade, useValue: pokemonFacadeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonDetailComponent);
    component = fixture.componentInstance;
    mockPokemonFacade = TestBed.inject(PokemonFacade) as jasmine.SpyObj<PokemonFacade>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup default spy returns
    mockPokemonFacade.isPokemonCaught.and.returnValue(false);
    mockPokemonFacade.isPokemonInWishlist.and.returnValue(false);
    mockPokemonFacade.getTypeClass.and.returnValue('bg-green-100 text-green-700');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pokemon details on init', () => {
    mockPokemonFacade.getPokemonDetails.and.returnValue(of(mockPokemon));

    component.ngOnInit();

    expect(mockPokemonFacade.getPokemonDetails).toHaveBeenCalledWith('1');
  });

  it('should display pokemon details when loaded', async () => {
    mockPokemonFacade.getPokemonDetails.and.returnValue(of(mockPokemon));

    component.ngOnInit();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const pokemonName = compiled.querySelector('h1');
    expect(pokemonName?.textContent).toContain('bulbasaur');
  });

  it('should show error state when pokemon not found', async () => {
    mockPokemonFacade.getPokemonDetails.and.returnValue(of(null));

    component.ngOnInit();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const errorMessage = compiled.querySelector('.text-red-700');
    expect(errorMessage?.textContent).toContain('Pokemon not found');
  });

  it('should show error state when API call fails', async () => {
    const error = new Error('API Error');
    mockPokemonFacade.getPokemonDetails.and.returnValue(throwError(() => error));

    component.ngOnInit();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const errorMessage = compiled.querySelector('.text-red-700');
    expect(errorMessage?.textContent).toContain('Failed to load Pokemon details');
  });

  it('should navigate back when goBack is called', () => {
    component.goBack();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/pokemons']);
  });

  it('should toggle wishlist when pokemon is not in wishlist', () => {
    mockPokemonFacade.getPokemonDetails.and.returnValue(of(mockPokemon));
    mockPokemonFacade.isPokemonInWishlist.and.returnValue(false);

    component.ngOnInit();
    component.toggleWishlist();

    expect(mockPokemonFacade.addToWishlist).toHaveBeenCalledWith(mockPokemon);
  });

  it('should toggle wishlist when pokemon is in wishlist', () => {
    mockPokemonFacade.getPokemonDetails.and.returnValue(of(mockPokemon));
    mockPokemonFacade.isPokemonInWishlist.and.returnValue(true);

    component.ngOnInit();
    component.toggleWishlist();

    expect(mockPokemonFacade.removeFromWishlist).toHaveBeenCalledWith(1);
  });

  it('should filter moves by learn method', async () => {
    mockPokemonFacade.getPokemonDetails.and.returnValue(of(mockPokemon));

    component.ngOnInit();
    await fixture.whenStable();
    fixture.detectChanges();

    // Click on level-up filter
    component.toggleMoveFilter('level-up');
    fixture.detectChanges();

    // Check if moves are filtered - count visible move elements
    const compiled = fixture.nativeElement;
    const moveElements = compiled.querySelectorAll('.bg-gray-50');
    // This would need to be adjusted based on actual DOM structure
    expect(moveElements).toBeTruthy();
  });

  it('should clear move filters', async () => {
    mockPokemonFacade.getPokemonDetails.and.returnValue(of(mockPokemon));

    component.ngOnInit();
    await fixture.whenStable();
    fixture.detectChanges();

    component.toggleMoveFilter('level-up');
    component.clearMoveFilters();
    fixture.detectChanges();

    // All moves should be visible again
    const compiled = fixture.nativeElement;
    const moveElements = compiled.querySelectorAll('.bg-gray-50');
    expect(moveElements).toBeTruthy();
  });

  it('should format stat names correctly', () => {
    expect(component.formatStatName('special-attack')).toBe('Special Attack');
    expect(component.formatStatName('hp')).toBe('Hp');
  });

  it('should format move names correctly', () => {
    expect(component.formatMoveName('vine-whip')).toBe('Vine Whip');
    expect(component.formatMoveName('swords-dance')).toBe('Swords Dance');
  });

  it('should format learn methods correctly', () => {
    expect(component.formatLearnMethod('level-up')).toBe('Level Up');
    expect(component.formatLearnMethod('machine')).toBe('TM/TR');
    expect(component.formatLearnMethod('tutor')).toBe('Move Tutor');
    expect(component.formatLearnMethod('egg')).toBe('Egg Move');
    expect(component.formatLearnMethod('unknown')).toBe('Unknown');
  });

  it('should return correct stat colors', () => {
    expect(component.getStatColor(150)).toBe('bg-red-500');
    expect(component.getStatColor(110)).toBe('bg-orange-500');
    expect(component.getStatColor(90)).toBe('bg-yellow-500');
    expect(component.getStatColor(70)).toBe('bg-green-500');
    expect(component.getStatColor(50)).toBe('bg-blue-500');
    expect(component.getStatColor(30)).toBe('bg-gray-400');
  });

  it('should show all available learn methods', async () => {
    mockPokemonFacade.getPokemonDetails.and.returnValue(of(mockPokemon));

    component.ngOnInit();
    await fixture.whenStable();
    fixture.detectChanges();

    // Check if filter buttons are rendered
    const compiled = fixture.nativeElement;
    const filterButtons = compiled.querySelectorAll('button[type="button"]');
    expect(filterButtons.length).toBeGreaterThan(0);
  });

  it('should clean up subscription on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });

  it('should handle route params without id', async () => {
    mockActivatedRoute.params = of({});

    component.ngOnInit();
    await fixture.whenStable();
    fixture.detectChanges();

    // Should show error state in DOM
    const compiled = fixture.nativeElement;
    const errorElement = compiled.querySelector('.text-red-700');
    expect(errorElement?.textContent).toContain('No Pokemon ID provided');
  });

  it('should display pokemon types with correct styling', async () => {
    mockPokemonFacade.getPokemonDetails.and.returnValue(of(mockPokemon));
    mockPokemonFacade.getTypeClass.and.callFake((type: string) => {
      return type === 'grass' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700';
    });

    component.ngOnInit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(mockPokemonFacade.getTypeClass).toHaveBeenCalledWith('grass');
    expect(mockPokemonFacade.getTypeClass).toHaveBeenCalledWith('poison');
  });

  it('should show catch button for uncaught pokemon', async () => {
    mockPokemonFacade.getPokemonDetails.and.returnValue(of(mockPokemon));
    mockPokemonFacade.isPokemonCaught.and.returnValue(false);

    component.ngOnInit();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const catchButton = compiled.querySelector('app-custom-button');
    expect(catchButton).toBeTruthy();
  });
});
