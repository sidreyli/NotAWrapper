# Vercel deployment

Aid Compass deploys as two Vercel Hobby projects from this repository. Both are
stateless; anonymous case-file state remains in the browser, while signed-in users
can explicitly save reviewed structured state to Supabase.

## 1. Create Clerk and Supabase projects

1. Create a Clerk application and enable the sign-in methods you want, such as
   Google and email.
2. In Clerk, open **Connect with Supabase** and configure the instance for Supabase
   compatibility. This adds the required `role: authenticated` claim.
3. Create a Supabase project. Under **Authentication → Third-Party Auth**, add Clerk
   and use the Clerk domain shown by the Clerk setup flow.
4. Link the repository and apply the migration:

   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```

5. Copy the Supabase project URL and its publishable key. Never expose a secret or
   `service_role` key to the frontend.

The migration in `supabase/migrations` enables RLS and permits a Clerk-authenticated
user to access only the row whose `user_id` equals their token's `sub` claim.

## 2. Deploy the FastAPI project

Create a Vercel project from the repository with the repository root as its Root
Directory. Vercel reads `pyproject.toml` and deploys `backend.main:app` as one Python
function.

Configure these environment variables:

```text
ANTHROPIC_API_KEY=
FRONTEND_URL=https://YOUR_FRONTEND_PROJECT.vercel.app
FRONTEND_ORIGIN_REGEX=
GOOGLE_MAPS_SERVER_API_KEY=
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
GOOGLE_CALENDAR_REDIRECT_URI=https://YOUR_API_PROJECT.vercel.app/api/calendar/google/callback
CALENDAR_STATE_SECRET=
ENVIRONMENT=production
LOG_LEVEL=INFO
```

Generate `CALENDAR_STATE_SECRET` with a cryptographically random value of at least
32 bytes. Do not reuse an API key.

In Google Cloud, register the exact Calendar redirect URI shown above. Restrict the
server Maps key to Places API (New), Geocoding API, and Routes API.

## 3. Deploy the Vite project

Create a second Vercel project from the same repository and set its Root Directory
to `frontend`. Configure:

```text
VITE_API_BASE_URL=https://YOUR_API_PROJECT.vercel.app
VITE_GOOGLE_MAPS_BROWSER_KEY=
VITE_CLERK_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Restrict the browser Maps key to Maps Embed API and add both the production Vercel
URL and any custom domain as HTTP referrers.

After the first frontend deployment:

1. Add its production URL to Clerk's allowed origins and redirect URLs.
2. Set the backend project's `FRONTEND_URL` to that exact URL and redeploy it.
3. If preview deployments need API access, set a narrow
   `FRONTEND_ORIGIN_REGEX` matching only this project's Vercel preview URLs.

## Privacy behavior

- Signing in is optional and never gates a tool.
- Cloud storage occurs only after **Save this case file** is selected.
- Raw uploaded files, chat transcripts, Google OAuth codes, and access tokens are
  never written to Supabase.
- Users can restore, overwrite, or delete their cloud copy from the Action Center.
