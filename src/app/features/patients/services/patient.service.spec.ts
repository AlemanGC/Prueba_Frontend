import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { Patient } from '../../../core/models/patient.model';
import { environment } from '../../../../environments/environment';
import { PatientService } from './patient.service';

describe('PatientService', () => {
  let service: PatientService;
  let httpMock: HttpTestingController;

  const mockPatient: Patient = {
    id: '1',
    documentType: 'DNI',
    documentNumber: '12345678',
    firstName: 'Juan',
    lastName: 'Pérez',
    birthDate: '1990-01-15',
    email: 'juan@email.com',
    phone: '999111222',
    createdAt: '2024-01-10T08:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientService],
    });
    service = TestBed.inject(PatientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no queden requests pendientes
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería obtener todos los pacientes (GET /patients)', () => {
    const mockList: Patient[] = [mockPatient];

    service.getAll().subscribe((patients) => {
      expect(patients.length).toBe(1);
      expect(patients[0].firstName).toBe('Juan');
      expect(patients[0].documentType).toBe('DNI');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/patients`);
    expect(req.request.method).toBe('GET');
    req.flush(mockList);
  });

  it('debería filtrar pacientes por nombre usando parámetro firstName_like', () => {
    service.getAll({ firstName: 'Juan' }).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/patients` && r.params.has('firstName_like')
    );
    expect(req.request.params.get('firstName_like')).toBe('Juan');
    req.flush([mockPatient]);
  });

  it('debería obtener un paciente por ID (GET /patients/:id)', () => {
    service.getById('1').subscribe((patient) => {
      expect(patient.id).toBe('1');
      expect(patient.lastName).toBe('Pérez');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/patients/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPatient);
  });

  it('debería crear un paciente (POST /patients) con createdAt generado', () => {
    const newPatient: Patient = {
      documentType: 'CE',
      documentNumber: '87654321',
      firstName: 'María',
      lastName: 'García',
      birthDate: '1995-05-20',
    };
    const created: Patient = { ...newPatient, id: '2', createdAt: '2024-06-01T00:00:00.000Z' };

    service.create(newPatient).subscribe((patient) => {
      expect(patient.id).toBe('2');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/patients`);
    expect(req.request.method).toBe('POST');
    // Verifica que se envió createdAt en el payload
    expect(req.request.body.createdAt).toBeDefined();
    req.flush(created);
  });

  it('debería actualizar un paciente (PUT /patients/:id)', () => {
    const updated: Patient = { ...mockPatient, firstName: 'Juan Carlos' };

    service.update('1', updated).subscribe((patient) => {
      expect(patient.firstName).toBe('Juan Carlos');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/patients/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(updated);
  });

  it('debería eliminar un paciente (DELETE /patients/:id)', () => {
    service.delete('1').subscribe((result) => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/patients/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
