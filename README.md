# Chavan's Cafe

Cafe POS, menu, kitchen, inventory, customer, and delivery management app built with React and Vite.

## Run locally

1. Install Node.js.
2. Run `npm install` and then `npm run dev`.

Without Supabase credentials, choose **Continue without Supabase (demo only)** on the startup screen. Demo data is stored only in that browser. Do not enter real customer or payment information in demo mode.

To enable Supabase later, copy `.env.example` to `.env.local` and fill in the Supabase project URL and public anon key. The anon key is intended for browser apps. Never put a Supabase service-role/secret key in `.env.local`, Vercel settings, or frontend code.

## Set up private Supabase access

1. In Supabase, open **SQL Editor**, paste and run [`supabase/schema.sql`](./supabase/schema.sql).
2. In **Authentication** settings, turn off public sign-ups. Staff accounts must be created by the cafe owner.
3. In **Authentication → Users**, create the owner's email/password account.
4. In SQL Editor, replace the example email and run:

   ```sql
   INSERT INTO public.cafe_members (user_id, email)
   SELECT id, email
   FROM auth.users
   WHERE lower(email) = lower('owner@example.com')
   ON CONFLICT (user_id) DO NOTHING;
   ```

5. Add each staff account under **Authentication → Users**, then run the same SQL with that staff member's email. All approved staff accounts can access and edit all cafe data.

The app's role switcher changes the demo display role; it does not restrict permissions. Every account in `cafe_members` has the same access.

## Move existing browser data to Supabase

Browser storage does not move automatically to a new Vercel website address.

1. Before deploying, run the app locally at `http://localhost:3000` on the same computer and browser where its existing records are saved.
2. Sign in, open **Supabase & Data Storage**, and download a JSON backup.
3. Restore that backup in the deployed app using **Restore backup to cloud**.
4. Keep the backup private and store a copy somewhere safe; it contains cafe and customer information.

New changes to cafe settings, menu, orders, tables, inventory, partners, customers, expenses, and feedback sync to Supabase.

## Deploy to Vercel

1. Push this project to a GitHub repository.
2. In Vercel, select **Add New → Project** and import that repository.
3. Vercel uses the included Vite configuration: build command `npm run build`, output directory `dist`.
4. To deploy in local demo mode, leave Vercel's **Environment Variables** blank. To enable Supabase later, add:
   - `VITE_SUPABASE_URL` — the Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY` — the Supabase anon/public key, never the service-role key.
5. Deploy or redeploy the project.
6. With no Supabase environment variables, choose **Continue without Supabase (demo only)**. With Supabase configured, sign in with an approved staff account.

For local development, put these same two public connection values in `.env.local`. That file is ignored by Git.

## Validate

- `npm run lint`
- `npm run build`
