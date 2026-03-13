# ORIS79E Services

Aplicación web para la gestión de servicios técnicos, tickets y cotizaciones de ORIS79E Services. Incluye portal público, panel administrativo y panel técnico con autenticación por roles.

## Características
- Portal público con páginas de inicio, servicios, publicaciones, contacto y nosotros.
- Solicitud de servicios con validaciones dominicanas (cédula/RNC), consulta de caso y notificaciones por correo.
- Panel administrador con dashboard, usuarios, servicios, productos, publicaciones, tickets y cotizaciones.
- Panel técnico con agenda/calendario, tickets asignados y detalle con evidencias.
- Generación y descarga de cotizaciones en PDF.
- Autenticación y autorización por roles mediante Supabase (email/contraseña y Google OAuth).

## Stack
- React 19 + Vite 7
- React Router
- Supabase JS
- Zustand
- Styled Components + Framer Motion
- Recharts, FullCalendar, React Big Calendar
- jsPDF, pdfmake, jspdf-autotable.

## Requisitos
- Node.js y npm

## Instalación
1. npm install
2. Crear .env con las variables necesarias.
3. npm run dev


## Rutas principales
```text
/                       (portal cliente)
/servicios              (solicitud de servicios)
/publicaciones
/contacto
/nosotros
/admin                  (dashboard admin)
/admin/usuarios
/admin/tickets
/admin/productos
/admin/servicios
/admin/publicaciones
/admin/cotizaciones
/admin/cotizaciones/:id
/tecnico/dashboard
/tecnico/tickets
/tecnico/tickets/:id
/tecnico/calendario
/login                  (login admin/tecnico)
```

## Supabase (tablas usadas)
- usuarios
- servicios
- productos
- solicitudes
- cotizaciones
- cotizacion_items
- detalle_cotizacion
- publicaciones
- imagenes_publicacion
- historial_tickets
- tecnico_requests
- tickets_evidencias

## Despliegue
- Proyecto preparado para despliegue SPA (por ejemplo Vercel). Rewrites ya definidos en `vercel.json`.
