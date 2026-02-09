# Data Fetching Standards

## Server Components Only

**All data fetching in this application MUST be performed in React Server Components.** This is a non-negotiable rule.

### Allowed

- Fetching data directly inside `async` Server Components (the default in App Router)

### Forbidden

- **Route Handlers** (`app/api/` routes) — do not use these for data fetching
- **Client Components** — do not fetch data in any component marked with `"use client"`
- **`useEffect` + `fetch`** — do not fetch data on the client
- **React Query, SWR, or any client-side fetching library** — do not use these
- **Server Actions for reads** — Server Actions are for mutations only, not for loading data

## Database Queries via `/data` Helper Functions

All database queries MUST go through helper functions defined in the `src/data/` directory. Pages and components must never contain inline database queries.

### Rules

1. **Every database query lives in `src/data/`.** Create one file per domain (e.g., `src/data/workouts.ts`, `src/data/exercises.ts`).
2. **Use Drizzle ORM exclusively.** All queries must use the Drizzle query builder. **Do not write raw SQL.** No `sql\`...\``, no `db.execute()`, no template-literal queries.
3. **Always scope queries to the logged-in user.** Every query function must accept or resolve the current user's ID and filter results by it. A user must **never** be able to read, update, or delete another user's data.

### Example Pattern

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getWorkouts(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

export async function getWorkoutById(userId: string, workoutId: string) {
  return db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

### Consuming Data in a Server Component

```tsx
// src/app/workouts/page.tsx
import { getWorkouts } from "@/data/workouts";
import { getCurrentUserId } from "@/lib/auth";

export default async function WorkoutsPage() {
  const userId = await getCurrentUserId();
  const workouts = await getWorkouts(userId);

  return (
    // render using shadcn/ui components
  );
}
```

## User Data Isolation

**A logged-in user may only access their own data.** This must be enforced at the data layer, not at the UI layer.

- Every `SELECT` query must include a `WHERE userId = <currentUser>` clause (or equivalent Drizzle filter).
- Every `UPDATE` and `DELETE` query must include the same user-scoping filter.
- Never trust client-supplied user IDs. Always resolve the user ID from the server-side session/auth context.
- Never expose data endpoints or queries that return data across multiple users.
