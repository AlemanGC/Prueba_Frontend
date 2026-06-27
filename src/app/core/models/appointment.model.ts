export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id?: string;
  patientId: string;
  date: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
}
