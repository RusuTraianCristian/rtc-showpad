export interface Pokemon {
  id: number;
  name: string;
  imageUrl: string;
  officialArtwork: string;
  types: string[];
  height: number;
  weight: number;
  baseExperience?: number;
  abilities?: Array<{
    name: string;
    isHidden: boolean;
  }>;
  sprites?: {
    frontShiny?: string;
    backDefault?: string;
  };
  stats: Array<{
    name: string;
    baseStat: number;
  }>;
  moves?: Array<{
    name: string;
    levelLearnedAt?: number;
    learnMethod: string;
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

export interface PaginatedPokemonResponse {
  pokemon: Pokemon[];
  count: number;
  next: string | null;
  previous: string | null;
  hasMore: boolean;
}

export interface UserData {
  name: string;
  pokemons: UserPokemonData;
}

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
  base_experience?: number;
  abilities?: Array<{
    ability: {
      name: string;
    };
    is_hidden: boolean;
  }>;
  sprites: {
    front_default: string | null;
    front_shiny?: string | null;
    back_default?: string | null;
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
  moves?: Array<{
    move: {
      name: string;
      url: string;
    };
    version_group_details: Array<{
      level_learned_at: number;
      move_learn_method: {
        name: string;
      };
      version_group: {
        name: string;
      };
    }>;
  }>;
}

export interface MoveDetails {
  id: number;
  name: string;
  power?: number;
  pp?: number;
  accuracy?: number;
  type: {
    name: string;
  };
  damage_class: {
    name: string;
  };
  effect_entries: Array<{
    effect: string;
    language: {
      name: string;
    };
  }>;
}
