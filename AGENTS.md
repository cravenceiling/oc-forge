# Agent Guidelines for oc-forge

This document provides guidelines for AI agents working on the oc-forge codebase.

## Build, Lint, and Test Commands

```bash
# Development
bun run dev                     # Start dev server on port 3000
bun run build                   # Production build
bun run start                   # Start production server

# Type Checking
bun run check                   # TypeScript check (tsc --noEmit)

# Linting & Formatting
bun run lint                    # Biome linting (biome check)
bun run format                  # Format code (biome format --write)

# All checks (run before committing)
bun run check && bun run lint && bun run format
```

**Note:** This project uses Bun as the runtime and package manager. Always prefix commands with `bun --bun` to ensure the correct Bun runtime is used.

## Code Style Guidelines

### General Principles

- Write concise, self-documenting code
- Prefer explicit over implicit
- Keep functions small and focused (single responsibility)
- Avoid deep nesting (max 3-4 levels)

### Formatting (Biome)

- **Indentation:** 2 spaces (not tabs)
- **Line length:** No hard limit, but prefer shorter lines
- **Trailing commas:** Allowed
- **Quotes:** Prefer double quotes for JSX, single quotes for JS

### TypeScript Conventions

- Enable `strict: true` in tsconfig.json
- Use explicit types for function parameters and return values
- Avoid `any` - use `unknown` when type is truly unknown
- Use interface for object types, type for unions/primitives
- Prefer functional types over interfaces for callbacks
- Use `PascalCase` for types and interfaces

```typescript
// Good
interface User {
  id: string;
  name: string;
}

type Status = "pending" | "active" | "deleted";

// Avoid
interface Props { [key: string]: any }
```

### Naming Conventions

- **Files:** kebab-case for files (e.g., `config-form.tsx`)
- **Components:** kebab-case (e.g., `form-dialog.tsx`)
- **Variables/functions:** camelCase (e.g., `getUserData`)
- **Constants:** SCREAMING_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Props interfaces:** `ComponentNameProps` suffix (e.g., `ButtonProps`)
- **Custom hooks:** `use` prefix (e.g., `useFormState`)

### Imports

Organize imports in three groups with blank lines between:

1. Next.js/React imports
2. Third-party libraries
3. Local imports (using `@/` alias for src)

```typescript
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";
```

### React Components

- Use functional components with TypeScript
- Use named exports for components
- Use React 19 patterns (no `useEffect` with empty deps when possible)
- Use `useCallback` and `useMemo` for expensive computations
- Keep components under 150 lines when possible

```typescript
interface ConfigFormProps {
  schema: JSONSchema7;
  onSubmit: (data: unknown) => void;
}

export function ConfigForm({ schema, onSubmit }: ConfigFormProps) {
  // Component logic
}
```

### Tailwind CSS

- Use `cn()` from `@/lib/utils` for conditional classes
- Follow shadcn/ui patterns (prefixless CSS variables)
- Use consistent spacing scale
- Group related classes

```tsx
<div className={cn(
  "flex items-center justify-between",
  isActive && "bg-primary",
  className
)}>
```

### Error Handling

- Use TypeScript types for validation (Zod for runtime validation)
- Return typed errors from functions
- Use try/catch with specific error handling
- Don't swallow errors silently

```typescript
async function fetchData<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Fetch failed:", error);
    throw error;
  }
}
```

### Directory Structure

```
src/
├── app/              # Next.js App Router pages
├── components/
│   ├── ui/          # shadcn/ui components
│   └── *.tsx        # Custom components
├── lib/
│   ├── utils.ts     # cn() helper, etc.
│   └── schema.ts    # JSON schema utilities
└── hooks/           # Custom React hooks
```

### shadcn/ui Components

- All UI components are in `@/components/ui`
- Use `class-variance-authority` (cva) for variant props
- Follow the "new-york" style from components.json
- Import from `lucide-react` for icons

### Linting Exceptions

The following directories are excluded from biome linting:
- `node_modules`
- `.next`
- `dist`
- `build`
- `src/components/ui` (shadcn/ui source)

### Environment Variables

- Never commit secrets or API keys
- Use `.env.local` for local development
- Prefix public vars with `NEXT_PUBLIC_`

### Performance

- Use React Compiler (enabled in next.config.ts)
- Minimize client components (use "use client" sparingly)
- Use `next/image` for images
- Code split with dynamic imports when needed

### Git Commits

- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Keep commits atomic and focused
- Write clear commit messages

## Framework Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Runtime:** Bun 1.x
- **UI:** React 19, Tailwind CSS 4, shadcn/ui
- **Forms:** React Hook Form + Zod
- **Linting:** Biome 2.2
- **Icons:** Lucide React
