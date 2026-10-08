# API Starter

A reusable **Express 5 + TypeScript** starter with **Drizzle ORM (PostgreSQL)** and **Zod** validation. It ships with centralized error handling, a unified response format, and a pluggable auth/authorization layer, so every new project starts from a solid base instead of from scratch.

## Features

- Express 5 (async errors are forwarded to the error handler automatically, no `asyncHandler` needed)
- TypeScript in strict mode
- Drizzle ORM with PostgreSQL, schemas auto-discovered per module
- Zod validation for `body`, `params` and `query`
- `ApiError` class with helpers (`badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`)
- Unified success and error response shape
- Environment variables validated at startup
- Pluggable authentication (JWT, API key, session...) and composable authorization policies
- Security and logging middleware: `helmet`, `cors`, `morgan`

## Tech Stack

| Purpose | Library |
|---|---|
| HTTP server | Express 5 |
| Language | TypeScript |
| ORM | Drizzle ORM + drizzle-kit |
| Database | PostgreSQL (`pg`) |
| Validation | Zod |
| Dev runner | tsx |

## Getting Started

### Prerequisites

- Node.js 20+
- A running PostgreSQL database

### Installation

```bash
git clone https://github.com/USERNAME/api-starter.git my-new-app
cd my-new-app
npm install
```

Or use this repo as a **GitHub template** ("Use this template" button).

### Environment variables

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
```

If you use the JWT auth config, also add:

```env
JWT_SECRET=a-long-random-string-of-at-least-32-characters
```

The server refuses to start if a required variable is missing or invalid (see `src/core/config/env.ts`).

### Database

```bash
npm run db:generate   # generate a migration from your schemas
npm run db:migrate    # apply migrations
```

For fast prototyping you can use `npm run db:push` instead of the two commands above.

### Run

```bash
npm run dev     # development with watch mode
npm run build   # compile to dist/
npm start       # run the compiled build
```

Health check: `GET /api/health`

## Scripts

| Script | Description |
|---|---|
| `dev` | Start the server with `tsx watch` |
| `build` | Compile TypeScript and resolve path aliases (`tsc && tsc-alias`) |
| `start` | Run the compiled server |
| `db:generate` | Generate Drizzle migrations |
| `db:migrate` | Apply migrations |
| `db:push` | Push schema directly to the database |
| `db:studio` | Open Drizzle Studio |

## Project Structure

```
src/
├── core/                  # The framework: copy as-is between projects
│   ├── errors/
│   │   ├── ApiError.ts
│   │   └── errorHandler.ts
│   ├── http/
│   │   ├── response.ts    # ok, created, noContent
│   │   └── validate.ts
│   ├── auth/
│   │   ├── auth.ts        # setAuthProvider, attachUser, authenticate, authorize
│   │   ├── policies.ts    # hasRole, hasPermission, isOwner, anyOf
│   │   └── types.ts
│   └── config/
│       └── env.ts
│
├── config/                # Project-specific settings: change per project
│   ├── auth.config.ts     # How a request is turned into a user
│   └── roles.ts           # Your roles (e.g. admin, customer, vendor)
│
├── db/
│   └── index.ts           # Drizzle connection
│
├── modules/               # One folder per entity
│   └── users/
│       ├── users.schema.ts
│       ├── users.validation.ts
│       ├── users.service.ts
│       ├── users.controller.ts
│       └── users.routes.ts
│
├── routes.ts              # Registers all module routers
├── app.ts
└── server.ts
```

**Rule of thumb:** if a file is copied unchanged from project to project, it belongs in `core/`. If it changes per project, it lives outside `core/`.

## Response Format

**Success**

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

**Error**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "body.email", "message": "Invalid email" }
  ]
}
```

In development, unexpected 500 errors also include a `stack` field.

## Error Handling

Throw an `ApiError` from anywhere (service, controller, policy) and the error handler formats it:

```ts
import { ApiError } from '@core/errors/ApiError';

throw ApiError.notFound('User not found');
throw ApiError.conflict('Email already in use');
```

The handler also converts automatically:

- `ZodError` to `400` with a field-level `errors` array
- PostgreSQL unique violation (`23505`) to `409`
- Invalid JSON body to `400`
- Anything else to `500`

## Validation

Define a Zod schema with `body`, `params` and/or `query`, then attach it with `validate`:

```ts
export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
  }),
});

router.post('/', validate(createUserSchema), controller.create);
```

## Authentication and Authorization

The core never assumes how users are identified or what roles look like. Two separate questions:

1. **Who is this?** Answered by an *auth provider* you register once per project in `src/config/auth.config.ts`.
2. **Are they allowed?** Answered by *policies*, small functions that return `true` or `false`.

### 1. Register a provider

```ts
// src/config/auth.config.ts
import jwt from 'jsonwebtoken';
import { setAuthProvider } from '@core/auth/auth';
import { env } from '@core/config/env';

setAuthProvider((req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try {
    return jwt.verify(token, env.JWT_SECRET) as any; // { id, roles: [...] }
  } catch {
    return null;
  }
});
```

Import it in `app.ts` **before** `attachUser`:

```ts
import './config/auth.config';
app.use(attachUser);
```

Switching to API keys or sessions only means changing the contents of this one file.

### 2. Protect routes

```ts
import { authenticate, authorize } from '@core/auth/auth';
import { hasRole, isOwner, anyOf } from '@core/auth/policies';

router.get('/me', authenticate, c.me);
router.post('/products', authorize(hasRole('vendor', 'admin')), c.create);
router.delete('/:id', authorize(anyOf(hasRole('admin'), isOwner())), c.remove);
```

### 3. Custom policies

Rules specific to one module live inside that module:

```ts
// modules/products/products.policies.ts
export const canManageProduct: Policy = async (user, req) => {
  if (hasRole('admin')(user, req)) return true;
  const product = await productsService.findById(Number(req.params.id));
  return product.vendorId === user.id;
};
```

### Security notes

- Read the user's role from the database when issuing the token. Never accept `role` from the register request body.
- A token keeps its old roles until it expires. If role changes must apply immediately, have the provider read roles from the database on each request.

## Adding a New Module

1. Copy `src/modules/users` and rename it (for example `products`).
2. Rename the files and update the schema, validation, service and controller.
3. Register the router in `src/routes.ts`:

   ```ts
   router.use('/products', productsRoutes);
   ```

4. Run `npm run db:generate` then `npm run db:migrate`.

Schemas are picked up automatically through the `./src/modules/**/*.schema.ts` glob in `drizzle.config.ts`, so there is nothing to register by hand.

## Path Aliases

Configured in `tsconfig.json`:

| Alias | Path |
|---|---|
| `@core/*` | `src/core/*` |
| `@config/*` | `src/config/*` |
| `@db` | `src/db` |

Aliases work in the editor and in `tsx`. For production builds, `tsc-alias` rewrites them (`npm run build` runs it for you).

## Using as a Template for a New Project

1. Mark this repository as a **Template repository** on GitHub (Settings).
2. Click **Use this template** to create a new repo.
3. Copy `.env.example` to `.env` and fill in your values.
4. Edit `src/config/` (auth and roles), then add your own modules.

## License

MIT
