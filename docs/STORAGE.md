# Storage (Cloudflare R2)

Uploads (photos, the host's music) and the curated music library live in a
Cloudflare R2 bucket. The browser uploads directly to R2 with a presigned URL;
server functions only sign URLs and record metadata (`media_assets`). R2 is
spoken to through its S3-compatible endpoint, signed with
[aws4fetch](https://github.com/mhart/aws4fetch) (no AWS account or SDK).

## Choosing the driver

| `STORAGE_DRIVER` | Behaviour                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| `r2`             | Cloudflare R2. Startup fails, naming each missing `R2_*` variable, if any is empty.                          |
| `local`          | `.storage/` on this machine. Development only; refused in production.                                        |
| _(empty)_        | R2 when all five `R2_*` are set, otherwise local in development. Setting only some of them fails at startup. |

The editor header shows **Local storage (dev)** whenever uploads are going to
`.storage/`, so you always know which one is active.

Keys go in **`.env`** (git-ignored), never in `.env.example` (committed).

Leave the `R2_*` variables empty: the **local driver** stores files in
`.storage/` (git-ignored), signs uploads with HMAC (`STORAGE_SIGNING_SECRET`)
and serves them from `/api/storage/file/<key>` with HTTP Range support. It
refuses to run in production.

## Setting up R2

1. Cloudflare dashboard → R2 → **Create bucket** (e.g. `festly-media`).
2. Bucket → Settings → **Public access**: enable the `r2.dev` subdomain, or
   connect a custom domain (recommended for production, e.g. `media.festly.app`).
3. R2 → **Manage API tokens** → Create token with **Object Read & Write**,
   scoped to this bucket. Copy the Access Key ID and Secret Access Key.
4. Bucket → Settings → **CORS policy**:

   ```json
   [
     {
       "AllowedOrigins": [
         "http://localhost:3000",
         "https://your-domain.example"
       ],
       "AllowedMethods": ["PUT", "GET", "HEAD"],
       "AllowedHeaders": ["Content-Type"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

5. Fill `.env`:

   ```bash
   R2_ACCOUNT_ID=<account id from the R2 overview page>
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_BUCKET=festly-media
   R2_PUBLIC_URL=https://pub-xxxx.r2.dev   # or your custom domain
   ```

When all five are set, `getStorage()` switches to R2 automatically.

## Object layout

| Prefix                              | What                                  | Written by       |
| ----------------------------------- | ------------------------------------- | ---------------- |
| `useruploads/<ownerId>/<uuid>.webp` | Photos (resized client-side ≤ 800 KB) | editor uploads   |
| `useruploads/<ownerId>/<uuid>.mp3`  | Host music (≤ 10 MB)                  | editor uploads   |
| `library/<track>.mp3`               | Curated music library                 | `pnpm music:add` |

Keys are owner-scoped: `confirmUpload` refuses keys outside the caller's
prefix, re-checks the real size and type with a HEAD request, and deletes
anything that breaks the rules. Presigned URLs expire after 10 minutes and
bind the Content-Type.
