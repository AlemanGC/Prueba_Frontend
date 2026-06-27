import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

/**
 * Interceptor global de errores HTTP.
 * Captura cualquier error de red o API y muestra un toast descriptivo.
 * Si el error tiene un array `details[]`, muestra un toast por cada ítem.
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private notificationService: NotificationService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const details: string[] | undefined = error.error?.details;

        if (details && details.length > 0) {
          details.forEach((detail) =>
            this.notificationService.error(detail, 'Error de validación')
          );
        } else {
          this.notificationService.error(this.resolveMessage(error));
        }

        return throwError(() => error);
      })
    );
  }

  private resolveMessage(error: HttpErrorResponse): string {
    if (error.status === 0) return 'Sin conexión. Verifica tu red o que el servidor esté activo.';
    if (error.status === 400) return error.error?.message || 'Solicitud inválida.';
    if (error.status === 404) return 'Recurso no encontrado.';
    if (error.status === 409) return error.error?.message || 'Registro duplicado (conflicto).';
    if (error.status >= 500) return 'Error interno del servidor. Intenta más tarde.';
    return error.error?.message || 'Ha ocurrido un error inesperado.';
  }
}
