import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';
      let isNetworkError = false;

      if (error.error instanceof ErrorEvent) {
        isNetworkError = true;
        errorMessage = `Network Error: Please check your internet connection and try again.`;
      } else if (error.status === 0) {
        isNetworkError = true;
        errorMessage = 'No internet connection. Please check your network and try again.';
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'Invalid request. Please check your input and try again.';
            break;
          case 401:
            errorMessage = 'Authentication required. Please log in again.';
            break;
          case 403:
            errorMessage = 'Access denied. You do not have permission to perform this action.';
            break;
          case 404:
            if (req.url.includes('pokemon')) {
              errorMessage = 'Pokemon not found. It may not exist or has been removed.';
            } else {
              errorMessage = 'The requested resource was not found.';
            }
            break;
          case 408:
            errorMessage = 'Request timeout. The server took too long to respond.';
            break;
          case 429:
            errorMessage = 'Too many requests. Please wait a moment before trying again.';
            break;
          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            break;
          case 502:
            errorMessage = 'Bad gateway. The server is temporarily unavailable.';
            break;
          case 503:
            errorMessage = 'Service unavailable. The server is temporarily down for maintenance.';
            break;
          case 504:
            errorMessage = 'Gateway timeout. The server took too long to respond.';
            break;
          default:
            if (error.status >= 500) {
              errorMessage = 'Server error. Please try again later.';
            } else if (error.status >= 400) {
              errorMessage = 'Client error. Please check your request and try again.';
            } else {
              errorMessage = `Unexpected error (${error.status}): ${error.message}`;
            }
        }
      }

      return throwError(() => ({
        ...error,
        userMessage: errorMessage,
        isNetworkError,
        originalError: error
      }));
    })
  );
};
