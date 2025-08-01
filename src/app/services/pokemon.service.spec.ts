import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PokemonService } from './pokemon.service';
import { Pokemon, PokemonListResponse, PokemonDetails } from '../core/models/pokemon.model';
import { provideHttpClient } from '@angular/common/http';

describe('PokemonService', () => {
  let service: PokemonService;
  let httpMock: HttpTestingController;

  const mockPokemonListResponse: PokemonListResponse = {
    count: 1302,
    next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
    previous: null,
    results: [
      { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' }
    ]
  };

  const mockPokemonDetails: PokemonDetails = {
    id: 1,
    name: 'bulbasaur',
    sprites: {
      front_default: 'https://example.com/bulbasaur.png',
      front_shiny: 'https://example.com/bulbasaur-shiny.png',
      back_default: 'https://example.com/bulbasaur-back.png',
      other: {
        'official-artwork': {
          front_default: 'https://example.com/bulbasaur-artwork.png'
        }
      }
    },
    types: [
      {
        type: { name: 'grass' }
      }
    ],
    stats: [
      {
        base_stat: 45,
        stat: { name: 'hp' }
      }
    ],
    height: 7,
    weight: 69,
    base_experience: 64,
    abilities: [
      {
        ability: { name: 'overgrow' },
        is_hidden: false
      }
    ],
    moves: [
      {
        move: { name: 'tackle', url: 'https://pokeapi.co/api/v2/move/33/' },
        version_group_details: [
          {
            level_learned_at: 1,
            move_learn_method: { name: 'level-up' },
            version_group: { name: 'red-blue' }
          }
        ]
      }
    ]
  };

  const expectedTransformedPokemon: Pokemon = {
    id: 1,
    name: 'bulbasaur',
    imageUrl: 'https://example.com/bulbasaur.png',
    officialArtwork: 'https://example.com/bulbasaur-artwork.png',
    types: ['grass'],
    height: 7,
    weight: 69,
    baseExperience: 64,
    abilities: [
      {
        name: 'overgrow',
        isHidden: false
      }
    ],
    sprites: {
      frontShiny: 'https://example.com/bulbasaur-shiny.png',
      backDefault: 'https://example.com/bulbasaur-back.png'
    },
    stats: [
      {
        name: 'hp',
        baseStat: 45
      }
    ],
    moves: [
      {
        name: 'tackle',
        levelLearnedAt: 1,
        learnMethod: 'level-up'
      }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PokemonService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(PokemonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPokemonList', () => {
    it('should fetch pokemon list with default pagination', () => {
      service.getPokemonList().subscribe((response: PokemonListResponse) => {
        expect(response).toEqual(mockPokemonListResponse);
        expect(response.results.length).toBe(2);
      });

      const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon?limit=20&offset=0');
      expect(req.request.method).toBe('GET');
      req.flush(mockPokemonListResponse);
    });

    it('should fetch pokemon list with custom pagination', () => {
      const limit = 10;
      const offset = 10;

      service.getPokemonList(limit, offset).subscribe((response: PokemonListResponse) => {
        expect(response).toEqual(mockPokemonListResponse);
      });

      const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon?limit=10&offset=10');
      expect(req.request.method).toBe('GET');
      req.flush(mockPokemonListResponse);
    });

    it('should handle HTTP errors gracefully', () => {
      service.getPokemonList().subscribe((response: any) => {
        expect(response.count).toBe(0);
        expect(response.results.length).toBe(0);
        expect(response.error).toBeDefined();
      });

      const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon?limit=20&offset=0');
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getPokemonDetails', () => {
    it('should fetch and transform pokemon details by id', () => {
      const pokemonId = 1;

      service.getPokemonDetails(pokemonId).subscribe((pokemon: Pokemon | null) => {
        expect(pokemon).toBeTruthy();
        expect(pokemon!.id).toBe(1);
        expect(pokemon!.name).toBe('bulbasaur');
        expect(pokemon!.types).toEqual(['grass']);
        expect(pokemon!.stats[0].name).toBe('hp');
        expect(pokemon!.stats[0].baseStat).toBe(45);
      });

      const req = httpMock.expectOne(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPokemonDetails);
    });

    it('should return null for 404 error', () => {
      const pokemonId = 99999;

      service.getPokemonDetails(pokemonId).subscribe((pokemon: Pokemon | null) => {
        expect(pokemon).toBeNull();
      });

      const req = httpMock.expectOne(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should fetch pokemon by name', () => {
      const pokemonName = 'bulbasaur';

      service.getPokemonDetails(pokemonName).subscribe((pokemon: Pokemon | null) => {
        expect(pokemon).toBeTruthy();
        expect(pokemon!.name).toBe('bulbasaur');
      });

      const req = httpMock.expectOne(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPokemonDetails);
    });
  });

  describe('searchPokemon', () => {
    it('should search pokemons by partial name match', () => {
      const searchTerm = 'bulb';

      service.searchPokemon(searchTerm).subscribe((pokemon: Pokemon[]) => {
        expect(pokemon.length).toBeGreaterThan(0);
        expect(pokemon[0].name).toContain('bulb');
      });

      // First request for the pokemon list
      const listReq = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon?limit=1000&offset=0');
      listReq.flush(mockPokemonListResponse);

      // Second request for pokemon details
      const detailReq = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/1');
      detailReq.flush(mockPokemonDetails);
    });

    it('should return default list for empty search', () => {
      const searchTerm = '';

      service.searchPokemon(searchTerm).subscribe((pokemon: Pokemon[]) => {
        expect(pokemon.length).toBeGreaterThan(0);
      });

      // First request for the pokemon list
      const listReq = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon?limit=20&offset=0');
      listReq.flush(mockPokemonListResponse);

      // Requests for pokemon details
      const detailReq1 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/1');
      detailReq1.flush(mockPokemonDetails);

      const detailReq2 = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/2');
      detailReq2.flush({...mockPokemonDetails, id: 2, name: 'ivysaur'});
    });

    it('should return empty array for no matches', () => {
      const searchTerm = 'nonexistent';

      service.searchPokemon(searchTerm).subscribe((pokemon: Pokemon[]) => {
        expect(pokemon.length).toBe(0);
      });

      const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon?limit=1000&offset=0');
      req.flush({
        count: 1302,
        next: null,
        previous: null,
        results: mockPokemonListResponse.results
      });
    });
  });

  describe('getPokemonListWithPagination', () => {
    it('should fetch pokemon list with pagination and details', () => {
      service.getPokemonListWithPagination(2, 0).subscribe(response => {
        expect(response.pokemon.length).toBe(1);
        expect(response.count).toBe(1302);
        expect(response.hasMore).toBe(true);
      });

      // First request for the pokemon list
      const listReq = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon?limit=2&offset=0');
      listReq.flush({
        ...mockPokemonListResponse,
        results: [mockPokemonListResponse.results[0]]
      });

      // Second request for pokemon details
      const detailReq = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/1');
      detailReq.flush(mockPokemonDetails);
    });
  });
});
