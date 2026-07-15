import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Patient } from '../../../../core/models/patient.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css'],
})
export class PatientFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  patientId: string | null = null;
  today = new Date();

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();

    this.patientId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.patientId;

    if (this.isEditMode && this.patientId) {
      this.loadPatient(this.patientId);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.warn('Por favor, completa todos los campos requeridos.');
      return;
    }

    const patient = this.buildPayload();
    this.isSubmitting = true;

    if (this.isEditMode && this.patientId) {
      this.patientService.update(this.patientId, patient).subscribe({
        next: () => {
          this.notificationService.success('Paciente actualizado correctamente.');
          this.router.navigate(['/patients']);
        },
        error: () => {
          this.isSubmitting = false;
        },
      });
    } else {
      this.patientService.create(patient).subscribe({
        next: () => {
          this.notificationService.success('Paciente creado correctamente.');
          this.router.navigate(['/patients']);
        },
        error: () => {
          this.isSubmitting = false;
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/patients']);
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldErrors(controlName: string): AbstractControl | null {
    return this.form.get(controlName);
  }

  private buildForm(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      hireDate: [null, Validators.required],
      email: ['', [Validators.email, Validators.maxLength(150)]],
      phoneNumber: ['', [Validators.pattern(/^\d{7,15}$/)]],
    });
  }

  private loadPatient(id: string): void {
    this.isLoading = true;
    this.patientService.getById(id).subscribe({
      next: (patient) => {
        this.form.patchValue({
          ...patient,
          // El Calendar de PrimeNG necesita un objeto Date, no un string
          hireDate: patient.hireDate ? new Date(patient.hireDate) : null,
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.error('No se pudo cargar el paciente.');
        this.router.navigate(['/patients']);
      },
    });
  }

  private buildPayload(): Patient {
    const raw = this.form.value;
    return {
      firstName: raw.firstName,
      lastName: raw.lastName,
      // Convertir Date a formato ISO (solo fecha)
      hireDate:
        raw.hireDate instanceof Date
          ? raw.hireDate.toISOString().split('T')[0]
          : raw.hireDate,
      email: raw.email || undefined,
      phoneNumber: raw.phoneNumber || undefined,
    };
  }
}
