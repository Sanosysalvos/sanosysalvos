# 🐾 Sanos y Salvos
Plataforma comunitaria para el reporte y localización de mascotas perdidas y encontradas, desarrollada con arquitectura de microservicios.
 
## Integrantes
 
* Macarena Espinoza
* Marco Contreras
* Jose Duran
---
 
## Descripción
 
Sanos y Salvos es una solución digital que centraliza la gestión de reportes de mascotas extraviadas. Permite a los usuarios publicar avisos de pérdida o hallazgo con fotos y ubicación, mientras la comunidad colabora para reunir a las mascotas con sus dueños.
  
---
 
## Tecnologías utilizadas
 
**Frontend**
 
* Next.js 15 (App Router)
* TypeScript
* Tailwind CSS
* Firebase Auth

**Infraestructura**
 
* Vercel (deploy)
---
 
## Funcionalidades
 
* Autenticación de usuarios con Firebase
* Reportar mascota perdida con fotos y ubicación
* Reportar mascota encontrada
* Feed de casos recientes (últimas 24 horas)
* Búsqueda de dueños de mascotas encontradas
---
 
## Estructura del proyecto
 
```
sanosysalvos/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── ...
├── public/
├── .env.local
├── next.config.ts
├── tailwind.config.*
├── tsconfig.json
└── package.json
```
 
---
 
## Instalación y uso local
 
```bash
# 1. Clonar el repositorio
git clone https://github.com/Sanosysalvos/sanosysalvos.git
cd sanosysalvos
 
# 2. Instalar dependencias
npm install
 
# 3. Configurar variables de entorno
cp .env.example .env.local
 
# 4. Iniciar servidor de desarrollo
npm run dev
```
 
Abrir [http://localhost:3000](http://localhost:3000) en el navegador.
 
---
 
## Variables de entorno
 
```env
NEXT_PUBLIC_BFF_URL=http://localhost:8080
 
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
```
 
---
 
## Scripts disponibles
 
```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run start     # Servidor de producción
npm run lint      # Linter
```
 
---
 
## Estrategia de Branching
 
| Rama | Uso |
|---|---|
| `main` | Código en producción (rama por defecto) |
| `test` | Pruebas generales del sistema |
| `test-backend` | Pruebas del backend y microservicios |
| `test-backend-bff` | Pruebas específicas del BFF |

 
---
 
## Repositorios relacionados
 
* Frontend: [github.com/Sanosysalvos/sanosysalvos](https://github.com/Sanosysalvos/sanosysalvos)
* Backend: [github.com/Sanosysalvos/sanosysalvosback](https://github.com/Sanosysalvos/sanosysalvosback)
