# Copilot Instructions

## Project Overview
React 19 + TypeScript + Vite application using Tailwind CSS 4 for styling. Currently implements a coffee warehouse order form with plans for state management via Zustand and routing via React Router.

## Tech Stack & Build
- **Build Tool**: Vite 7 with HMR (`npm run dev` on port 5173 by default)
- **TypeScript**: Strict mode enabled with ES2022 target, bundler module resolution
- **Styling**: Tailwind CSS 4 (use utility classes directly in JSX)
- **Linting**: ESLint 9 with flat config, includes React hooks rules and React Refresh plugin
- **Package Manager**: npm (package.json uses type: "module")

## Development Commands
```bash
npm run dev       # Start dev server with HMR
npm run build     # TypeScript check + production build
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

## Code Patterns & Conventions

### Component Structure
- Components live in [src/components/](src/components/)
- Use functional components with TypeScript (`React.FC` for explicit typing)
- Example pattern from [CoffeOrderForm.tsx](src/components/CoffeOrderForm.tsx):
  - Define types at top of file (`type CoffeeOrder = {...}`)
  - Use `useState` for local state with explicit types
  - Controlled form inputs with event handlers

### Styling
- **Tailwind utility classes** are the primary styling approach
- Examples: `className="p-6"`, `className="text-2xl font-bold mb-4"`
- No CSS modules - use utility-first approach

### Type Safety
- All TypeScript files use strict mode
- Event handlers typed as `React.FormEvent`, `React.ChangeEvent`, etc.
- Use `keyof` for dynamic property access (see `handleChange` in CoffeeOrderForm)

### State Management
- **Local state**: `useState` for component-level state
- **Global state**: Zustand is installed but not yet implemented
- When adding Zustand stores, create separate store files (currently none exist)

### Routing
- React Router DOM 7 is installed but not yet implemented
- When implementing, wrap App in router providers in [main.tsx](src/main.tsx)

## File Organization
```
src/
├── main.tsx           # Entry point with StrictMode
├── App.tsx            # Root component
├── components/        # Reusable components
├── assets/           # Static assets (images, icons)
├── *.css             # Global styles (index.css, App.css)
```

## Important Notes
- App uses React 19 features - ensure compatibility when adding libraries
- ESLint config uses flat config format (new in ESLint 9)
- TypeScript uses `verbatimModuleSyntax` - use `import type` for type-only imports
- Vite config is minimal - no path aliases configured yet
