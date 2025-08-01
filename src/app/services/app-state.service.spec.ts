import { TestBed } from '@angular/core/testing';
import { AppStateService } from './app-state.service';
import { UserService } from './user.service';
import { UserData, UserPokemon } from '../core/models/pokemon.model';
import { of, throwError } from 'rxjs';

describe('AppStateService', () => {
  let service: AppStateService;
  let mockUserService: jasmine.SpyObj<UserService>;

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
    const userServiceSpy = jasmine.createSpyObj('UserService', [
      'getUserData',
      'saveUserData',
      'deleteUserData',
      'userExists'
    ]);

    TestBed.configureTestingModule({
      providers: [
        AppStateService,
        { provide: UserService, useValue: userServiceSpy }
      ]
    });

    service = TestBed.inject(AppStateService);
    mockUserService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


});
