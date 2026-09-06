# Pack Society

A full-screen dinosaur runner followed by the Pack Society email signup. Public visitors do not need an account. The game and design are unchanged by the Vercel migration.

## Local development

Use Node.js 22.13 or newer (Node.js 24 recommended).

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local` and replace the example `DATABASE_URL` with a Neon connection string.
3. Run `npm run db:setup` once to create the registrations table.
4. Run `npm run dev` and open the URL printed in the terminal.

The page and game work without a database connection. Signup correctly returns an error until storage is configured; it does not pretend to save an email.

## Deploy to Vercel

1. Import this folder's Git repository into Vercel, or run the Vercel CLI from `E:\BJstudio\PackSociety`.
2. Select **Next.js**. Use `npm ci` for installation and `npm run build` for the build. Leave the output directory at its Next.js default.
3. Add a **Neon** database from Vercel Storage / Marketplace and connect it to the project. Ensure its connection string is available as the server-only environment variable `DATABASE_URL`. Do not prefix it with `NEXT_PUBLIC_`.
4. Initialize the schema by running the contents of `db/schema.sql` in Neon's SQL editor. Alternatively, set the same database URL in local `.env.local` and run `npm run db:setup`. The command is safe to run again.
5. Deploy. If an environment variable was added after deployment, redeploy to apply it.
6. The intended customer site is public. In **Settings > Deployment Protection**, make sure the production domain does not require Vercel Authentication or a password. Check the production URL in a signed-out/private browser before printing QR codes.

The checked-in `vercel.json` selects the Next.js preset. No OpenAI or Sites login is built into this version.

## Database

The only stored field is `registrations.email`, a unique primary key. Queries are parameterized and duplicate emails do not create additional rows. Browser requests cannot retrieve the registration list.

The earlier public Sites version at https://pack-society-portal.scientificbrad.chatgpt.site/ remains online separately. Its existing Cloudflare D1 records have **not** been copied into Neon. If contacts have already signed up there, export/import them before switching the QR code to Vercel. Moving this local project does not remove that published site.

## Checks

- `npm run build` — production build and TypeScript validation.
- `npm test` — jump, landing, collision, and game lifecycle checks.
- `npm run db:setup` — initialize configured Neon storage.
- `npm start` — serve the production build locally.

A live Neon insert cannot be verified until a real `DATABASE_URL` is supplied.

## Migration notes

The source and Git history were moved from the Codex workspace to `E:\BJstudio\PackSociety`. The app now uses Next.js instead of Vinext/Cloudflare Workers. Original local Cloudflare state is retained in ignored work/legacy-cloudflare-state/ for reference. The original workspace project is retained as a recovery copy under the old workspace work/pack-society-before-vercel-source directory. Cloudflare/Sites build configuration was removed from the active project; the old version remains in Git history.

Dinosaur sprites are from Chromium; their licence is in `public/CHROMIUM-LICENSE.txt`.

## Official setup references

- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Neon integration for Vercel](https://vercel.com/marketplace/neon/neon)
- [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver)
- [Vercel Authentication settings](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication)
