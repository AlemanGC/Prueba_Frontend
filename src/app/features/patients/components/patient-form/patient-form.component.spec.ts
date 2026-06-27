import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { PatientService } from '../../services/patient.service';
import { PatientsModule } from '../../patients.module';
import { PatientFormComponent } from './patient-form.component';

describe('PatientFormComponent', () => {
  let component: PatientFormComponent;
  let fixture: ComponentFixture<PatientFormComponent>;

  const activatedRouteStub = {
    snapshot: { paramMap: { get: (_key: string) => null } }, // Sin ID = modo creación
  };

  beforeEach(async () => {
    const patientServiceSpy = jasmine.createSpyObj<PatientService>('PatientService', [
      'create',
      'update',
      'getById',
    ]);
    patientServiceSpy.create.and.returnValue(of({ id: '99', documentType: 'DNI', documentNumber: '00000000', firstName: 'Test', lastName: 'Test', birthDate: '2000-01-01' }));

    await TestBed.configureTestingModule({
      imports: [PatientsModule, RouterTestingModule, BrowserAnimationsModule],
      providers: [
        { provide: PatientService, useValue: patientServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ngOnInit, construye el formulario
  });

  it('debería crearse correctamente en modo creación', () => {
    expect(component).toBeTruthy();
    expect(component.isEditMode).toBeFalse();
  });

  it('debería iniciar con el formulario inválido (campos vacíos)', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('debería marcar el formulario como válido con datos correctos', () => {
    component.form.setValue({
      documentType: 'DNI',
      documentNumber: '12345678',
      firstName: 'Juan',
      lastName: 'Pérez',
      birthDate: new Date('1990-01-15'),
      email: '',
      phone: '',
    });

    expect(component.form.valid).toBeTrue();
  });

  it('debería validar que documentNumber solo acepta dígitos (patrón /^\\d{6,15}$/)', () => {
    const control = component.form.get('documentNumber');
    control?.setValue('abc123');
    expect(control?.hasError('pattern')).toBeTrue();

    control?.setValue('12345678');
    expect(control?.valid).toBeTrue();
  });

  it('debería validar que email sea un correo válido', () => {
    const control = component.form.get('email');
    control?.setValue('no-es-email');
    expect(control?.hasError('email')).toBeTrue();

    control?.setValue('correo@valido.com');
    expect(control?.valid).toBeTrue();
  });

  it('debería detectar campo inválido después de marcar como tocado', () => {
    const control = component.form.get('firstName');
    control?.setValue('');
    control?.markAsTouched();
    control?.markAsDirty();

    expect(component.isFieldInvalid('firstName')).toBeTrue();
  });

  it('no debería detectar campo inválido si aún no fue tocado (aunque esté vacío)', () => {
    // El usuario no ha tocado el campo todavía
    expect(component.isFieldInvalid('firstName')).toBeFalse();
  });
});
