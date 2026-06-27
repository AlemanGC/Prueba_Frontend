import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Appointment, AppointmentStatus } from '../../../../core/models/appointment.model';
import { Patient } from '../../../../core/models/patient.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.css'],
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  appointments: Appointment[] = [];
  isLoading = true;

  constructor(
    private patientService: PatientService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/patients']);
      return;
    }

    // Carga paciente y citas en paralelo
    forkJoin({
      patient: this.patientService.getById(id),
      appointments: this.patientService.getAppointmentsByPatient(id),
    }).subscribe({
      next: ({ patient, appointments }) => {
        this.patient = patient;
        this.appointments = appointments;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.error('No se pudo cargar el paciente.');
        this.router.navigate(['/patients']);
      },
    });
  }

  getStatusSeverity(status: AppointmentStatus): string {
    const map: Record<AppointmentStatus, string> = {
      SCHEDULED: 'info',
      COMPLETED: 'success',
      CANCELLED: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  getStatusLabel(status: AppointmentStatus): string {
    const map: Record<AppointmentStatus, string> = {
      SCHEDULED: 'Programada',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    };
    return map[status] ?? status;
  }

  editPatient(): void {
    if (this.patient?.patientId) {
      this.router.navigate(['/patients', this.patient.patientId, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/patients']);
  }
}
