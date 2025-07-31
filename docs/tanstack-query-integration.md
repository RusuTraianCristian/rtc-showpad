# TanStack Query Integration Guide

This guide explains how TanStack Query has been integrated into the Pokedex application to provide advanced data fetching, caching, and state synchronization.

## Architecture Overview

The integration follows a layered architecture:

```
UI Components
     ↓
TanStack Query Layer
     ↓
Data Services (PokemonService, UserService)
     ↓
State Management (AppStateService)
```

## Key Benefits

1. **Automatic Caching**: Data is cached automatically with customizable stale times
2. **Background Updates**: Data refetches in the background when stale
3. **Optimistic Updates**: UI updates immediately before server confirmation
4. **Loading & Error States**: Built-in reactive loading and error handling
5. **Cache Invalidation**: Smart cache invalidation when data changes
6. **Prefetching**: Preload data for better user experience

## Services Overview

### 1. PokemonQueryService
Main service that bridges Pokemon data fetching with TanStack Query.

**Key Methods:**
- `pokemonListQuery(limit, offset)` - Cached Pokemon list with pagination
- `pokemonSearchQuery(query)` - Debounced search with caching
- `catchPokemonMutation()` - Optimistic Pokemon catching
- `addToWishlistMutation()` - Optimistic wishlist updates
- `userPokemonQuery()` - Real-time user collection data

### 2. PokemonTanstackExample
Simplified example service showing basic TanStack Query patterns.

**Key Methods:**
- `usePokemonList()` - Basic Pokemon list query
- `useCatchPokemon()` - Mutation with optimistic updates
- `useUserPokemon()` - User data synchronization

## Usage in Components

### Basic Query Usage

```typescript
@Component({...})
export class MyComponent {
  private tanstackService = inject(PokemonTanstackExample);
  
  // Create query
  protected pokemonQuery = this.tanstackService.usePokemonList(20, 0);
  
  // Access data in template
  // pokemonQuery.data() - the fetched data
  // pokemonQuery.isLoading() - loading state
  // pokemonQuery.error() - error state
  // pokemonQuery.isSuccess() - success state
}
```

### Mutation Usage

```typescript
@Component({...})
export class MyComponent {
  private tanstackService = inject(PokemonTanstackExample);
  
  // Create mutation
  protected catchMutation = this.tanstackService.useCatchPokemon();
  
  protected catchPokemon(pokemon: Pokemon): void {
    // Execute mutation
    this.catchMutation.mutate(pokemon);
  }
  
  // Check status in template
  // catchMutation.isPending() - is executing
  // catchMutation.isSuccess() - completed successfully
  // catchMutation.error() - error occurred
}
```

## Template Examples

### Displaying Query Data

```html
@if (pokemonQuery.isLoading()) {
  <div>Loading...</div>
} @else if (pokemonQuery.error()) {
  <div>Error: {{ pokemonQuery.error()?.message }}</div>
} @else if (pokemonQuery.data()) {
  @for (pokemon of pokemonQuery.data(); track pokemon.id) {
    <div>{{ pokemon.name }}</div>
  }
}
```

### Mutation Buttons

```html
<button
  (click)="catchPokemon(pokemon)"
  [disabled]="catchMutation.isPending()"
>
  @if (catchMutation.isPending()) {
    Catching...
  } @else {
    Catch Pokemon
  }
</button>
```

## Advanced Features

### Cache Management

```typescript
// Invalidate specific queries
this.queryClient.invalidateQueries({ queryKey: ['pokemon-list'] });

// Prefetch data
this.queryClient.prefetchQuery({
  queryKey: ['pokemon-list', 20, 20],
  queryFn: () => this.fetchPokemon(20, 20)
});

// Update cache directly
this.queryClient.setQueryData(['pokemon-list'], newData);
```

### Optimistic Updates

```typescript
useCatchPokemon() {
  return injectMutation(() => ({
    mutationFn: async (pokemon: Pokemon) => {
      // Actual API call
      return this.apiCall(pokemon);
    },
    onMutate: async (pokemon) => {
      // Optimistic update - runs immediately
      console.log(`Catching ${pokemon.name}...`);
    },
    onSuccess: (result) => {
      // Invalidate related queries
      this.queryClient.invalidateQueries({ queryKey: ['user-pokemon'] });
    },
    onError: (error, pokemon, context) => {
      // Handle error and potentially rollback
      console.error(`Failed to catch ${pokemon.name}`);
    }
  }));
}
```

### Query Options

```typescript
pokemonListQuery() {
  return injectQuery(() => ({
    queryKey: ['pokemon-list'],
    queryFn: () => this.fetchPokemon(),
    staleTime: 5 * 60 * 1000,    // 5 minutes
    gcTime: 10 * 60 * 1000,      // 10 minutes
    enabled: this.shouldFetch(),  // Conditional fetching
    retry: 3,                     // Retry failed requests
    retryDelay: 1000,            // Delay between retries
  }));
}
```

## Integration with Existing Architecture

### With AppStateService
TanStack Query mutations update the AppStateService, which then propagates changes via signals:

```typescript
onSuccess: (userPokemon) => {
  // Update state service
  this.appState.addCaughtPokemon(userPokemon);
  
  // Invalidate queries to refetch
  this.queryClient.invalidateQueries({ queryKey: ['user-pokemon'] });
}
```

### With PokemonFacade
The facade exposes both TanStack Query methods and legacy methods:

```typescript
// New TanStack Query methods
getPokemonListQuery(limit, offset) // Returns query with caching
getCatchPokemonMutation()          // Returns mutation with optimistic updates

// Legacy methods (still available)
loadPokemonList(limit, offset)     // Returns Observable
catchPokemon(pokemon)              // Direct state update
```

## Migration Strategy

1. **Gradual Migration**: Start by using TanStack Query for new features
2. **Parallel Implementation**: Keep both TanStack Query and legacy methods
3. **Component by Component**: Migrate components one at a time
4. **Fallback Support**: Legacy methods remain available for compatibility

## Best Practices

1. **Use Descriptive Query Keys**: `['pokemon-list', limit, offset]` is better than `['pokemon']`
2. **Set Appropriate Stale Times**: Balance between fresh data and performance
3. **Leverage Background Updates**: Let TanStack Query handle background refreshing
4. **Use Mutations for State Changes**: Prefer mutations over direct state updates
5. **Invalidate Related Queries**: When data changes, invalidate dependent queries
6. **Implement Error Boundaries**: Handle query and mutation errors gracefully

## Example Components

- `TanstackExampleComponent` - Basic usage demonstration
- `PokemonListTanstackComponent` - Complete implementation (if recreated)

## Debugging

TanStack Query provides excellent DevTools:
- Install `@tanstack/react-query-devtools` for debugging
- View query states, cache contents, and mutation history
- Monitor background refetches and cache invalidations

## Configuration

The QueryClient is configured in `app.config.ts`:

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    // ...other providers
    provideQueryClient(new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          gcTime: 1000 * 60 * 10,   // 10 minutes
        },
      },
    })),
  ]
};
```

This integration provides a robust, scalable data layer that enhances the existing architecture while maintaining backward compatibility.
