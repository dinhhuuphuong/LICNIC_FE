# LINIC FE

Boilerplate React su dung `Vite + React + TypeScript`, duoc to chuc theo cau truc de mo rong cho du an thuc te.

## Chay du an

```bash
npm install
npm run dev
```

## Cau truc thu muc

```text
src/
  app/          # Router, providers, app-level setup
  assets/       # Anh, icon, static files
  components/   # UI tai su dung va common components
  constants/    # Route names, config hang so
  hooks/        # Custom React hooks
  layouts/      # Layout dung chung
  pages/        # Route pages
  services/     # API, HTTP client, integration layer
  styles/       # Global CSS va design tokens
  types/        # Shared TypeScript types
  utils/        # Helpers
```

## Huong mo rong de xuat

- Tach them `features/` neu du an bat dau lon theo domain.
- Dua env vao `.env` va `.env.example`.
- Them state management khi can, vi du Redux Toolkit, Zustand hoac TanStack Query.
- Them test voi Vitest + React Testing Library.
