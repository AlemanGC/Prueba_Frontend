import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { Patient } from '../../../../core/models/patient.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css'],
})
export class PatientListComponent implements OnInit, OnDestroy {
  patients: Patient[] = [];
  rows = 10;
  isLoading = false;
  showExportDialog = false;
  exportFromDate: Date | null = null;

  nameFilter = new FormControl('');

  private allPatients: Patient[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private patientService: PatientService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();

    this.nameFilter.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((name) => this.applyFilter(name));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clearFilters(): void {
    this.nameFilter.setValue('');
  }

  navigateToCreate(): void {
    this.router.navigate(['/patients/new']);
  }

  viewPatient(patient: Patient): void {
    this.router.navigate(['/patients', patient.employeeId]);
  }

  editPatient(patient: Patient): void {
    this.router.navigate(['/patients', patient.employeeId, 'edit']);
  }

  confirmDelete(patient: Patient): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar al paciente <strong>${patient.firstName} ${patient.lastName}</strong>?<br>Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => this.deletePatient(patient),
    });
  }

  exportCsv(): void {
    let toExport = [...this.patients];

    if (this.exportFromDate) {
      const from = this.exportFromDate;
      toExport = toExport.filter(
        (p) => p.hireDate && new Date(p.hireDate) >= from
      );
    }

    if (toExport.length === 0) {
      this.notificationService.warn('No hay pacientes para exportar con los filtros aplicados.');
      return;
    }

    const headers = [
      'ID', 'Nombres', 'Apellidos', 'Email', 'Teléfono', 'F. Contratación',
    ];

    const rows = toExport.map((p) => [
      p.employeeId ?? '',
      p.firstName,
      p.lastName,
      p.email ?? '',
      p.phoneNumber ?? '',
      p.hireDate ? new Date(p.hireDate).toLocaleDateString('es-PE') : '',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${v}"`).join(','))
      .join('\n');

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `pacientes_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    this.showExportDialog = false;
    this.notificationService.success(`${toExport.length} paciente(s) exportado(s) correctamente.`);
  }

  private loadPatients(): void {
    this.isLoading = true;
    this.patientService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (patients) => {
          this.allPatients = patients;
          this.applyFilter(this.nameFilter.value);
          this.isLoading = false;

        },
        error: (err) => {
          console.log('Error loading patients', err);
          this.isLoading = false;
        },
      });
  }

  private applyFilter(name: string | null): void {
    const term = name?.trim().toLowerCase();
    this.patients = term
      ? this.allPatients.filter((p) =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(term)
        )
      : [...this.allPatients];
  }

  private deletePatient(patient: Patient): void {
    if (!patient.employeeId) return;
    this.patientService.delete(patient.employeeId.toString()).subscribe({
      next: () => {
        this.allPatients = this.allPatients.filter((p) => p.employeeId !== patient.employeeId);
        this.applyFilter(this.nameFilter.value);
        this.notificationService.success('Paciente eliminado correctamente.');
      },
    });
  }
}
