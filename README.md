# SquatGym – Sistema de Gestión Integral de Gimnasio

> **Trabajo Práctico Integrador (TPI)**  
> **Cátedra:** Diseño de Sistemas de Información (DSI)  
> **Carrera:** Ingeniería en Sistemas de Información  
> **Institución:** Universidad Tecnológica Nacional – Facultad Regional Resistencia (UTN FRRe)  

---

## 📌 Descripción del Proyecto

**SquatGym** es un prototipo interactivo de alta fidelidad diseñado para optimizar y centralizar la gestión operativa de una cadena de gimnasios con múltiples sedes. El sistema resuelve la problemática de coordinación entre turnos, control de acceso de socios, administración de clases grupales, asignación de suplencias docentes y liquidación de horas de los instructores.

Este prototipo fue desarrollado como parte de la cátedra de **Diseño de Sistemas de Información**, aplicando conceptos de diseño centrado en el usuario (UCD), consistencia en sistemas de diseño, modelado de estados y especificación de interfaces.

---

## 👥 Módulos y Roles del Sistema

El sistema implementa vistas y flujos diferenciados según el rol del usuario autenticado:

| Rol | Ícono | Responsabilidades y Pantallas Principales |
| :--- | :---: | :--- |
| **Administrador** | 👑 | Visión global del negocio: métricas de facturación, auditoría de accesos, gestión y alta de usuarios/socios con asignación de roles. |
| **Encargado** | 📋 | Operatoria de la sucursal: control de fichadas de profesores para sueldos, novedades de sede, supervisión de inventario y suplencias. |
| **Secretaría** | 👩‍💼 | Gestión de clases en tiempo real: reprogramación de horarios, salas y cupos, registro de asistencia rápida, asignación de reemplazos docentes y envío de comunicados. |
| **Profesor** | 👨‍🏫 | Agenda personal, panel con cuenta regresiva a su próxima clase, registro de presentes/ausentes con alerta de deudores, y solicitud de suplencias. |
| **Alumno** | 🏋️ | Portal de autoservicio: visualización de clases disponibles según su plan contratado y consulta de historial de asistencias. |

---

## 🛠️ Tecnologías y Arquitectura

* **HTML5 Semántico:** Estructura modular y accesible (cumplimiento de directrices WCAG para formularios).
* **Tailwind CSS (vía CDN):** Implementación del Design System personalizado (*Vitality Light*), con soporte para temas de color por rol.
* **Google Fonts & Icons:** Tipografía corporativa [*Lexend*](https://fonts.google.com/specimen/Lexend) y catálogo de iconos [*Material Symbols Outlined*](https://fonts.google.com/icons).
* **JavaScript Vanilla:**
  * [`nav.js`](file:///B:/ghb/TPI-DSI/squatgym_vscode/nav.js): Enrutador centralizado (`SQ.go`), gestión del estado de sesión (`sessionStorage`), toasts y sistema universal de notificaciones dinámicas con badges.
  * [`classStore.js`](file:///B:/ghb/TPI-DSI/squatgym_vscode/classStore.js): Capa de lógica de negocio y persistencia en `localStorage`, control de solapamiento horario de clases, detección de ausencias frecuentes y cálculo de disponibilidad de cupos.
* **Testing Automatizado:** Suite de pruebas en Node.js ([`run_tests.js`](file:///B:/ghb/TPI-DSI/run_tests.js)) que valida 72 casos de prueba de navegación, integridad del store y formularios.

---

## 📂 Estructura del Repositorio

```text
TPI-DSI/
├── squatgym_vscode/
│   ├── index.html                     # Redirección inicial
│   ├── 00_error.html                  # Pantalla de acceso denegado / error 403-404
│   ├── nav.js                         # Enrutador, estado y notificaciones
│   ├── classStore.js                  # Store de datos y persistencia (localStorage)
│   ├── assets/                        # Recursos visuales y fondos
│   └── screens/
│       ├── 01_login.html              # Pantalla de inicio de sesión con selector rápido
│       ├── administrador/             # Métricas, usuarios, finanzas, auditoría
│       ├── alumno/                    # Dashboard e historial del socio
│       ├── encargado/                 # Gestión de profesores, clases y novedades
│       ├── profesor/                  # Panel docente, calendario y toma de asistencia
│       └── secretaria/                # Agenda operativa y modificación de clases
├── run_tests.js                       # Suite de tests automatizados (Node.js)
├── .gitignore                         # Exclusiones de Git
└── README.md                          # Documentación del proyecto
```

---

## 🚀 Cómo Ejecutar el Prototipo

No requiere instalación de servidores de backend ni dependencias de Node para el frontend:

### Opción 1: Con extensión Live Server (Recomendado en VS Code)
1. Abrir la carpeta `squatgym_vscode/` en Visual Studio Code.
2. Hacer clic derecho sobre [`index.html`](file:///B:/ghb/TPI-DSI/squatgym_vscode/index.html) y seleccionar **"Open with Live Server"**.
3. El prototipo se abrirá en `http://127.0.0.1:5500`.

### Opción 2: Apertura directa
1. Abrir directamente [`squatgym_vscode/screens/01_login.html`](file:///B:/ghb/TPI-DSI/squatgym_vscode/screens/01_login.html) en cualquier navegador web moderno (Chrome, Edge, Firefox).

---

## 🔑 Credenciales de Demostración

La pantalla de login incluye botones de selección rápida para autocompletar credenciales con un clic:

| Perfil | Correo de Acceso | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `administrador@gmail.com` | `123456` |
| **Profesor** | `profesor@gmail.com` | `123456` |
| **Alumno** | `alumno@gmail.com` | `123456` |
| **Secretaría** | `secretaria@gmail.com` | `123456` |
| **Encargado** | `encargado@gmail.com` | `123456` |

---

## 🧪 Ejecución de Pruebas

Para verificar la integridad de los enlaces, la persistencia de datos y la consistencia de los formularios:

```powershell
node run_tests.js
```

Se ejecutan **72 pruebas unitarias e integrales** que garantizan:
* ✅ Resolución de todas las rutas de `SQ.go()`.
* ✅ CRUD de clases, prevención de solapamientos horarios y persistencia de salas.
* ✅ Control de deudores y validación de inasistencias en la toma de asistencias.
* ✅ Accesibilidad WCAG (vinculación de `label` con `id` de inputs).

---

## 📋 Metodología y Gestión

El relevamiento, análisis de requisitos y diseño de interfaces se gestionó utilizando la metodología ágil **Kanban**, estructurando las tareas por pantalla y componente UI, priorizando:
* Consistencia visual y retroalimentación inmediata al usuario.
* Prevención de errores operativos (ej. alumnos deudores destacados y bloqueados en la lista de asistencia del profesor).
* Trazabilidad de eventos mediante notificaciones persistentes entre roles.

---

*UTN Facultad Regional Resistencia – Departamento de Ingeniería en Sistemas de Información.*
