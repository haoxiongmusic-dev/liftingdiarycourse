# Data Mutation Standards

## Server Actions Only

**All data mutations in this application MUST be performed via Next.js Server Actions.** This is a non-negotiable rule.

### Allowed

- Server Actions defined in colocated `actions.ts` files using the `"use server"` directive

### Forbidden

- **Route Handlers** (`app/api/` routes) — do not use these for mutations
- **Client-side `fetch` / `POST` calls** — do not mutate data from the client directly
- **Inline `"use server"` functions inside components** — do not define Server Actions inside component files

## File Colocation

Every Server Action MUST live in a file named `actions.ts`, colocated with the route segment that uses it.

```
src/app/workouts/
  page.tsx        ← Server Component (renders UI)
  actions.ts      ← Server Actions (mutations only)
```

Do not create a shared or global actions file. Each route segment owns its own `actions.ts`.

## Database Mutations via `/data` Helper Functions

Server Actions must NOT contain inline database queries. All database writes MUST go through helper functions defined in the `src/data/` directory, using Drizzle ORM exclusively.

### Rules

1. **Every database mutation lives in `src/data/`.** Add mutation functions alongside query functions in the appropriate domain file (e.g., `src/data/workouts.ts`).
2. **Use Drizzle ORM exclusively.** All mutations must use the Drizzle query builder. **Do not write raw SQL.** No `sql\`...\``, no `db.execute()`, no template-literal queries.
3. **Always scope mutations to the logged-in user.** Every mutation function must accept or resolve the current user's ID and scope the operation by it. A user must **never** be able to modify or delete another user's data.

### Example Data Helper

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function createWorkout(userId: string, data: { startedAt: Date }) {
  return db.insert(workouts).values({
    userId,
    startedAt: data.startedAt,
  });
}

export async function deleteWorkout(userId: string, workoutId: string) {
  return db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

## Server Action Structure

Every Server Action MUST follow this structure:

1. **Typed parameters** — accept a plain object with typed fields. **Never use `FormData` as a parameter type.**
2. **Zod validation** — validate all incoming arguments with a Zod schema before any processing.
3. **Auth check** — resolve the current user ID from the server-side session.
4. **Delegate to `/data`** — call the appropriate helper function from `src/data/`.

### Example Server Action

```ts
// src/app/workouts/actions.ts
"use server";

import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { createWorkout, deleteWorkout } from "@/data/workouts";
import { revalidatePath } from "next/cache";

const createWorkoutSchema = z.object({
  startedAt: z.coerce.date(),
});

export async function createWorkoutAction(params: { startedAt: Date }) {
  const parsed = createWorkoutSchema.parse(params);
  const userId = await getCurrentUserId();

  await createWorkout(userId, { startedAt: parsed.startedAt });
  revalidatePath("/workouts");
}

const deleteWorkoutSchema = z.object({
  workoutId: z.string().min(1),
});

export async function deleteWorkoutAction(params: { workoutId: string }) {
  const parsed = deleteWorkoutSchema.parse(params);
  const userId = await getCurrentUserId();

  await deleteWorkout(userId, parsed.workoutId);
  revalidatePath("/workouts");
}
```

## Parameter Typing Rules

### Forbidden

```ts
// DO NOT use FormData
export async function bad(formData: FormData) { ... }

// DO NOT use untyped objects
export async function bad(data: any) { ... }
export async function bad(data: Record<string, unknown>) { ... }
```

### Required

```ts
// USE typed parameters
export async function good(params: { name: string; reps: number }) { ... }
```

## Zod Validation Rules

- **Every Server Action MUST validate its arguments using Zod** before performing any work.
- Define the Zod schema in the same `actions.ts` file, directly above the action that uses it.
- Use `schema.parse()` (which throws on failure) rather than `schema.safeParse()` unless you need to return structured validation errors to the client.

## No Redirects in Server Actions

**Do not call `redirect()` inside a Server Action.** Redirects must be performed client-side after the Server Action call resolves.

### Forbidden

```ts
// DO NOT redirect inside a Server Action
"use server";

import { redirect } from "next/navigation";

export async function createWorkoutAction(params: { startedAt: Date }) {
  // ... mutation logic
  redirect("/workouts"); // WRONG
}
```

### Required

Handle navigation on the client after the action completes:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { createWorkoutAction } from "./actions";

function CreateWorkoutButton() {
  const router = useRouter();

  async function handleClick() {
    await createWorkoutAction({ startedAt: new Date() });
    router.push("/workouts"); // CORRECT — redirect client-side
  }

  return <Button onClick={handleClick}>Create</Button>;
}
```

## Summary

| Concern                | Rule                                                     |
| ---------------------- | -------------------------------------------------------- |
| Where mutations live   | Colocated `actions.ts` files with `"use server"`         |
| Database access        | Helper functions in `src/data/` using Drizzle ORM        |
| Parameter types        | Typed objects only — **no `FormData`**                   |
| Validation             | Zod schemas — **every action validates its arguments**   |
| User scoping           | Always scope mutations to the authenticated user         |
| Raw SQL                | Forbidden — use Drizzle query builder only               |
| Redirects              | Client-side only — **no `redirect()` in Server Actions** |
