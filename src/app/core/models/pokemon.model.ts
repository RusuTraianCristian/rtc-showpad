// Core Pokemon models shared across the application

export interface Pokemon {
  id: number;
  name: string;
  imageUrl: string;
  officialArtwork: string;
  types: string[];
  height: number;
  weight: number;
  stats: Array<{
    name: string;
    value: number;
  }>;
}

export interface UserPokemon {
  id: number;
  name: string;
  imageUrl?: string;
}

export interface UserPokemonData {
  caught: UserPokemon[];
  wishlist: UserPokemon[];
}

export interface UserData {
  name: string;
  pokemons: UserPokemonData;
}

// PokeAPI response interfaces
export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonDetails {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other: {
      'official-artwork': {
        front_default: string | null;
      };
    };
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
}
