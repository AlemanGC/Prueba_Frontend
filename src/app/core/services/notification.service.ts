import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * Servicio centralizado de notificaciones.
 * Envuelve el MessageService de PrimeNG para mostrar toasts en toda la app.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private messageService: MessageService) {}

  success(detail: string, summary = 'Éxito'): void {
    this.messageService.add({ severity: 'success', summary, detail, life: 3000 });
  }

  error(detail: string, summary = 'Error'): void {
    this.messageService.add({ severity: 'error', summary, detail, life: 5000 });
  }

  warn(detail: string, summary = 'Advertencia'): void {
    this.messageService.add({ severity: 'warn', summary, detail, life: 4000 });
  }

  info(detail: string, summary = 'Información'): void {
    this.messageService.add({ severity: 'info', summary, detail, life: 3000 });
  }
}
