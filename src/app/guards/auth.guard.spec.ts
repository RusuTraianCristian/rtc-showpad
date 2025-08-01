import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AppStateService } from '../services/app-state.service';
import { signal } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAppStateService: Partial<AppStateService>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;
  let hasUserSignal: any;
  let userLoadingSignal: any;
  let userNameSignal: any;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    hasUserSignal = signal(false);
    userLoadingSignal = signal(false);
    userNameSignal = signal(null);

    mockAppStateService = {
      hasUser: hasUserSignal,
      userLoading: userLoadingSignal,
      userName: userNameSignal,
      initialize: jasmine.createSpy('initialize').and.returnValue(Promise.resolve())
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AppStateService, useValue: mockAppStateService }
      ]
    });

    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = {} as RouterStateSnapshot;
  });

  it('should be created', () => {
    expect(authGuard).toBeTruthy();
  });

});
