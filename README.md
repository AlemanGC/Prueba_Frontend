# Sistema de Gestión de Pacientes

Aplicación web construida con **Angular 16** y **PrimeNG** para gestionar un catálogo de pacientes con operaciones CRUD, filtros, exportación CSV y visualización de historial de citas.

---

## Tabla de contenidos

- [Requisitos previos](#requisitos-previos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Scripts disponibles](#scripts-disponibles)
- [Arquitectura](#arquitectura)
- [Decisiones técnicas](#decisiones-técnicas)
- [Pruebas unitarias](#pruebas-unitarias)
- [Cambiar a API real](#cambiar-a-api-real)

---

## Requisitos previos

| Herramienta | Versión recomendada |
|-------------|---------------------|
| Node.js     | >= 18.x             |
| Yarn        | 1.22.x              |
| Angular CLI | 16.x                |

---

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd prueba-tecnica
```

### 2. Instalar dependencias

```bash
yarn install
```

### 3. Levantar el servidor mock (json-server)

Abre una terminal y ejecuta:

```bash
yarn mock-api
```

Esto levanta una API REST en `http://localhost:3000` con los datos de `db.json`.

Endpoints disponibles:
- `GET    /patients`       — listar (soporta `?firstName_like=` y `?documentNumber=`)
- `GET    /patients/:id`   — obtener por ID
- `POST   /patients`       — crear
- `PUT    /patients/:id`   — actualizar
- `DELETE /patients/:id`   — eliminar
- `GET    /appointments?patientId=:id` — citas de un paciente

### 4. Iniciar la aplicación Angular

En otra terminal:

```bash
yarn start
```

Abre el navegador en `http://localhost:4200`.

---

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `yarn start` | Inicia la app en modo desarrollo (`ng serve`) |
| `yarn build` | Compila para producción |
| `yarn test` | Ejecuta las pruebas unitarias con Karma/Jasmine |
| `yarn mock-api` | Levanta json-server en el puerto 3000 |

---

## Arquitectura

El proyecto sigue una arquitectura de **Feature Modules** con separación clara en tres capas:

```
src/
└── app/
    ├── core/                    # Singletons globales (cargados una vez)
    │   ├── interceptors/
    │   │   └── error.interceptor.ts      # Manejo global de errores HTTP
    │   ├── models/
    │   │   ├── patient.model.ts          # Interface Patient + tipos
    │   │   └── appointment.model.ts      # Interface Appointment
    │   └── services/
    │       └── notification.service.ts   # Wrapper de PrimeNG Toast
    │
    ├── features/                # Módulos funcionales (lazy-loaded)
    │   └── patients/
    │       ├── components/
    │       │   ├── patient-list/     # Lista paginada + filtros + export CSV
    │       │   ├── patient-form/     # Formulario crear/editar
    │       │   └── patient-detail/   # Vista detalle + citas
    │       ├── services/
    │       │   └── patient.service.ts    # CRUD de pacientes + citas
    │       ├── patients.module.ts
    │       └── patients-routing.module.ts
    │
    ├── app.module.ts            # Módulo raíz (proveedores globales)
    ├── app-routing.module.ts    # Rutas raíz con lazy loading
    ├── app.ts                   # AppComponent (navbar + router-outlet)
    └── app.html
```

### Rutas

| URL | Componente | Descripción |
|-----|-----------|-------------|
| `/patients` | PatientListComponent | Lista con filtros, paginación y acciones |
| `/patients/new` | PatientFormComponent | Formulario de creación |
| `/patients/:id` | PatientDetailComponent | Detalle + historial de citas |
| `/patients/:id/edit` | PatientFormComponent | Formulario de edición |

---

## Decisiones técnicas

### Angular 16 con NgModules
Se utilizó la arquitectura de módulos NgModule (en lugar de Standalone Components) para facilitar la organización de una aplicación de tamaño mediano y porque es el patrón más extendido en proyectos empresariales con Angular 16.

### Lazy Loading
El módulo `PatientsModule` se carga de forma diferida (`loadChildren`) para mejorar el tiempo de carga inicial. En el futuro, cada nuevo módulo funcional puede seguir el mismo patrón.

### HttpInterceptor global
`ErrorInterceptor` captura todos los errores HTTP en un único lugar. Si la respuesta contiene un array `details[]`, muestra un toast por cada ítem (ideal para errores de validación del backend). Si no, muestra un mensaje genérico según el código HTTP.

### NotificationService
Envuelve el `MessageService` de PrimeNG para centralizar cómo se muestran los mensajes, evitando importar `MessageService` directamente en cada componente.

### Filtrado reactivo con debounce
Los filtros de la lista usan `combineLatest` + `debounceTime(400ms)` + `distinctUntilChanged` + `switchMap` para:
- Evitar llamadas innecesarias mientras el usuario escribe.
- Cancelar la llamada anterior si se escribe rápidamente (switchMap).

### json-server como mock API
Permite desarrollar y testear el frontend sin depender de un backend real. Al estar listo el backend, basta con cambiar `apiUrl` en `src/environments/environment.ts`.

### Exportación CSV del lado del cliente
Se genera el CSV directamente en el navegador (sin dependencias extra) usando `Blob` y un enlace de descarga dinámico. El usuario puede filtrar por fecha de creación antes de exportar.

---

## Pruebas unitarias

Se implementaron pruebas con **Jasmine** y **Karma** cubriendo las piezas más críticas:

| Archivo | Qué prueba |
|---------|------------|
| `patient.service.spec.ts` | GET todos, filtro por nombre, GET por ID, POST (con `createdAt`), PUT, DELETE |
| `patient-list.component.spec.ts` | Creación del componente, carga inicial, filtros reactivos, clear filters, estado de loading |
| `patient-form.component.spec.ts` | Modo creación vs edición, validaciones requeridas, patrón de documento, formato email, `isFieldInvalid` |

Ejecutar:
```bash
yarn test
```

---

## Cambiar a API real

1. Abre `src/environments/environment.ts`
2. Cambia `apiUrl`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://tu-api-real.com/api',
};
```

3. Ajusta los endpoints en `PatientService` si los nombres de ruta difieren del mock.
4. El `ErrorInterceptor` ya maneja los errores del backend automáticamente.
