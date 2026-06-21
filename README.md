# Aid Compass — Benefits Navigator

Aid Compass helps people find out which US public support programs they may qualify
for, gives them a prioritized action plan with the documents and links they need, and
shows how their benefits change as their income rises.

It screens a household against six major safety-net programs — **SNAP, Medicaid, CHIP,
LIHEAP, WIC, and TANF** — explains the results in plain language, and visualizes the
"benefits cliff": the points where earning more money can actually leave a household
with fewer total resources.

## How it works

The guiding principle is that **the AI never decides who qualifies for anything.**

- A **deterministic rules engine** (pure Python, no network calls, no AI) makes every
  eligibility decision using thresholds from static data files sourced from official
  government publications.
- **AI** does two narrow jobs: it turns a natural-language conversation into a
  structured profile, and it turns the rules engine's output into a warm, readable
  action plan. It is never asked "is this person eligible?"
- Every recommendation **cites its data source and date**, and every plan carries a
  disclaimer that final eligibility is decided by the administering agency.
- **Privacy by design:** anonymous use stays in the browser. No SSN, full name, or
  immigration status is requested, and sessions expire after two hours.

## Features

- **AI intake chat** — a guided, one-question-at-a-time conversation that collects
  household details without asking for sensitive identifiers.
- **Case-worker form mode** — direct structured entry for navigators who prefer it.
- **Eligibility results** — color-coded per-program cards with the reason, estimated
  benefit, document checklist, application link, and source citation.
- **Personalized action plan** — generated in the user's chosen language.
- **Benefits cliff visualization** — net resources charted across income levels, with
  cliff zones explained in plain language.
- **Local resource finder** — nearby food banks, clinics, and offices via OpenStreetMap.
- **Multilingual** — a language dropdown offers 24 languages, and the **entire
  interface** is translated, not just the AI output. UI strings live in static locale
  files (`frontend/src/i18n/locales/`) generated from a single English source; the
  personalized action plan is also written in the selected language. Right-to-left
  scripts (Arabic, Urdu, Persian) flip the layout automatically, and any missing string
  falls back to English so the UI never blanks out.
- **Optional cloud sync** — anonymous users need no account. Signing in with **Clerk**
  lets a user explicitly save a reviewed case file to **Supabase**, protected by
  row-level security so each user can only read their own data.

## AI tooling

- **Anthropic Claude** (`claude-sonnet-4-6` via the Anthropic Python SDK) powers the
  intake conversation and the plain-language action-plan explainer.
- The LLM only converts language ↔ structured data. All dollar figures, thresholds,
  and eligibility outcomes come from the rules engine and static data, never the model.

## Tech stack

| Layer    | Stack |
|----------|-------|
| Backend  | Python 3.11+, FastAPI, Pydantic, Anthropic SDK, httpx |
| Frontend | React 18 + TypeScript, Vite, Tailwind CSS, Recharts, Radix UI, Framer Motion |
| Auth/DB  | Clerk (auth) + Supabase (optional saved case files, RLS-protected) |

## Running the app

### Prerequisites

- Python 3.11+
- Node 20+
- An [Anthropic API key](https://console.anthropic.com/), or any LLM of your choice

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # then add your ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000
```

The API serves at `http://localhost:8000`, with interactive docs at `/docs`.

Backend environment variables (`backend/.env`):

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `ANTHROPIC_API_KEY` | yes | — | From the Anthropic console |
| `FRONTEND_URL` | no | `http://localhost:3000` | Allowed CORS origin |
| `GOOGLE_PLACES_API_KEY` | no | _(blank)_ | Optional; OpenStreetMap is used otherwise |
| `ENVIRONMENT` | no | `development` | |
| `LOG_LEVEL` | no | `INFO` | |

### Frontend

```bash
cd frontend
npm install
npm run dev                       # http://127.0.0.1:5173
```

Frontend environment variables (`frontend/.env`):

| Variable | Required | Notes |
|----------|----------|-------|
| `VITE_API_BASE_URL` | yes | URL of the backend (e.g. `http://localhost:8000`) |
| `VITE_CLERK_PUBLISHABLE_KEY` | no | Enables optional Clerk sign-in |
| `VITE_SUPABASE_URL` | no | Enables optional saved case files |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | no | Supabase publishable (anon) key |
| `VITE_GOOGLE_MAPS_BROWSER_KEY` | no | Optional map for the resource finder |

Start the backend before the frontend. Cloud sign-in and saved case files are entirely
optional — without the Clerk and Supabase keys the app runs fully anonymously.

### Translations (i18n)

The English UI lives in `frontend/src/i18n/locales/en.json` — the single source of
truth. The other 23 languages are static JSON files generated from it by a script that
uses your Anthropic key (placeholders like `{count}` and `<em>` markup are preserved):

```bash
cd frontend
ANTHROPIC_API_KEY=sk-... npm run i18n:generate           # fill any missing strings for all languages
ANTHROPIC_API_KEY=sk-... npm run i18n:generate -- --force # re-translate everything
ANTHROPIC_API_KEY=sk-... npm run i18n:generate -- --lang=es,fr
```

The generated `locales/<code>.json` files are committed and loaded at runtime (English
is bundled; other languages load on demand). When you add or change an English string,
re-run the script to fill in the new keys. To offer a new language, add it to
`frontend/src/i18n/languages.json` and run the generator.

### Tests

The rules engine has deterministic tests for every program and edge case:

```bash
cd backend
pytest modules/rules_engine/tests/ -v
```

## Disclaimer

Aid Compass provides general information only. Final eligibility is determined by the
agency you apply to, not by this tool. It is not legal or financial advice. Verify
current program thresholds with the administering agency before relying on them.

## License

Released under the [MIT License](./LICENSE).
