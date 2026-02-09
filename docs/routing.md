# Routing Standards

## Route Structure

All application routes live under `/dashboard`. The root `/` route is a public landing page and must not contain authenticated content or data fetching.

| Route                              | Purpose              |
| ---------------------------------- | -------------------- |
| `/`                                | Public landing page  |
| `/dashboard`                       | Workout list (home)  |
| `/dashboard/workout/new`           | Create a workout     |
| `/dashboard/workout/[workoutId]`   | Edit a workout       |

When adding new pages, nest them under `/dashboard`. Do not create top-level routes outside of `/dashboard` for authenticated features.

## Route Protection

All `/dashboard` routes (and any sub-routes) are **protected routes** that require an authenticated user. Protection is enforced at the **middleware layer** using Clerk's `clerkMiddleware` with `createRouteMatcher`.

### Middleware Implementation

Route protection lives in `src/proxy.ts`. Use `createRouteMatcher` to define protected route patterns and call `auth().protect()` inside the middleware for matched routes:

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});
```

### Rules

1. **Protect routes in middleware, not in pages.** Do not add `redirect()` or auth checks at the top of page components for the purpose of route protection. The middleware handles this globally.
2. **Use `createRouteMatcher` for route patterns.** Define all protected patterns in a single `isProtectedRoute` matcher. Do not scatter route checks across multiple conditionals.
3. **The `/dashboard(.*)` pattern covers all sub-routes.** Any new page added under `/dashboard/` is automatically protected. No additional configuration is needed for new sub-routes.
4. **Do not modify the middleware `config.matcher`.** The existing matcher correctly targets all non-static routes. Changes to it affect all middleware behavior, not just auth.
5. **Pages still call `getCurrentUserId()` for data access.** Middleware prevents unauthenticated users from reaching the page, but pages must still resolve the user ID via `getCurrentUserId()` from `@/lib/auth` to scope data queries. These are complementary, not redundant.

## Linking Between Pages

Use Next.js `<Link>` from `next/link` for all internal navigation. Always use absolute paths starting with `/dashboard`:

```tsx
import Link from "next/link";

<Link href="/dashboard">Back to workouts</Link>
<Link href="/dashboard/workout/new">New workout</Link>
<Link href={`/dashboard/workout/${workout.id}`}>Edit workout</Link>
```

Do not use `useRouter().push()` for standard page-to-page navigation. Reserve `useRouter()` for programmatic navigation in response to actions (e.g., redirecting after a form submission).

## Dynamic Routes

Dynamic segments use the Next.js `[param]` folder convention. The param is accessed from the `params` prop as a `Promise`:

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  // validate and use workoutId
}
```

Always validate dynamic params before using them. Return `notFound()` for invalid values.
