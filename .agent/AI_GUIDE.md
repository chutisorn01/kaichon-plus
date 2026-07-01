# AI Developer Guide (คู่มือสำหรับผู้พัฒนาและ AI)

This document serves as a structural guide for AI coding assistants and developers working on the **Kaichon Plus** pedigree management system. It details the architecture, coding rules, and conventions for both the backend (Express + TypeScript) and frontend (React + Vite + Tailwind CSS).

---

## 1. Project Directory Structure (โครงสร้างโปรเจกต์)

The project is split into two primary workspaces:
- `/backend`: Node.js Express Server running TypeScript.
- `/fontend` (frontend): Vite-based React Single Page Application.

```text
kaichon-plus/
├── .agent/
│   ├── skills/              # Platform specific design rules & context
│   └── AI_GUIDE.md          # This file (คู่มือนี้)
├── backend/
│   ├── src/
│   │   ├── config/          # Configurations (db.ts, env vars, etc.)
│   │   ├── controllers/     # MVC: Route business logic (controllers)
│   │   ├── middleware/      # Middlewares (error handling, custom validators)
│   │   ├── models/          # Mongoose Database Schemas & Types
│   │   ├── routes/          # API Route registrations
│   │   └── index.ts         # Main Entrypoint
│   ├── package.json
│   └── tsconfig.json
└── fontend/                 # React Frontend
    ├── src/
    │   ├── components/      # UI components & shadcn UI templates
    │   ├── lib/             # Shared utilities & API client helpers
    │   ├── App.tsx          # Main layout & router/tab controls
    │   ├── index.css        # Global CSS imports and Tailwind v4 theme
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

---

## 2. Backend Coding Standards & Rules (กฎการเขียนระบบหลังบ้าน)

AI developers must follow these strict patterns:

### A. ESM Import Format (การใช้ module ใน TypeScript)
The backend project runs in ESM mode (`"type": "module"` in `package.json`).
- **RULE**: All local relative file imports **MUST** end with the `.js` extension, even when importing `.ts` files.
- *Correct*: `import { Chicken } from '../models/chicken.model.js';`
- *Incorrect*: `import { Chicken } from '../models/chicken.model';`

### B. MVC Pattern (รูปแบบสถาปัตยกรรม MVC)
Keep code logically isolated:
1. **Models (`src/models/`)**: Define the Mongoose schema, validation constraints, and export the document interfaces.
2. **Controllers (`src/controllers/`)**: Implement business logic, async db calls, and control responses. Do not put routing configurations here.
3. **Routes (`src/routes/`)**: Map URLs to controller actions. Attach the request validators as middleware.

### C. Error Handling (การจัดการข้อผิดพลาด)
- Do not catch errors locally only to log them. Always pass them to `next(error)` so they propagate to the centralized error middleware in `backend/src/middleware/error.middleware.ts`.
- Use the `AppError` class for returning standard HTTP status codes:
  ```typescript
  return next(new AppError('Chicken not found', 404));
  ```

### D. Input Validation (การตรวจสอบความถูกต้องข้อมูล)
- Never trust client inputs. Apply validation middleware to routes before passing requests to controllers.
- Use the validation helper in `backend/src/middleware/validation.middleware.ts`. Example:
  ```typescript
  const registrationSchema = [
    { field: 'code', required: true, type: 'string' },
    { field: 'gender', required: true, type: 'string', options: ['male', 'female'] }
  ];
  router.post('/', validate(registrationSchema), registerChicken);
  ```

---

## 3. Database Rules & Relations (กฎฐานข้อมูลและความสัมพันธ์)

- Avoid database-wide cascade deletes. If an entity is referenced elsewhere (e.g., a Chicken referenced as a mother of another Chicken), prevent deletion and return a `400 Bad Request` with an explanation.
- Add indexing to fields that are commonly searched (such as `code` or `name` of the chicken).
- Sanitize regex parameters before performing database search queries to prevent NoSQL injection.

---

## 4. Frontend Coding Standards & Rules (กฎการเขียนหน้าบ้าน)

The frontend project utilizes Vite, TypeScript, Tailwind CSS v4, and shadcn/ui.

### A. Theme and Aesthetics (ความสวยงามและธีม)
- Design with visually rich aesthetics, smooth animations, and tailored color palettes.
- Utilize the Tailwind v4 custom theme mappings defined in `fontend/src/index.css`.
- Ensure standard elements have focus states, transitions, hover micro-animations, and glassmorphism.

### B. Responsive & Mobile-First (การออกแบบสำหรับมือถือ)
- All interactive tables, dashboards, and registration pages must display beautifully on smartphones, tablets, and desktops using flexible layouts (`grid`, `flex`, and standard responsive breakpoint prefixes `md:`, `lg:`).

---

## 5. Guide for Adding New Entities (คู่มือการเพิ่ม Entity ใหม่)

To add a new core entity (e.g., `Vaccine`, `Match`, `User`), follow this recipe:

1. **Step 1: Database Model**
   - Create `src/models/entityName.model.ts`. Define the schema and export the document interface.

2. **Step 2: Business Logic Controller**
   - Create `src/controllers/entityName.controller.ts`. Implement async/await standard routes (GET, POST, PUT, DELETE).

3. **Step 3: Custom Validation & Routes**
   - Create `src/routes/entityName.routes.ts`. Define fields schema rules and use the custom `validate` helper, then map routes to controller actions.

4. **Step 4: Register Route**
   - Import and use the router in `src/index.ts`. Example: `app.use('/api/entityName', entityRouter);`

5. **Step 5: Frontend Page Integration**
   - Add API handler functions in `fontend/src/lib/api.ts`.
   - Update `App.tsx` or build specific views to let users CRUD the entity with polished forms and tables.
