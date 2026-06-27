import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { Patient } from '../../../../core/models/patient.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { PatientFilters, PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css'],
})
export class PatientListComponent implements OnInit, OnDestroy {
  @ViewChild('dt') table!: Table;

  patients: Patient[] = [];
  totalRecords = 0;
  rows = 10;
  isLoading = false;
  showExportDialog = false;
  exportFromDate: Date | null = null;

  nameFilter = new FormControl('');
  documentFilter = new FormControl('');

  private currentFilters: PatientFilters = {};
  private destroy$ = new Subject<void>();

  constructor(
    private patientService: PatientService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.nameFilter.valueChanges.pipe(debounceTime(400), distinctUntilChanged()),
      this.documentFilter.valueChanges.pipe(debounceTime(400), distinctUntilChanged()),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([name, documentNumber]) => {
        this.currentFilters = {
          name: name || undefined,
          documentNumber: documentNumber || undefined,
        };
        if (this.table) {
          this.table.first = 0;
        }
        this.loadPatients(0, this.rows);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onLazyLoad(event: any): void {
    this.rows = event.rows;
    this.loadPatients(event.first, event.rows);
  }

  clearFilters(): void {
    this.nameFilter.setValue('');
    this.documentFilter.setValue('');
  }

  navigateToCreate(): void {
    this.router.navigate(['/patients/new']);
  }

  viewPatient(patient: Patient): void {
    this.router.navigate(['/patients', patient.patientId]);
  }

  editPatient(patient: Patient): void {
    this.router.navigate(['/patients', patient.patientId, 'edit']);
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
        (p) => p.createdAt && new Date(p.createdAt) >= from
      );
    }

    if (toExport.length === 0) {
      this.notificationService.warn('No hay pacientes para exportar con los filtros aplicados.');
      return;
    }

    const headers = [
      'ID', 'Tipo Doc.', 'N° Documento', 'Nombres', 'Apellidos',
      'F. Nacimiento', 'Email', 'Teléfono', 'F. Creación',
    ];

    const rows = toExport.map((p) => [
      p.patientId ?? '',
      p.documentType,
      p.documentNumber,
      p.firstName,
      p.lastName,
      p.birthDate,
      p.email ?? '',
      p.phoneNumber ?? '',
      p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-PE') : '',
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

  private loadPatients(first: number, pageSize: number): void {
    const page = Math.floor(first / pageSize) + 1;
    this.isLoading = true;
    this.patientService.getAll(this.currentFilters, page, pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.patients = result.items;
          this.totalRecords = result.totalCount;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  private deletePatient(patient: Patient): void {
    if (!patient.patientId) return;
    this.patientService.delete(patient.patientId.toString()).subscribe({
      next: () => {
        this.patients = this.patients.filter((p) => p.patientId !== patient.patientId);
        this.totalRecords--;
        this.notificationService.success('Paciente eliminado correctamente.');
      },
    });
  }
}
