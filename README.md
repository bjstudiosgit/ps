# Pack Society

Customer journey: scan the pack QR code, play the dinosaur runner, then enter the batch number when the game ends. A matching active batch opens a separate page reading “Item verified” with the batch number, its saved name and a matching photo or placeholder. “Check another batch” opens `/verify` directly, without replaying the game. Invalid or inactive numbers stay on the entry form with an error. No customer account or email is required.

## Local development

Use Node.js 22.13 or newer. Run `npm ci`, then `npm run dev`. Open the terminal's local URL.

For a local preview, use these server-only settings in `.env.local`:
- `ADMIN_PASSWORD`: a unique random password of at least 24 characters.
- `BATCH_STORAGE=local`: enables development-only storage in ignored `work/batches.local.json`.

A random local admin password has been generated in `.env.local`. View it locally; do not commit or share that file. Local storage persists on this PC but is not used in production.

## Batch management

Open `/admin` and sign in with `ADMIN_PASSWORD`. There is no public navigation link to this page. Every management API request independently authenticates the password on the server. The browser retains the password only in memory; refresh or sign out to clear it.

- Add one batch number, or up to 100 at once using new lines or commas.
- Numbers use 3–64 letters, numbers or hyphens. Matching ignores case and surrounding whitespace; leading zeros are preserved.
- Set the batch name shown on the verified item page, plus private notes for admin reference.
- Search the batch index by number or name. Results are paginated; Clear search restores the full index.
- Edit the batch name or deactivate a batch. Inactive numbers cannot verify. Use View item to preview an active batch's verification page.
- Existing numbers are skipped on bulk add; use Edit to change them.

## Local verification demo

The local preview and the current hosted database contain ten sample batches, `DEMO-001` through `DEMO-010`. Enter one after the game, or at `/verify`, to test its result page. To seed a fresh local checkout, start the local server and run `node --env-file=.env.local scripts/seed-demo-batches.mjs`. This does not automatically seed a new production database.

### Batch photos

Place photos in `public/products`, named after their batch number: `demo-001.jpg`, `demo-002.jpg`, through `demo-010.jpg`. The same rule works for any active batch. JPG, JPEG, PNG and WebP are supported, in that priority order if multiple formats exist. Filename matching ignores case. Missing or unloadable photos show an “Image coming soon” placeholder with the batch number.

Replace or rename files to swap photos; no page-code edit is needed. Refresh for local changes. Commit and push the images to deploy updates online. Photo URLs include a content version so replaced images do not keep showing an older cached photo. Titles always use the batch name saved in admin. See `public/products/README.md` for the full demo filename list.

Batch numbers are indexed by a primary key in the hosted database. The public verification API returns only whether the number is recognised and its normalized code. The result page displays the saved batch name. Notes and stored links remain private.

A recognised batch proves the number is in the batch register. A copied number could appear on more than one physical pack; unique per-pack codes would be needed for stronger authenticity checks.

## Hosting on Vercel

1. Import this Git repository into Vercel. Select Next.js, `npm ci`, and `npm run build`. Keep the default output directory.
2. Connect a Neon database and configure server-only `DATABASE_URL`.
3. Set a new strong server-only `ADMIN_PASSWORD`. Never prefix either setting with `NEXT_PUBLIC_`. Do not use development-only local storage in hosting.
4. Set the same database URL locally and run `npm run db:setup`, or run `db/schema.sql` in Neon's SQL editor. Setup is safe to repeat and retains existing registrations.
5. Deploy and check the public URL in a signed-out browser. Production must not require Vercel Authentication for customer access.
6. Sign in at the production `/admin`, add the real batch numbers, and test one active, one inactive and one incorrect number.
7. Point the QR code at the final public home URL. The QR code opens the game; the batch number is separately printed beside the barcode.

Production requires Neon and fails with a clear unavailable message if storage is not configured. Development batches are not automatically copied to Neon.

The earlier public Sites version at https://pack-society-portal.scientificbrad.chatgpt.site/ remains a separate site. Local changes do not update it. Existing Cloudflare D1 contacts have not been migrated.

## Validation

- `npm test`: game physics, code validation, link safety, admin authorization and origin checks.
- `npm run build`: production compilation and TypeScript validation.
- `npm run db:setup`: initialize the configured Neon schema.

The legacy email-registration API and table are retained for existing data, but the customer journey now uses batch verification.

Dinosaur and cloud sprites are from Chromium; see `public/CHROMIUM-LICENSE.txt`.
