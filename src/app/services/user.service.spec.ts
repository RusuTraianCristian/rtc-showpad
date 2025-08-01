import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { UserData, UserPokemon } from '../core/models/pokemon.model';

describe('UserService', () => {
  let service: UserService;

  const mockUserData: UserData = {
    name: 'Test User',
    pokemons: {
      caught: [
        { id: 1, name: 'bulbasaur', imageUrl: 'https://example.com/bulbasaur.png' },
        { id: 25, name: 'pikachu', imageUrl: 'https://example.com/pikachu.png' }
      ],
      wishlist: [
        { id: 150, name: 'mewtwo', imageUrl: 'https://example.com/mewtwo.png' }
      ]
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService]
    });
    service = TestBed.inject(UserService);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('User Data Management', () => {
    it('should return null when no user data exists', () => {
      service.getUserData().subscribe(userData => {
        expect(userData).toBeNull();
      });
    });

    it('should save and retrieve user data', () => {
      service.saveUserData(mockUserData).subscribe(() => {
        service.getUserData().subscribe(retrievedData => {
          expect(retrievedData).toEqual(mockUserData);
          expect(retrievedData!.name).toBe('Test User');
          expect(retrievedData!.pokemons.caught.length).toBe(2);
          expect(retrievedData!.pokemons.wishlist.length).toBe(1);
        });
      });
    });

    it('should check if user exists', () => {
      // Initially no user
      service.userExists().subscribe(exists => {
        expect(exists).toBe(false);
      });

      // After saving user data
      service.saveUserData(mockUserData).subscribe(() => {
        service.userExists().subscribe(exists => {
          expect(exists).toBe(true);
        });
      });
    });

    it('should delete user data', () => {
      service.saveUserData(mockUserData).subscribe(() => {
        service.deleteUserData().subscribe(() => {
          service.getUserData().subscribe(userData => {
            expect(userData).toBeNull();
          });
        });
      });
    });

    it('should handle invalid user data gracefully', () => {
      const invalidData = { invalid: 'data' } as any;

      service.saveUserData(invalidData).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.message).toBe('Invalid user data format');
        }
      });
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jasmine.createSpy('setItem').and.throwError('Storage error');

      service.saveUserData(mockUserData).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.message).toBe('Failed to save user data');
        }
      });

      // Restore original localStorage
      localStorage.setItem = originalSetItem;
    });

    it('should handle corrupted localStorage data gracefully', () => {
      // Set invalid JSON in localStorage
      localStorage.setItem('pokedex_user_data', 'invalid json');

      service.getUserData().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.message).toBe('Failed to load user data');
        }
      });
    });

    it('should validate user data structure', () => {
      const incompleteData = {
        name: 'Test User',
        pokemons: {
          caught: [{ id: 1 }], // Missing name property
          wishlist: []
        }
      } as any;

      service.saveUserData(incompleteData).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.message).toBe('Invalid user data format');
        }
      });
    });
  });
});
