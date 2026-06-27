import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';

import { Patient } from '../../../../core/models/patient.model';
import { PatientService } from '../../services/patient.service';
import { PatientsModule } from '../../patients.module';
import { PatientListComponent } from './patient-list.component';

const mockPatients: Patient[] = [
  {
    id: '1',
    documentType: 'DNI',
    documentNumber: '12345678',
    firstName: 'Juan',
    lastName: 'Pérez',
    birthDate: '1990-01-15',
    createdAt: '2024-01-10T08:00:00.000Z',
  },
  {
    id: '2',
    documentType: 'CE',
    documentNumber: '87654321',
    firstName: 'María',
    lastName: 'García',
    birthDate: '1995-05-20',
    createdAt: '2024-02-15T10:00:00.000Z',
  },
];

describe('PatientListComponent', () => {
  let component: PatientListComponent;
  let fixture: ComponentFixture<PatientListComponent>;
  let patientServiceSpy: jasmine.SpyObj<PatientService>;

  beforeEach(async () => {
    patientServiceSpy = jasmine.createSpyObj<PatientService>('PatientService', [
      'getAll',
      'delete',
    ]);
    patientServiceSpy.getAll.and.returnValue(of(mockPatients));
    patientServiceSpy.delete.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [PatientsModule, RouterTestingModule, BrowserAnimationsModule],
      providers: [
        { provide: PatientService, useValue: patientServiceSpy },
        MessageService,
        ConfirmationService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientListComponent);
    component = fixture.componentInstance;
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar pacientes al iniciar y mostrarlos en la tabla', fakeAsync(() => {
    fixture.detectChanges(); // ngOnInit
    tick(400); // debounceTime
    fixture.detectChanges();

    expect(patientServiceSpy.getAll).toHaveBeenCalled();
    expect(component.patients.length).toBe(2);
    expect(component.patients[0].firstName).toBe('Juan');
  }));

  it('debería llamar a getAll con filtros cuando se escribe en el campo nombre', fakeAsync(() => {
    fixture.detectChanges();
    tick(400);

    component.nameFilter.setValue('María');
    tick(400);

    expect(patientServiceSpy.getAll).toHaveBeenCalledWith(
      jasmine.objectContaining({ firstName: 'María' })
    );
  }));

  it('debería limpiar ambos filtros al llamar clearFilters()', fakeAsync(() => {
    fixture.detectChanges();
    tick(400);

    component.nameFilter.setValue('test');
    component.documentFilter.setValue('123');
    tick(400);

    component.clearFilters();

    expect(component.nameFilter.value).toBe('');
    expect(component.documentFilter.value).toBe('');
  }));

  it('no debería mostrar el spinner una vez que la carga termina', fakeAsync(() => {
    fixture.detectChanges();
    tick(400);
    fixture.detectChanges();

    expect(component.isLoading).toBeFalse();
  }));
});
