# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Artifacts

- **order-form** (`/`) — Form pemesanan barang dengan tema glassmorphism. Frontend-only React + Vite. Mengirim isi form ke WhatsApp `+62 896-3777-1036` melalui `wa.me`.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19 + Vite + TailwindCSS v4
- **API framework**: Express 5 (tidak digunakan saat ini)
- **Database**: PostgreSQL + Drizzle ORM (tidak digunakan saat ini)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/order-form run dev` — run order form locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
