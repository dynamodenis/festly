# Auth (Better Auth)

Sign-in is [Better Auth](https://www.better-auth.com) 1.7: email + password,
plus Google when its keys are set. Everything lives in our own Postgres
through the Drizzle adapter; there is no third-party auth service. The
instance is built in `src/server/auth/auth.server.ts` and served at
`/api/auth/*` (`src/routes/api/auth/$.ts`).

## Where things are stored

| Table           | Holds                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| `users`         | Who the person is: email, name, image. No password.                                                                |
| `accounts`      | One row per sign-in method. `provider_id = 'credential'` carries the password hash; `'google'` carries its tokens. |
| `sessions`      | One row per signed-in browser. The cookie only holds a signed reference to it.                                     |
| `verifications` | Short-lived tokens behind password-reset and confirm-email links.                                                  |

Passwords are hashed with **scrypt** (Node's `node:crypto`, a random salt per
hash). They cannot be read back, only reset through the emailed link.

Ids in these tables are `text`: Better Auth issues 32-character random
strings, not UUIDs. Our own tables (invitations, media, RSVPs…) stay `uuid`.
Switching would need `advanced.database.generateId: "uuid"` and a migration of
`users.id` and every `owner_id` / `user_id`.

## Is it stateless?

No: sessions are rows in Postgres. The **app servers** are stateless, though,
so any instance can serve any request and you can scale horizontally with no
sticky sessions. Each signed-in request costs one primary-key lookup on
`sessions`.

Load stays small because only hosts using the dashboard and editor are signed
in. Guests opening `/i/...` never touch auth. Database sessions also mean a
session can be revoked instantly (sign out everywhere, ban, stolen cookie).

## Before running more than one instance

Better Auth's sign-in rate limiter keeps its counters **in memory per
process** by default. With N instances an attacker gets N× the attempts.
Before scaling past one instance, store them centrally:

```ts
rateLimit: { storage: "database" }, // + a `rate_limits` table (migration)
```

or, once Redis exists, `secondaryStorage` (which rate limits and sessions can
both use).

## If session lookups ever become hot

- **Cookie cache:** `session: { cookieCache: { enabled: true, maxAge: 5 * 60 } }`.
  A signed copy of the session rides in the cookie, so most requests skip the
  database. Cost: sign-out or a ban takes up to `maxAge` to apply everywhere.
- **Redis** via `secondaryStorage`: moves session reads out of Postgres.
  Only worth it at a much larger scale.

## Configuration

| Variable                                   | Notes                                                                                                                        |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET`                       | Signs cookies and tokens. Required in production (`openssl rand -base64 32`); development falls back to a public dev secret. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Both or neither. Redirect URI: `<APP_ORIGIN>/api/auth/callback/google`. The Google button only shows when set.               |
| `RESEND_API_KEY`, `EMAIL_FROM`             | Reset and confirm-email messages. Required in production; without them development prints emails to the server log.          |
| `ALLOW_DEV_USER`                           | Opt-in: treats signed-out requests as the seeded dev user. Local demos only.                                                 |

Drafts made by the dev user before auth existed can be moved to a real
account with `pnpm db:claim-dev <email>` (sign up first).
