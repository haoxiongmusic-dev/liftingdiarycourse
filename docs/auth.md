# Authentication Standards

## Provider: Clerk Only

This project uses **Clerk** (`@clerk/nextjs`) as its sole authentication provider. Do not introduce any other auth library or roll custom auth logic.

## Environment Variables

The following Clerk environment variables must be set in `.env`:

| Variable                          | Purpose                     |
| --------------------------------- | --------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Client-side Clerk key       |
| `CLERK_SECRET_KEY`                | Server-side Clerk key       |

Never commit real keys. Use `.env.local` for local overrides and keep `.env` entries as placeholders or references only.

## Middleware

Clerk middleware is configured in `src/proxy.ts` using `clerkMiddleware()`. This runs on every matched route and attaches auth state to the request.

- Do not modify the middleware matcher unless adding new static asset extensions to the skip list.
- Do not add custom auth checks inside the middleware. Use Clerk's built-in route protection patterns instead.

## Getting the Current User

Use the `getCurrentUserId()` helper from `@/lib/auth` to resolve the authenticated user on the server:

```ts
import { getCurrentUserId } from "@/lib/auth";

const userId = await getCurrentUserId();
```

### Rules

1. **Always use `getCurrentUserId()`.** Do not call `auth()` from `@clerk/nextjs/server` directly outside of `src/lib/auth.ts`. All server-side user resolution must go through this single helper.
2. **Never trust client-supplied user IDs.** Always resolve the user from the server-side Clerk session.
3. **`getCurrentUserId()` throws on unauthenticated requests.** Callers do not need to null-check the return value. If auth fails, the error propagates and the page/action should surface an appropriate error state.

## Client-Side Auth Components

Use Clerk's pre-built React components for all auth UI. Do not build custom sign-in/sign-up forms.

| Component      | Usage                                                |
| -------------- | ---------------------------------------------------- |
| `ClerkProvider`| Wraps the app in `src/app/layout.tsx`                |
| `SignInButton` | Renders a sign-in trigger (use `mode="modal"`)       |
| `SignUpButton` | Renders a sign-up trigger (use `mode="modal"`)       |
| `SignedIn`     | Conditionally renders children for authenticated users |
| `SignedOut`    | Conditionally renders children for unauthenticated users |
| `UserButton`   | Renders the user avatar/menu for signed-in users     |

### Rules

1. **Use modal mode for sign-in/sign-up.** Pass `mode="modal"` to `SignInButton` and `SignUpButton`. Do not create dedicated `/sign-in` or `/sign-up` routes unless explicitly required.
2. **Do not build custom auth UI.** No custom login forms, registration forms, or password reset flows. Use Clerk's hosted/modal components exclusively.
3. **`ClerkProvider` must wrap the entire app.** It lives in the root layout (`src/app/layout.tsx`) and must remain the outermost provider.

## Server Components vs. Client Components

- **Server Components**: Use `getCurrentUserId()` from `@/lib/auth` to get the user ID for data fetching and authorization.
- **Client Components**: Use Clerk's `SignedIn`, `SignedOut`, and `UserButton` components for conditional rendering. Do not fetch auth state manually in client components.

## User Data Isolation

Authentication and data access are tightly coupled. Every database query must be scoped to the authenticated user's ID. See `docs/data-fetching.md` for the full data isolation rules.
