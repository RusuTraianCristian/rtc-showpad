import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionComponent } from './collection.component';
import { PokemonFacade } from '../core/facades/pokemon.facade';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CustomButtonComponent, LazyImageComponent } from '../shared';
import { signal } from '@angular/core';
import { Pokemon } from '../core/models/pokemon.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PokemonService } from '../services/pokemon.service';
import { of } from 'rxjs';

describe('CollectionComponent', () => {
  let component: CollectionComponent;
  let fixture: ComponentFixture<CollectionComponent>;

  beforeEach(async () => {
    const pokemonFacadeStub = {
      removeFromWishlist: jasmine.createSpy('removeFromWishlist'),
      releasePokemon: jasmine.createSpy('releasePokemon'),
      getTypeClass: jasmine.createSpy('getTypeClass').and.returnValue('bg-green-500 text-white'),
      userPokemons: signal({ caught: [], wishlist: [] }),
      hasUser: signal(true)
    };

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const pokemonServiceSpy = jasmine.createSpyObj('PokemonService', ['getPokemonDetails'], {
      getPokemonDetails: jasmine.createSpy('getPokemonDetails').and.returnValue(of(null))
    });

    await TestBed.configureTestingModule({
      imports: [CollectionComponent, CommonModule, CustomButtonComponent, LazyImageComponent],
      providers: [
        { provide: PokemonFacade, useValue: pokemonFacadeStub },
        { provide: Router, useValue: routerSpy },
        { provide: PokemonService, useValue: pokemonServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


});
