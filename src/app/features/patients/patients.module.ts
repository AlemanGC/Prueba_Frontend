import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { BadgeModule } from 'primeng/badge';

import { PatientsRoutingModule } from './patients-routing.module';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { PatientFormComponent } from './components/patient-form/patient-form.component';
import { PatientDetailComponent } from './components/patient-detail/patient-detail.component';

@NgModule({
  declarations: [PatientListComponent, PatientFormComponent, PatientDetailComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PatientsRoutingModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    CardModule,
    TagModule,
    ToolbarModule,
    TooltipModule,
    ProgressSpinnerModule,
    DividerModule,
    DialogModule,
    RippleModule,
    BadgeModule,
  ],
})
export class PatientsModule {}
