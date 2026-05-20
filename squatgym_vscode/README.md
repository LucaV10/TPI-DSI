# SquatGym – Sistema de Gestión de Clases

Proyecto de pantallas UI generadas con **Stitch (Google)**, usando el design system **Vitality Light**.

## Estructura

```
squatgym_vscode/
├── index.html                        ← Índice navegable de todas las pantallas
└── screens/
    ├── 01_login.html
    ├── 02_calendario_principal.html
    ├── 03_alta_nueva_clase.html
    ├── 04_baja_clase.html
    ├── 05_modificacion_clase.html
    ├── 06_confirmacion_alta.html
    ├── 07_confirmacion_baja.html
    ├── 08_confirmacion_avisos.html
    ├── 09_panel_profesor.html
    ├── 10_calendario_profesor.html
    ├── 11_registro_asistencia.html
    └── 12_confirmacion_asistencia.html
```

## Cómo usar en VS Code

1. Abrí la carpeta `squatgym_vscode/` en VS Code
2. Instalá la extensión **Live Server** (ritwickdey.LiveServer)
3. Hacé clic derecho en `index.html` → **"Open with Live Server"**
4. Navegá entre pantallas desde el índice

## Tecnologías

- **Tailwind CSS** (via CDN)
- **Lexend** (Google Fonts)
- **Material Symbols Outlined** (Google Icons)
- HTML puro — sin frameworks, sin build

## Roles del sistema

| Rol        | Pantallas                                                                    |
| ---------- | ---------------------------------------------------------------------------- |
| Secretaría | Login, Calendario Principal, Alta/Baja/Modificación de Clase, Confirmaciones |
| Profesor   | Panel del Profesor, Calendario del Profesor, Registro de Asistencia          |

## Notas

El seguimiento de las tareas se hizo a través de un tablero Kanban en Trello, con tarjetas para cada pantalla y subtareas para los elementos UI. Se priorizó la consistencia visual y la usabilidad.
El link del tablero es: https://trello.com/invite/b/6a0647effe7123e771e5fbce/ATTI8513b002cf89825e3a50d73fae962cf177216C2D/diseno-de-sistemas
