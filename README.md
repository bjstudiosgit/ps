# Pack Society

Customer journey: scan the pack QR code, play the dinosaur runner, then enter the batch number when the game ends. A matching active batch opens its product details and links. No customer account or email is required.

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
- Set a product name, final-page details, and up to eight labelled web links.
- Search the batch index by number or product name. Results are paginated.
- Edit product content or deactivate a batch. Inactive numbers cannot verify.
- Existing numbers are skipped on bulk add; use Edit to change them.

## Neutral product demo

The local preview contains ten sample batches, `DEMO-001` through `DEMO-010`. Each maps to a distinct placeholder `Product 1` through `Product 10` page at `/demo/DEMO-001` through `/demo/DEMO-010`. Enter a demo batch number after the game to see its placeholder artwork and a link to its product page. The sample records live only in ignored local development storage; hosted production has no seeded batch records. To add them again after a fresh checkout, start the local server and run `node --env-file=.env.local scripts/seed-demo-batches.mjs`. Replace the placeholders with product information appropriate to your deployment.

Batch numbers are indexed by a primary key in the hosted database. Details are plain text. Only http/https links are accepted. Invalid or inactive codes do not receive final-page content.

A recognised batch proves the number is in the batch register. A copied number could appear on more than one physical pack; unique per-pack codes would be needed for stronger authenticity checks.

## Hosting on Vercel

1. Import this Git repository into Vercel. Select Next.js, `npm ci`, and `npm run build`. Keep the default output directory.
2. Connect a Neon database and configure server-only `DATABASE_URL`.
3. Set a new strong server-only `ADMIN_PASSWORD`. Never prefix either setting with `NEXT_PUBLIC_`. Do not use development-only local storage in hosting.
4. Set the same database URL locally and run `npm run db:setup`, or run `db/schema.sql` in Neon's SQL editor. Setup is safe to repeat and retains existing registrations.
5. Deploy and check the public URL in a signed-out browser. Production must not require Vercel Authentication for customer access.
6. Sign in at the production `/admin`, add the real batch numbers and final-page links, and test one active, one inactive and one incorrect number.
7. Point the QR code at the final public home URL. The QR code opens the game; the batch number is separately printed beside the barcode.

Production requires Neon and fails with a clear unavailable message if storage is not configured. Development batches are not automatically copied to Neon.

The earlier public Sites version at https://pack-society-portal.scientificbrad.chatgpt.site/ remains a separate site. Local changes do not update it. Existing Cloudflare D1 contacts have not been migrated.

## Validation

- `npm test`: game physics, code validation, link safety, admin authorization and origin checks.
- `npm run build`: production compilation and TypeScript validation.
- `npm run db:setup`: initialize the configured Neon schema.

The legacy email-registration API and table are retained for existing data, but the customer journey now uses batch verification.

Dinosaur and cloud sprites are from Chromium; see `public/CHROMIUM-LICENSE.txt`.
