export type DocumentType = 'DNI' | 'CE' | 'PASSPORT';

export interface Patient {
  patientId?: number;
  documentType: DocumentType;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  email?: string;
  phoneNumber?: string;
  createdAt?: string;
}

export const DOCUMENT_TYPES: { label: string; value: DocumentType }[] = [
  { label: 'DNI', value: 'DNI' },
  { label: 'Carnet de Extranjería', value: 'CE' },
  { label: 'Pasaporte', value: 'PASSPORT' },
];
