import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PokemonFacade } from './pokemon.facade';
import { PokemonService } from '../../services/pokemon.service';
import { PokemonQueryService } from '../../services/pokemon-query.service';
import { AppStateService } from '../../services/app-state.service';
import { Pokemon, PaginatedPokemonResponse } from '../models/pokemon.model';

describe('PokemonFacade', () => {
  let facade: PokemonFacade;
  let mockPokemonService: jasmine.SpyObj<PokemonService>;
  let mockPokemonQueryService: jasmine.SpyObj<PokemonQueryService>;
  let mockAppStateService: jasmine.SpyObj<AppStateService>;

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
      { name: 'tackle', learnMethod: 'level-up', levelLearnedAt: 1 }
    ],
    officialArtwork: 'https://example.com/bulbasaur-artwork.png',
    sprites: {
      frontShiny: 'https://example.com/bulbasaur-shiny.png',
      backDefault: 'https://example.com/bulbasaur-back.png'
    }
  };

  const mockPaginatedResponse: PaginatedPokemonResponse = {
    pokemon: [mockPokemon],
    count: 1,
    next: null,
    previous: null,
    hasMore: false
  };

  beforeEach(() => {
    const pokemonServiceSpy = jasmine.createSpyObj('PokemonService', [
      'getPokemonListWithPagination',
      'getPokemonListWithDetails',
      'getPokemonDetails',
      'searchPokemon'
    ]);

    const pokemonQuerySpy = jasmine.createSpyObj('PokemonQueryService', [
      'pokemonListQuery',
      'pokemonPaginatedQuery',
      'pokemonSearchQuery',
      'userPokemonQuery',
      'catchPokemonMutation',
      'addToWishlistMutation',
      'releasePokemonMutation',
      'removeFromWishlistMutation',
      'prefetchPokemonList',
      'prefetchPokemonPaginated',
      'invalidateAllPokemonQueries'
    ]);

    const appStateSpy = jasmine.createSpyObj('AppStateService', [
      'addCaughtPokemon',
      'addToWishlist',
      'removeFromWishlist',
      'removeCaughtPokemon'
    ], {
      userPokemons: jasmine.createSpy().and.returnValue({ caught: [], wishlist: [] }),
      caughtPokemonCount: jasmine.createSpy().and.returnValue(0),
      wishlistPokemonCount: jasmine.createSpy().and.returnValue(0),
      hasUser: jasmine.createSpy().and.returnValue(false)
    });

    TestBed.configureTestingModule({
      providers: [
        PokemonFacade,
        { provide: PokemonService, useValue: pokemonServiceSpy },
        { provide: PokemonQueryService, useValue: pokemonQuerySpy },
        { provide: AppStateService, useValue: appStateSpy }
      ]
    });

    facade = TestBed.inject(PokemonFacade);
    mockPokemonService = TestBed.inject(PokemonService) as jasmine.SpyObj<PokemonService>;
    mockPokemonQueryService = TestBed.inject(PokemonQueryService) as jasmine.SpyObj<PokemonQueryService>;
    mockAppStateService = TestBed.inject(AppStateService) as jasmine.SpyObj<AppStateService>;
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  describe('loadPokemonListWithPagination', () => {
    it('should call pokemon service with correct parameters', () => {
      mockPokemonService.getPokemonListWithPagination.and.returnValue(of(mockPaginatedResponse));

      facade.loadPokemonListWithPagination(20, 0).subscribe();

      expect(mockPokemonService.getPokemonListWithPagination).toHaveBeenCalledWith(20, 0);
    });

    it('should return paginated pokemon response', (done) => {
      mockPokemonService.getPokemonListWithPagination.and.returnValue(of(mockPaginatedResponse));

      facade.loadPokemonListWithPagination(20, 0).subscribe(response => {
        expect(response).toEqual(mockPaginatedResponse);
        done();
      });
    });
  });

  describe('getPokemonDetails', () => {
    it('should call pokemon service with pokemon id', () => {
      mockPokemonService.getPokemonDetails.and.returnValue(of(mockPokemon));

      facade.getPokemonDetails(1).subscribe();

      expect(mockPokemonService.getPokemonDetails).toHaveBeenCalledWith(1);
    });

    it('should return pokemon details', (done) => {
      mockPokemonService.getPokemonDetails.and.returnValue(of(mockPokemon));

      facade.getPokemonDetails(1).subscribe(pokemon => {
        expect(pokemon).toEqual(mockPokemon);
        done();
      });
    });

    it('should handle string id', () => {
      mockPokemonService.getPokemonDetails.and.returnValue(of(mockPokemon));

      facade.getPokemonDetails('bulbasaur').subscribe();

      expect(mockPokemonService.getPokemonDetails).toHaveBeenCalledWith('bulbasaur');
    });
  });

  describe('searchPokemon', () => {
    it('should call pokemon service with search query', () => {
      mockPokemonService.searchPokemon.and.returnValue(of([mockPokemon]));

      facade.searchPokemon('bulba').subscribe();

      expect(mockPokemonService.searchPokemon).toHaveBeenCalledWith('bulba');
    });

    it('should return search results', (done) => {
      mockPokemonService.searchPokemon.and.returnValue(of([mockPokemon]));

      facade.searchPokemon('bulba').subscribe(results => {
        expect(results).toEqual([mockPokemon]);
        done();
      });
    });
  });

  describe('catchPokemon', () => {
    it('should add pokemon to caught collection', () => {
      mockAppStateService.hasUser.and.returnValue(true);

      facade.catchPokemon(mockPokemon);

      expect(mockAppStateService.addCaughtPokemon).toHaveBeenCalledWith({
        id: mockPokemon.id,
        name: mockPokemon.name,
        imageUrl: mockPokemon.officialArtwork
      });
    });

    it('should not add pokemon when user not logged in', () => {
      mockAppStateService.hasUser.and.returnValue(false);
      spyOn(console, 'warn');

      facade.catchPokemon(mockPokemon);

      expect(mockAppStateService.addCaughtPokemon).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('Cannot catch Pokemon: User not logged in');
    });
  });

  describe('releasePokemon', () => {
    it('should remove pokemon from caught collection', () => {
      facade.releasePokemon(1);

      expect(mockAppStateService.removeCaughtPokemon).toHaveBeenCalledWith(1);
    });
  });

  describe('addToWishlist', () => {
    it('should add pokemon to wishlist', () => {
      mockAppStateService.hasUser.and.returnValue(true);

      facade.addToWishlist(mockPokemon);

      expect(mockAppStateService.addToWishlist).toHaveBeenCalledWith({
        id: mockPokemon.id,
        name: mockPokemon.name,
        imageUrl: mockPokemon.officialArtwork
      });
    });

    it('should not add to wishlist when user not logged in', () => {
      mockAppStateService.hasUser.and.returnValue(false);
      spyOn(console, 'warn');

      facade.addToWishlist(mockPokemon);

      expect(mockAppStateService.addToWishlist).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('Cannot add to wishlist: User not logged in');
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove pokemon from wishlist', () => {
      facade.removeFromWishlist(1);

      expect(mockAppStateService.removeFromWishlist).toHaveBeenCalledWith(1);
    });
  });

  describe('isPokemonCaught', () => {
    it('should check if pokemon is caught', () => {
      const mockUserPokemons = {
        caught: [{ id: 1, name: 'bulbasaur', imageUrl: 'test.png' }],
        wishlist: []
      };
      mockAppStateService.userPokemons.and.returnValue(mockUserPokemons);

      const result = facade.isPokemonCaught(1);

      expect(result).toBeTruthy();
    });

    it('should return false when pokemon is not caught', () => {
      const mockUserPokemons = {
        caught: [],
        wishlist: []
      };
      mockAppStateService.userPokemons.and.returnValue(mockUserPokemons);

      const result = facade.isPokemonCaught(1);

      expect(result).toBeFalsy();
    });
  });

  describe('isPokemonInWishlist', () => {
    it('should check if pokemon is in wishlist', () => {
      const mockUserPokemons = {
        caught: [],
        wishlist: [{ id: 1, name: 'bulbasaur', imageUrl: 'test.png' }]
      };
      mockAppStateService.userPokemons.and.returnValue(mockUserPokemons);

      const result = facade.isPokemonInWishlist(1);

      expect(result).toBeTruthy();
    });

    it('should return false when pokemon is not in wishlist', () => {
      const mockUserPokemons = {
        caught: [],
        wishlist: []
      };
      mockAppStateService.userPokemons.and.returnValue(mockUserPokemons);

      const result = facade.isPokemonInWishlist(1);

      expect(result).toBeFalsy();
    });
  });

  describe('getTypeClass', () => {
    it('should return correct CSS class for fire type', () => {
      const result = facade.getTypeClass('fire');
      expect(result).toBe('bg-red-200 text-red-800');
    });

    it('should return correct CSS class for water type', () => {
      const result = facade.getTypeClass('water');
      expect(result).toBe('bg-blue-200 text-blue-800');
    });

    it('should return correct CSS class for grass type', () => {
      const result = facade.getTypeClass('grass');
      expect(result).toBe('bg-green-200 text-green-800');
    });

    it('should return default CSS class for unknown type', () => {
      const result = facade.getTypeClass('unknown');
      expect(result).toBe('bg-gray-200 text-gray-800');
    });
  });

  describe('error handling', () => {
    it('should handle errors when loading pokemon list', (done) => {
      const error = new Error('Network error');
      mockPokemonService.getPokemonListWithPagination.and.returnValue(throwError(() => error));

      facade.loadPokemonListWithPagination(20, 0).subscribe({
        next: () => fail('Should have failed'),
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });

    it('should handle errors when getting pokemon details', (done) => {
      const error = new Error('Pokemon not found');
      mockPokemonService.getPokemonDetails.and.returnValue(throwError(() => error));

      facade.getPokemonDetails(999).subscribe({
        next: () => fail('Should have failed'),
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('query methods', () => {
    it('should get pokemon list query', () => {
      facade.getPokemonListQuery(50, 0);
      expect(mockPokemonQueryService.pokemonListQuery).toHaveBeenCalledWith(50, 0);
    });

    it('should get pokemon paginated query', () => {
      facade.getPokemonPaginatedQuery(20, 0);
      expect(mockPokemonQueryService.pokemonPaginatedQuery).toHaveBeenCalledWith(20, 0);
    });

    it('should get pokemon search query', () => {
      facade.getPokemonSearchQuery('bulbasaur');
      expect(mockPokemonQueryService.pokemonSearchQuery).toHaveBeenCalledWith('bulbasaur');
    });

    it('should get user pokemon query', () => {
      facade.getUserPokemonQuery();
      expect(mockPokemonQueryService.userPokemonQuery).toHaveBeenCalled();
    });
  });

  describe('mutation methods', () => {
    it('should get catch pokemon mutation', () => {
      facade.getCatchPokemonMutation();
      expect(mockPokemonQueryService.catchPokemonMutation).toHaveBeenCalled();
    });

    it('should get add to wishlist mutation', () => {
      facade.getAddToWishlistMutation();
      expect(mockPokemonQueryService.addToWishlistMutation).toHaveBeenCalled();
    });

    it('should get release pokemon mutation', () => {
      facade.getReleasePokemonMutation();
      expect(mockPokemonQueryService.releasePokemonMutation).toHaveBeenCalled();
    });

    it('should get remove from wishlist mutation', () => {
      facade.getRemoveFromWishlistMutation();
      expect(mockPokemonQueryService.removeFromWishlistMutation).toHaveBeenCalled();
    });
  });

  describe('prefetch methods', () => {
    it('should prefetch pokemon list', () => {
      facade.prefetchPokemonList(50, 0);
      expect(mockPokemonQueryService.prefetchPokemonList).toHaveBeenCalledWith(50, 0);
    });

    it('should prefetch pokemon paginated', () => {
      facade.prefetchPokemonPaginated(20, 0);
      expect(mockPokemonQueryService.prefetchPokemonPaginated).toHaveBeenCalledWith(20, 0);
    });

    it('should invalidate all pokemon queries', () => {
      facade.invalidateAllPokemonQueries();
      expect(mockPokemonQueryService.invalidateAllPokemonQueries).toHaveBeenCalled();
    });
  });

  describe('loadPokemonList fallback method', () => {
    it('should call pokemon service for fallback method', () => {
      mockPokemonService.getPokemonListWithDetails = jasmine.createSpy('getPokemonListWithDetails').and.returnValue(of([mockPokemon]));

      facade.loadPokemonList(50, 0).subscribe();

      expect(mockPokemonService.getPokemonListWithDetails).toHaveBeenCalledWith(50, 0);
    });
  });

  describe('readonly signal properties', () => {
    it('should expose userPokemons from app state', () => {
      const result = facade.userPokemons();
      expect(result).toEqual({ caught: [], wishlist: [] });
    });

    it('should expose caughtPokemonCount from app state', () => {
      const result = facade.caughtPokemonCount();
      expect(result).toBe(0);
    });

    it('should expose wishlistPokemonCount from app state', () => {
      const result = facade.wishlistPokemonCount();
      expect(result).toBe(0);
    });

    it('should expose hasUser from app state', () => {
      const result = facade.hasUser();
      expect(result).toBe(false);
    });
  });
});
