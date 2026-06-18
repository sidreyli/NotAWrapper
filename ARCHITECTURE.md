# Benefits Navigator — Technical Architecture

**Project:** USAII Global AI Hackathon 2026 — Challenge Brief 4: Public Services  
**Track:** Undergraduate / College

---

## System Overview

Benefits Navigator helps people discover which US public support programs they qualify
for, generates a prioritized action plan, and visualizes the "benefits cliff" — the
income range where taking a pay increase causes a net decrease in total resources due
to simultaneous benefit loss.

### Core Architectural Principle

**The LLM never determines eligibility.** This is non-negotiable and must be preserved
across all future changes. The system has two distinct AI roles:

1. **AI Intake (intake module):** Converts natural language conversation into a
   structured `UserProfile` JSON object. It asks questions, handles ambiguity, and
   extracts structured data. It does NOT assess eligibility.

2. **AI Explainer (explainer module):** Converts structured eligibility results
   (produced by the deterministic rules engine) into a human-readable action plan.
   It formats, translates, and explains. It does NOT change eligibility outcomes.

The rules engine sits between these two AI layers and is pure deterministic Python.

```
User language input
       ↓
 [AI INTAKE LAYER]     ← Claude claude-sonnet-4-6 — structures the conversation
       ↓
  UserProfile JSON      ← validated by Pydantic, no LLM involvement
       ↓
 [RULES ENGINE]         ← pure Python, no AI, no network calls
       ↓
 EligibilityResult[]    ← each result has source citation + data_as_of
       ↓
 Static Program Data    ← URLs, documents, notes from JSON files
       ↓
 [AI EXPLAINER LAYER]  ← Claude claude-sonnet-4-6 — narrates the results
       ↓
  ActionPlanResponse    ← includes disclaimer, citations, multilingual
       ↓
  Next.js Frontend      ← displays results, cliff chart, document checklists
```

---

## Module Dependencies

Each module is self-contained and communicates with others only through the schemas
defined in `backend/schemas.py`. Below is the dependency graph — build lower modules
before the ones that depend on them.

| Module | Depends On | Independent Of |
|--------|-----------|----------------|
| **A — Data Layer** | Nothing | All others |
| **B — Rules Engine** | Data Layer (A) | C, D, F |
| **C — Intake (AI)** | Anthropic SDK, schemas only | B, D, E, F |
| **D — Explainer (AI)** | Anthropic SDK, schemas only | B, C, E, F |
| **E — Cliff Calculator** | Data Layer (A), schemas only | C, D, F |
| **F — Resources** | httpx, schemas only | A, B, C, D, E |
| **G — FastAPI API** | All modules (A–F) | H |
| **H — Frontend** | API spec only (G must be running, or mocked) | A–F |

**Build order:** A → B and E (in parallel) → C, D, F (in parallel) → G → H.
The rules engine (B) and cliff calculator (E) can both start as soon as A's static
JSON files exist. The intake (C), explainer (D), and resources (F) modules depend
only on the schemas and external SDKs, so they can be developed at any point.
The frontend (H) can be built against mocked API responses before G is complete.

---

## Supported Scope

To demonstrate depth over breadth:

**Programs:** SNAP, Medicaid, CHIP, LIHEAP, WIC, TANF

**States:** California (CA), Texas (TX), New York (NY), Florida (FL), Illinois (IL)

**Languages:** English (en), Spanish (es)

If a user is in an unsupported state: the API returns a 400 with a message explaining
the current state coverage. The frontend displays this gracefully.

---

## Data Flow — Detailed

### Intake flow

```
Frontend /intake page
│
├─ POST /api/intake/start
│   → SessionManager.create_session()
│   → IntakeConversation.send_message(new_id, "Hello")
│   → Returns IntakeResponse { session_id, reply, is_complete=false }
│
├─ POST /api/intake/message (repeated until is_complete=true)
│   → IntakeConversation.send_message(session_id, user_text)
│     → Claude claude-sonnet-4-6 (system: intake prompt, messages: history)
│     → ProfileExtractor checks for [PROFILE_COMPLETE] marker
│       → If found: validates UserProfile via Pydantic
│   → Returns IntakeResponse { session_id, reply, is_complete, profile? }
│
└─ When is_complete=true:
    → POST /api/eligibility/check { profile }
        → EligibilityEngine.check_all(profile)
        → Returns EligibilityResponse { results[] }
    → POST /api/explain/action-plan { profile, results, language }
        → ActionPlanGenerator.generate(profile, results)
        → Returns ActionPlanResponse { action_plan_text, results, profile }
    → Frontend navigates to /results
```

### Navigator flow (case worker mode)

```
Frontend /navigator page (structured form)
│
├─ User fills UserProfile form directly (no chat)
│
└─ Submit → POST /api/eligibility/check
          → POST /api/explain/action-plan
          → Navigate to /results (same page as intake flow)
```

### Cliff flow

```
Frontend /cliff page
│
└─ POST /api/cliff/calculate { profile, min:0, max:5000, step:50 }
    → CliffCalculator.calculate(profile, ...)
      → Iterates income from 0 to max in steps
      → Computes benefit values at each income level (rules-based, no AI)
      → Detects cliff zones (income ranges where net_resources decreases)
    → Returns CliffResponse { data_points[], cliff_zones[] }
    → Frontend renders cliff chart (library choice open)
```

---

## REST API Specification

Base URL: `http://localhost:8000`

All successful responses return HTTP 200 with JSON body.
All errors return the appropriate HTTP status code with body:
`{ "error": "description", "code": "ERROR_CODE", "status": 4xx }`

---

### `GET /health`

Response:
```json
{ "status": "ok", "version": "1.0.0" }
```

---

### `POST /api/intake/start`

No request body.

Response (`IntakeResponse`):
```json
{
  "session_id": "uuid-string",
  "reply": "Hi! I'm here to help you find benefits programs...",
  "is_complete": false,
  "profile": null
}
```

---

### `POST /api/intake/message`

Request (`IntakeRequest`):
```json
{
  "session_id": "uuid-string",
  "message": "I live in California and I have two kids"
}
```

Response (`IntakeResponse`):
```json
{
  "session_id": "uuid-string",
  "reply": "Thank you! How many people total are in your household?",
  "is_complete": false,
  "profile": null
}
```

When complete:
```json
{
  "session_id": "uuid-string",
  "reply": "I have everything I need. Let me check your eligibility now.",
  "is_complete": true,
  "profile": { "state": "CA", "household_size": 3, ... }
}
```

Errors:
- `404` — `SESSION_NOT_FOUND`: session_id not in store or expired
- `502` — `AI_UNAVAILABLE`: Anthropic API call failed

---

### `POST /api/eligibility/check`

Request: Full `UserProfile` object.

Response (`EligibilityResponse`):
```json
{
  "results": [
    {
      "program_id": "snap",
      "program_name": "SNAP",
      "status": "likely_eligible",
      "confidence": 0.85,
      "reason": "Household income of $1,500/month is below the gross limit of $2,885/month for a household of 3.",
      "eligibility_factors": [
        {
          "factor_name": "gross_income_test",
          "user_value": "$1,500/month",
          "threshold": "$2,885/month (130% of FPL for 3 people)",
          "passes": true,
          "note": null
        }
      ],
      "estimated_monthly_benefit": "~$394/month (estimated)",
      "required_documents": ["Photo ID", "Proof of residency", "..."],
      "apply_url": "https://www.getcalfresh.org/",
      "more_info_url": "https://www.fns.usda.gov/snap/recipient/eligibility",
      "data_source": "USDA Food and Nutrition Service",
      "data_as_of": "FY2026 (October 2025)"
    }
  ],
  "checked_at": "2026-06-14T10:30:00Z"
}
```

Errors:
- `400` — `UNSUPPORTED_STATE`: state not in [CA, TX, NY, FL, IL]
- `422` — Pydantic validation error

---

### `POST /api/explain/action-plan`

Request (`ExplainRequest`):
```json
{
  "profile": { ... UserProfile ... },
  "results": [ ... EligibilityResult[] ... ],
  "language": "en"
}
```

Response (`ActionPlanResponse`):
```json
{
  "action_plan_text": "Based on what you've shared, here are the programs you may qualify for...\n\n**SNAP (Food Assistance)**\n...",
  "profile": { ... },
  "results": [ ... ],
  "generated_at": "2026-06-14T10:30:05Z",
  "disclaimer": "This tool provides general guidance only..."
}
```

Errors:
- `502` — `AI_UNAVAILABLE`

---

### `POST /api/cliff/calculate`

Request (`CliffRequest`):
```json
{
  "profile": { ... UserProfile ... },
  "min_income": 0,
  "max_income": 5000,
  "step": 50
}
```

Response (`CliffResponse`):
```json
{
  "profile": { ... },
  "data_points": [
    {
      "monthly_income": 0,
      "snap_benefit": 768.0,
      "medicaid_value": 400.0,
      "chip_value": 200.0,
      "liheap_value": 58.0,
      "wic_value": 0.0,
      "total_benefit_value": 1426.0,
      "net_resources": 1426.0
    },
    { "monthly_income": 50, ... },
    ...
  ],
  "cliff_zones": [
    {
      "income_start": 2250,
      "income_end": 2400,
      "description": "SNAP eligibility ends. Net resources decrease briefly.",
      "benefit_lost": "SNAP",
      "net_change": -185.0
    }
  ],
  "calculated_at": "2026-06-14T10:30:10Z"
}
```

Errors:
- `400` — `INVALID_RANGE`: max_income > 10000 or step < 10

---

### `GET /api/resources?zip_code=90001&state=CA`

Query params (both optional): `zip_code`, `state`

Response (`ResourcesResponse`):
```json
{
  "resources": [
    {
      "name": "Downtown Food Bank",
      "category": "food",
      "address": "123 Main St, Los Angeles, CA 90001",
      "phone": "+1-213-555-0100",
      "website": "https://example.org",
      "lat": 34.0522,
      "lon": -118.2437
    }
  ],
  "source": "OpenStreetMap",
  "zip_code": "90001"
}
```

---

## Program Eligibility Rules Reference

This section documents the logic encoded in the rules engine for each program.
These are the actual rules as of 2026. See `CLAUDE.md` for implementation details.

### Federal Poverty Level (2026 FPL)

Published by HHS ASPE, effective January 14, 2026.

| Household Size | Annual FPL (48 states + DC) | Monthly |
|---|---|---|
| 1 | $15,960 | $1,330 |
| 2 | $21,640 | $1,803 |
| 3 | $27,320 | $2,277 |
| 4 | $33,000 | $2,750 |
| 5 | $38,680 | $3,223 |
| Each additional | +$5,680 | +$473 |

---

### SNAP (Supplemental Nutrition Assistance Program)

Source: USDA FNS, FY2026 (Oct 1, 2025 – Sep 30, 2026)  
Legal citation: 7 C.F.R. § 273.9

**Income Tests (most households):**
- Gross income ≤ 130% FPL monthly (see snap_2026.json)
- Net income ≤ 100% FPL monthly (after deductions)
- Asset limit: $4,500 (or $9,000 with elderly/disabled member)

**Net income calculation:**
`net = gross − (earned_income × 0.20) − standard_deduction`

Standard deductions: $204 (1–3 people), $217 (4), $254 (5), $291 (6+)

**Estimated benefit:**
`max(0, max_allotment − (net_income × 0.30))`

**Max monthly allotments FY2026:**

| Size | Max Allotment |
|---|---|
| 1 | $292 |
| 2 | $536 |
| 3 | $768 |
| 4 | $975 |
| 5 | $1,155 |

**Categorical eligibility:** Households receiving TANF, SSI, or Medicaid may be
automatically income-eligible in states with broad categorical eligibility
(CA, NY, IL among our 5 supported).

**Exceptions:**
- Elderly (60+) and disabled households are exempt from the gross income test
  (net income test only)
- Students enrolled at least half-time in higher education generally ineligible unless
  they meet specific exceptions (not modeled — flag as UNABLE_TO_DETERMINE if student)

---

### Medicaid (Adult Health Coverage)

Source: CMS, 2026. Legal citation: 42 C.F.R. § 435

**ACA Expansion States (CA, NY, IL):**
- Adults age 19–64: ≤ 138% FPL annual income
- 138% FPL monthly thresholds:
  - 1 person: $1,835/month
  - 2 people: $2,489/month
  - 3 people: $3,143/month
  - 4 people: $3,795/month

**Non-Expansion States (TX, FL):**
- Non-disabled adults without dependent children: generally ineligible regardless of income
- Adults with disabilities: complex eligibility — flag as POSSIBLY_ELIGIBLE, direct to agency
- Children and pregnant women: covered separately via CHIP / pregnancy Medicaid

**Pregnancy Medicaid:** Most states cover pregnant women up to 138–200% FPL.
Model as POSSIBLY_ELIGIBLE for pregnant women in TX and FL; direct to agency.

---

### CHIP (Children's Health Insurance Program)

Source: CMS, 2026. Legal citation: 42 C.F.R. § 457

Only applicable to households with children under 18.

**Income limits by state (monthly, household of 4):**

| State | FPL % | Monthly limit (4-person HH) |
|---|---|---|
| CA | 266% | ~$7,314/month |
| TX | 201% | ~$5,524/month |
| NY | 400% | ~$10,998/month |
| FL | 215% | ~$5,909/month |
| IL | 313% | ~$8,602/month |

Calculate using: `fpl_loader.get_income_at_pct_monthly(state_chip_pct, household_size, state)`

---

### LIHEAP (Low Income Home Energy Assistance Program)

Source: HHS OCS, 2026. Legal citation: 42 U.S.C. § 8624

**Federal minimum:** 150% FPL. States may set higher thresholds.

| State | Max FPL % | Program Name |
|---|---|---|
| CA | 200% | HEAP |
| TX | 150% | CEAP |
| NY | 200% | HEAP |
| FL | 150% | LIHEAP |
| IL | 200% | LIHEAP |

**Important constraints:**
- Applicant must be responsible for paying a home energy bill
- Unhoused individuals and shelter residents are ineligible
- Program is funded annually with limited funds — seasonal application windows apply
- Set confidence ≤ 0.80 for all LIHEAP results due to funding variability

---

### WIC (Women, Infants, and Children)

Source: USDA FNS, 2026. Legal citation: 7 C.F.R. § 246

**Income limit:** 185% FPL (federal maximum)

| Household Size | 185% FPL Monthly |
|---|---|
| 1 | $2,461/month |
| 2 | $3,333/month |
| 3 | $4,205/month |
| 4 | $5,075/month |

**Categorical income eligibility:** If household already receives SNAP, Medicaid,
or TANF, income eligibility for WIC is automatic.

**Demographic eligibility (must meet at least one):**
- Pregnant women (any trimester)
- Postpartum women (up to 6 months after delivery)
- Breastfeeding women (up to 12 months after delivery)
- Children under 5 years old

---

### TANF (Temporary Assistance for Needy Families)

Source: HHS ACF, 2026. Legal citation: 42 U.S.C. § 601

TANF rules are highly state-variable. The rules engine returns POSSIBLY_ELIGIBLE
for likely candidates with a clear directive to contact the state agency.

**General indicators (not definitive):**
- Household must include children under 18
- Very low income (typically below 50% FPL)
- Work requirements apply in most states
- Federal lifetime limit: 60 months

The rules engine does not attempt precise TANF eligibility. This is by design.

---

## Benefits Cliff Algorithm

The cliff calculator does not call the rules engine (to avoid circular imports).
It reimplements income threshold lookups inline using the data layer.

For each income level `i` from `min_income` to `max_income` in `step` increments:

```
# 1. SNAP benefit at income i
if i > snap_gross_limit(household_size):
    snap = 0
else:
    earned = i if employed else 0
    net = i - (earned * 0.20) - standard_deduction(household_size)
    net = max(0, net)
    snap = max(0, max_allotment(household_size) - (net * 0.30))

# 2. Medicaid value (imputed) — $400/month per adult if eligible
if expansion_state and i <= medicaid_monthly_threshold(household_size, state):
    medicaid = 400 * adults
else:
    medicaid = 0

# 3. CHIP value (imputed) — $200/month per child if eligible
if children > 0 and i <= chip_monthly_threshold(household_size, state):
    chip = 200 * children_under_18
else:
    chip = 0

# 4. LIHEAP value (imputed, annualized to monthly)
if housing_not_homeless and i <= liheap_monthly_threshold(household_size, state):
    liheap = 58  # average national monthly equivalent
else:
    liheap = 0

# 5. WIC value (if eligible demographics present)
wic_persons = pregnant_women + infants_under_5
if wic_persons > 0 and i <= wic_monthly_threshold(household_size, state):
    wic = 60 * wic_persons
else:
    wic = 0

total_benefits = snap + medicaid + chip + liheap + wic
net_resources = i + total_benefits
```

**Cliff zone detection:**
A cliff zone exists where `net_resources[i+step] < net_resources[i]` for at least
one step. Track which benefit transitions caused the drop.

---

## Frontend Architecture

The frontend is Next.js with TypeScript. All library, routing strategy, state
management, component structure, and styling decisions are left to the frontend
developer. The following defines functional requirements only.

### Pages and Responsibilities

| Page | Purpose | API calls made |
|------|---------|---------------|
| Home `/` | Landing, mode selection, language toggle | None |
| Intake (chat) | AI-driven conversational intake | `intake/start`, `intake/message`, `eligibility/check`, `explain/action-plan` |
| Navigator (form) | Structured form for case workers | `eligibility/check`, `explain/action-plan` |
| Results | Displays action plan and program cards | None (data from previous page) |
| Cliff | Benefits cliff chart + cliff zone list | `cliff/calculate` |

### State Requirements

The frontend must hold the following data across page navigations:
- `sessionId` — the current intake session
- `profile` — completed `UserProfile` (set after intake)
- `results` — `EligibilityResult[]` (set after eligibility check)
- `actionPlan` — `ActionPlanResponse` (set after explain call)
- `cliffData` — `CliffResponse` (set after cliff call)
- `language` — "en" or "es"

How this is implemented (React context, Zustand, Redux, localStorage, URL params,
server state, etc.) is entirely the frontend developer's choice.

### Internationalization

The UI must support English and Spanish. Method is the frontend developer's choice.
The `action_plan_text` field from the backend is already in the correct language —
do not translate it in the frontend. Pass `language` ("en" or "es") to
`explain/action-plan` calls so the backend LLM responds in the right language.

### Eligibility Status Visual Treatment

These five status values must be visually distinct. Implementation is open:

| Status | Meaning |
|--------|---------|
| `likely_eligible` | Strong match — positive signal |
| `possibly_eligible` | Possible match — cautious signal |
| `likely_ineligible` | Doesn't match — neutral |
| `already_receiving` | Already enrolled — informational |
| `unable_to_determine` | Needs human review — attention |

### Cliff Chart Requirements

The chart (library choice open) must show:
- X-axis: `monthly_income` in dollars
- Y-axis: `net_resources` (income + all benefits)
- A reference line at the user's current `monthly_gross_income`
- Cliff zones visually highlighted or listed below
- Tooltip showing the benefit breakdown at any income point:
  `snap_benefit`, `medicaid_value`, `chip_value`, `liheap_value`, `wic_value`

### Next.js API Proxy

Configure `next.config.js` to rewrite `/api/*` to the backend:

```js
module.exports = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: 'http://localhost:8000/api/:path*' }];
  },
};
```

---

## External APIs Used

| API | Used For | Auth | Rate Limit | Fallback |
|---|---|---|---|---|
| Anthropic API (claude-sonnet-4-6) | Intake + Explainer | API key | Tier-dependent | HTTP 502 response |
| HHS ASPE Poverty Guidelines | FPL data | None | None | hardcoded fpl_2026.json |
| OSM Overpass API | Local resources | None | ~10k/day | Return empty list |
| Nominatim (OSM) | Zip code geocoding | None | 1 req/sec | Return null coordinates |

**Note on 211 APIs:** The 211 National Data Platform (apiportal.211.org) requires
a partnership agreement. We do not use it. OSM covers food banks, clinics, community
centers, and government offices adequately for demo purposes.

**Note on Benefits.gov:** Benefits.gov has program descriptions but its API returns
limited eligibility data. We use USDA/HHS source data directly instead.

---

## Session Management

Sessions are stored in a Python dictionary in memory (not database, not Redis).

- Each session: `{ session_id, messages[], profile, is_complete, created_at, updated_at }`
- TTL: 2 hours from `updated_at`
- Cleanup: the session_manager's `cleanup_expired_sessions()` is called at the start
  of each `/api/intake/message` request
- No sessions are persisted to disk
- Server restart clears all sessions (acceptable for hackathon)

**Privacy implication:** No user data persists beyond the 2-hour session window.
The only data transmitted to Anthropic is the conversation messages, subject to
Anthropic's API usage policies.

---

## Responsible AI Design

### Hallucination prevention

The rules engine is the single source of truth for all eligibility decisions.
The LLM explainer receives the results verbatim and is explicitly prompted not to
change status or invent numbers. Every EligibilityResult carries `data_source` and
`data_as_of` fields that the explainer must cite.

### Bias considerations

| Risk | Mitigation |
|---|---|
| Language barrier | Full Spanish translation; LLM responds in user's language |
| Digital access | Navigator (case worker) mode requires no end-user tech literacy |
| Non-expansion states | TX and FL Medicaid limitations are modeled explicitly, not silently ignored |
| Immigration status | Never collected; citizenship_status defaults to "prefer_not_to_say" |
| Overconfidence | Confidence scores surfaced in UI; LIHEAP capped at 0.80 due to funding variability |

### Uncertainty handling

The system returns `UNABLE_TO_DETERMINE` (not a guess) when:
- State is not supported
- Program rule encounters an unexpected input combination
- The rules engine catches an unhandled exception for a specific program

The frontend displays `UNABLE_TO_DETERMINE` as "Needs Further Review" with a
prompt to call 211 or contact the agency directly.

### Privacy

- No SSN collected at any point
- No full names collected
- No dates of birth collected
- Sessions expire in 2 hours
- Income is collected as a range-compatible number (not linked to any identity)
- The disclaimer on every action plan states this is not legal or financial advice

---

## Testing Strategy

### Rules Engine (required, 100% coverage of happy paths)

Each program must have:
- At least 1 LIKELY_ELIGIBLE test per supported state
- At least 1 LIKELY_INELIGIBLE test
- ALREADY_RECEIVING test
- UNABLE_TO_DETERMINE test (unsupported state)
- Edge cases documented in comments

### API Integration Tests (optional, recommended)

Use `fastapi.testclient.TestClient` with mocked Anthropic client to test:
- `/api/intake/start` returns a session_id
- `/api/eligibility/check` with a known profile returns expected results
- `/api/cliff/calculate` returns correct number of data points

### Frontend (optional, recommended)

Use whatever testing library is standard for the frontend developer's Next.js setup
(e.g., Vitest, Jest, React Testing Library, Playwright for E2E). At minimum, verify:
- Eligibility status badges render distinctly for each of the five statuses
- The cliff chart renders without crashing when given valid `CliffResponse` data
- The navigator form correctly prevents submission with missing required fields

---

## Deployment Notes (post-hackathon)

To move beyond the hackathon:
1. Replace in-memory sessions with Redis or a database
2. Add rate limiting per IP on intake endpoints
3. Add proper logging with session_id (no PII in logs)
4. Add FPL auto-refresh: fetch HHS API weekly, update static fallback JSON
5. Expand state support (add program rules per state using the same pattern)
6. Add more programs (SSI, SSDI, EITC) using the same `ProgramRule` base class

---

## Scope Limitations (Be Explicit in Presentation)

- **5 states only:** CA, TX, NY, FL, IL. All others return 400.
- **6 programs:** SNAP, Medicaid, CHIP, LIHEAP, WIC, TANF. No SSI, SSDI, EITC, housing.
- **No household complexity modeling:** We do not model mixed-citizenship households,
  students in school, migrant workers, or other edge-case demographic situations.
- **Income simplification:** We use gross monthly income only. We estimate net income
  using standard deductions only (no excess shelter, medical expense, or dependent
  care deductions).
- **TANF is a referral only:** Too state-variable for precise eligibility. We screen
  and direct.
- **No form pre-fill:** We identify and link to applications; we do not pre-fill forms.
- **Local resources are best-effort:** OSM coverage is strong in cities, sparse in rural areas.

These are honest constraints that show system design maturity, not weaknesses.

---

## Data Freshness Policy

| Data | Source | Update Frequency | Current As Of |
|---|---|---|---|
| FPL thresholds | HHS ASPE API + fpl_2026.json | Annual (January) | January 14, 2026 |
| SNAP income limits | usda.gov / snap_2026.json | Annual (October) | October 2025 |
| SNAP max allotments | usda.gov / snap_2026.json | Annual (October) | October 2025 |
| Medicaid thresholds | state_programs.json | Annual | 2026 |
| CHIP thresholds | state_programs.json | Annual | 2026 |
| LIHEAP thresholds | state_programs.json | Annual | 2026 |
| Application URLs | programs.json | As needed | June 2026 |
| OSM local resources | Overpass live query | Real-time | Live |

All `EligibilityResult` objects include `data_source` and `data_as_of` fields
which are surfaced in the action plan and the UI.

---

## Quick Reference: Key File Locations

| What | Where |
|---|---|
| All Pydantic schemas | `backend/schemas.py` |
| FPL data (2026) | `backend/modules/data_layer/static/fpl_2026.json` |
| SNAP tables | `backend/modules/data_layer/static/snap_2026.json` |
| State program thresholds | `backend/modules/data_layer/static/state_programs.json` |
| Program info (docs, URLs) | `backend/modules/data_layer/static/programs.json` |
| Intake system prompt | `backend/modules/intake/prompt_builder.py` |
| Explainer prompt | `backend/modules/explainer/prompt_builder.py` |
| Rules engine orchestrator | `backend/modules/rules_engine/engine.py` |
| SNAP rules | `backend/modules/rules_engine/programs/snap.py` |
| Cliff algorithm | `backend/modules/cliff/calculator.py` |
| All API routes | `backend/api/routes/` |
| Frontend TypeScript types | `frontend/` — location determined by frontend developer |
| Frontend API client | `frontend/` — location determined by frontend developer |
