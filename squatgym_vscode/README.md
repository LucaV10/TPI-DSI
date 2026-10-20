# SquatGym – Sistema de Gestión de Clases

> **Trabajo Práctico Integrador (TPI)**  
> **Cátedra:** Diseño de Sistemas de Información (DSI)  
> **Carrera:** Ingeniería en Sistemas de Información – UTN FRRe  

Proyecto de interfaces de usuario interactivas basadas en el design system **Vitality Light**.

---

## Estructura de Pantallas

```text
squatgym_vscode/
├── index.html                        ← Índice navegable / Redirección al login
├── 00_error.html                     ← Pantalla de error / Acceso denegado
├── nav.js                            ← Enrutador y sistema universal de notificaciones
├── classStore.js                     ← Capa de datos y persistencia en localStorage
└── screens/
    ├── 01_login.html                 ← Inicio de sesión con selector de perfiles
    ├── administrador/                ← Métricas, usuarios, finanzas y auditoría
    ├── alumno/                       ← Dashboard y control de asistencias
    ├── encargado/                    ← Gestión de profesores, clases y novedades
    ├── profesor/                     ← Panel, calendario y toma de asistencias
    └── secretaria/                   ← Grilla operativa y edición de clases
```

---

## Cómo usar en VS Code

1. Abrí la carpeta `squatgym_vscode/` en VS Code.
2. Asegurate de tener instalada la extensión **Live Server**.
3. Hacé clic derecho en `index.html` → **"Open with Live Server"**.
4. Navegá entre pantallas desde el índice o iniciando sesión con los perfiles precargados.

---

## Tecnologías Utilizadas

- **Tailwind CSS** (vía CDN)
- **Lexend** (Google Fonts)
- **Material Symbols Outlined** (Google Icons)
- **JavaScript Vanilla** (sin frameworks pesados ni compilación previa)
- **LocalStorage & SessionStorage** para simulación de persistencia en tiempo real

---

## Roles del Sistema

| Rol | Pantallas Principales |
| :--- | :--- |
| **Administrador** | Métricas de Facturación, Gestión de Socios, Auditoría, Nuevo Usuario |
| **Encargado** | Panel de Sucursal, Validación de Horas de Profesores, Novedades |
| **Secretaría** | Gestión de Clases, Reemplazos Docentes, Avisos a Alumnos |
| **Profesor** | Panel Diario, Calendario Semanal, Registro de Asistencia en Vivo |
| **Alumno** | Mi Panel, Consulta de Horarios y Registro Histórico de Asistencia |

---

## Gestión del Proyecto

El seguimiento de las tareas y el diseño de pantallas se realizó mediante un tablero Kanban, priorizando la consistencia visual, la accesibilidad (WCAG) y la usabilidad para los diferentes perfiles operativos del gimnasio.
