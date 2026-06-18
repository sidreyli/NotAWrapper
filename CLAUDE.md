# Benefits Navigator — Claude Code Build Instructions

## What You Are Building

A benefits eligibility navigator system for the USAII Global AI Hackathon 2026,
Challenge Brief 4: "Public Services — Fix Systems People Depend On."

The system helps people discover which US public support programs they qualify for
(SNAP, Medicaid, CHIP, LIHEAP, WIC, TANF), produces a prioritized action plan with
required documents and application links, and visualizes the "benefits cliff" (how
net resources change as income rises).

Also read `architecture.md` for the full API spec, program rules rationale, and
module dependency map.

---

## Non-Negotiable Invariants

These rules must never be violated anywhere in the codebase:

1. **The rules engine NEVER calls any AI API.** It is pure Python with no external
   network calls. Eligibility is determined by deterministic logic only.

2. **The LLM NEVER determines eligibility.** It only converts natural language to
   structured profiles (intake), and converts eligibility results to plain language
   (explainer). The rules engine output is injected verbatim into explainer prompts.

3. **No PII is stored.** Sessions are in-memory only. No SSN, exact address, or
   full name is ever collected. Sessions expire after 2 hours of inactivity.

4. **Every program recommendation must include a `data_source` and `data_as_of`
   field.** The LLM explainer must cite these in every action plan.

5. **Eligibility thresholds come only from the static data files** in
   `backend/modules/data_layer/static/`. The LLM must never invent a dollar figure.

6. **The explainer prompt must always include this disclaimer (in user's language):**
   "This tool provides general information only. Final eligibility is determined
   by the agency you apply to, not by this tool. This is not legal or financial advice."

7. **The cliff calculator uses only the rules engine and data layer** — no AI.

8. **The Anthropic model string is always `claude-sonnet-4-6`.** Do not use any
   other model string anywhere.

9. **All API routes return consistent JSON error format on failure:**
   `{"error": "description", "code": "ERROR_CODE", "status": 400}`

10. **CORS is enabled** for `http://localhost:3000` (Next.js dev default) and the
    deployed frontend URL set in `FRONTEND_URL` env var.

---

## Tech Stack

### Backend
- Python 3.11+
- FastAPI 0.111.0
- Uvicorn 0.29.0 (standard extras)
- Anthropic Python SDK 0.28.0
- Pydantic 2.7.0
- httpx 0.27.0 (for external API calls with timeout)
- python-dotenv 1.0.1
- pytest 8.2.0
- pytest-asyncio 0.23.7

### Frontend
- Node 20+
- Next.js 14+ (App Router or Pages Router — frontend developer's choice)
- TypeScript
- Tailwind CSS (configuration and class choices left to frontend developer)
- All other frontend decisions (state management, chart library, i18n library,
  HTTP client, component library) are left entirely to the frontend developer.
  See the Frontend Functional Spec section below for what each page must do.

---

## Directory Structure

Create this exact structure. Do not create additional files unless specified.

```
benefits-navigator/
├── CLAUDE.md
├── architecture.md
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── schemas.py                          ← all Pydantic models
│   ├── requirements.txt
│   ├── .env.example
│   ├── pytest.ini
│   ├── modules/
│   │   ├── data_layer/
│   │   │   ├── __init__.py
│   │   │   ├── fpl.py                      ← FPL loader (HHS API + fallback)
│   │   │   ├── snap_tables.py              ← SNAP income/benefit table lookups
│   │   │   ├── program_registry.py         ← static program info loader
│   │   │   └── static/
│   │   │       ├── fpl_2026.json
│   │   │       ├── snap_2026.json
│   │   │       ├── programs.json
│   │   │       └── state_programs.json
│   │   ├── rules_engine/
│   │   │   ├── __init__.py
│   │   │   ├── engine.py                   ← orchestrates all program checks
│   │   │   ├── base.py                     ← abstract ProgramRule class
│   │   │   ├── programs/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── snap.py
│   │   │   │   ├── medicaid.py
│   │   │   │   ├── chip.py
│   │   │   │   ├── liheap.py
│   │   │   │   ├── wic.py
│   │   │   │   └── tanf.py
│   │   │   └── tests/
│   │   │       ├── __init__.py
│   │   │       ├── fixtures.py             ← shared UserProfile test fixtures
│   │   │       ├── test_snap.py
│   │   │       ├── test_medicaid.py
│   │   │       ├── test_chip.py
│   │   │       ├── test_liheap.py
│   │   │       └── test_wic.py
│   │   ├── intake/
│   │   │   ├── __init__.py
│   │   │   ├── session_manager.py          ← in-memory session store
│   │   │   ├── conversation.py             ← LLM intake conversation driver
│   │   │   ├── prompt_builder.py           ← builds system + user prompts
│   │   │   └── profile_extractor.py        ← parses + validates LLM JSON output
│   │   ├── explainer/
│   │   │   ├── __init__.py
│   │   │   ├── action_plan.py              ← generates action plan from results
│   │   │   └── prompt_builder.py           ← builds explainer prompts
│   │   ├── cliff/
│   │   │   ├── __init__.py
│   │   │   └── calculator.py               ← benefits cliff calculation
│   │   └── resources/
│   │       ├── __init__.py
│   │       ├── overpass.py                 ← OpenStreetMap Overpass API client
│   │       └── normalizer.py               ← normalize OSM results to Resource model
│   └── api/
│       ├── __init__.py
│       ├── middleware.py                   ← CORS, error handling
│       └── routes/
│           ├── __init__.py
│           ├── intake.py
│           ├── eligibility.py
│           ├── explain.py
│           ├── cliff.py
│           └── resources.py
├── frontend/
│   └── (Next.js app — structure determined by frontend developer)
│       The frontend must consume the REST API defined in this document.
│       See "Frontend Functional Spec" for page-level requirements.
```

---

## Build Sequence

Build modules in this order to respect dependencies:

1. `backend/schemas.py` — all Pydantic models (everything depends on this)
2. `backend/config.py` — settings and env loading
3. `modules/data_layer/` — static data files + loaders (no external deps)
4. `modules/rules_engine/` — eligibility logic (depends on data_layer)
5. `modules/intake/` — LLM intake conversation (depends on Anthropic SDK + schemas)
6. `modules/explainer/` — LLM action plan (depends on Anthropic SDK + schemas)
7. `modules/cliff/` — cliff calculation (depends on rules_engine + data_layer)
8. `modules/resources/` — local resource finder (depends on httpx)
9. `backend/api/` — FastAPI routes (depends on all modules)
10. `backend/main.py` — FastAPI app assembly
11. `frontend/` — Next.js frontend (API contracts are finalized once step 9 is complete;
    frontend can be built against mocked API responses before that)

---

## Module A: Data Layer

### `backend/modules/data_layer/static/fpl_2026.json`

```json
{
  "source": "HHS ASPE Poverty Guidelines",
  "url": "https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines",
  "effective_date": "2026-01-14",
  "federal_register_date": "2026-01-15",
  "contiguous_48_and_dc": {
    "base": 15960,
    "increment_per_person": 5680,
    "by_size": {
      "1": 15960, "2": 21640, "3": 27320, "4": 33000,
      "5": 38680, "6": 44360, "7": 50040, "8": 55720
    }
  },
  "alaska": {
    "base": 19950,
    "increment_per_person": 7090,
    "by_size": {
      "1": 19950, "2": 27040, "3": 34130, "4": 41220,
      "5": 48310, "6": 55400, "7": 62490, "8": 69580
    }
  },
  "hawaii": {
    "base": 18360,
    "increment_per_person": 6530,
    "by_size": {
      "1": 18360, "2": 24890, "3": 31420, "4": 37950,
      "5": 44480, "6": 51010, "7": 57540, "8": 64070
    }
  }
}
```

### `backend/modules/data_layer/static/snap_2026.json`

```json
{
  "source": "USDA Food and Nutrition Service",
  "url": "https://www.fns.usda.gov/snap/recipient/eligibility",
  "fiscal_year": "FY2026",
  "period": "October 1, 2025 – September 30, 2026",
  "verification_note": "Verify current values at fns.usda.gov before production use",
  "gross_income_limits_monthly": {
    "note": "130% of 2025 FPL. Applies to most households.",
    "1": 1695, "2": 2290, "3": 2885, "4": 3479,
    "5": 4074, "6": 4669, "7": 5263, "8": 5858,
    "increment_per_additional": 595
  },
  "net_income_limits_monthly": {
    "note": "100% of 2025 FPL. After allowable deductions.",
    "1": 1304, "2": 1763, "3": 2219, "4": 2677,
    "5": 3135, "6": 3592, "7": 4050, "8": 4508,
    "increment_per_additional": 458
  },
  "maximum_allotments_monthly": {
    "note": "Maximum SNAP benefit. Verify at fns.usda.gov.",
    "1": 292, "2": 536, "3": 768, "4": 975,
    "5": 1155, "6": 1386, "7": 1532, "8": 1751,
    "increment_per_additional": 219
  },
  "standard_deductions_monthly": {
    "note": "Standard deduction by household size.",
    "1": 204, "2": 204, "3": 204, "4": 217, "5": 254, "6": 291
  },
  "asset_limits": {
    "standard_households": 4500,
    "elderly_or_disabled_member": 9000
  },
  "earned_income_deduction_rate": 0.20,
  "benefit_calculation_note": "Benefit = max(0, max_allotment - (net_income * 0.3)). net_income = gross - (earned_income * 0.20) - standard_deduction."
}
```

### `backend/modules/data_layer/static/state_programs.json`

```json
{
  "CA": {
    "name": "California",
    "medicaid_expansion": true,
    "medicaid_adult_fpl_pct": 138,
    "medicaid_program_name": "Medi-Cal",
    "medicaid_apply_url": "https://www.coveredca.com/medi-cal/",
    "chip_fpl_pct": 266,
    "chip_program_name": "Medi-Cal CHIP",
    "chip_apply_url": "https://www.coveredca.com/medi-cal/",
    "liheap_fpl_pct": 200,
    "liheap_program_name": "HEAP",
    "liheap_apply_url": "https://www.csd.ca.gov/Pages/Energy-Assistance.aspx",
    "snap_apply_url": "https://www.getcalfresh.org/",
    "snap_broad_categorical_eligibility": true,
    "tanf_program_name": "CalWORKs",
    "tanf_apply_url": "https://benefitscal.com/"
  },
  "TX": {
    "name": "Texas",
    "medicaid_expansion": false,
    "medicaid_adult_fpl_pct": null,
    "medicaid_nonexpansion_note": "Texas has not expanded Medicaid. Non-disabled adults without dependent children generally do not qualify regardless of income.",
    "medicaid_program_name": "Medicaid",
    "medicaid_apply_url": "https://www.yourtexasbenefits.com/",
    "chip_fpl_pct": 201,
    "chip_program_name": "CHIP",
    "chip_apply_url": "https://www.yourtexasbenefits.com/",
    "liheap_fpl_pct": 150,
    "liheap_program_name": "CEAP",
    "liheap_apply_url": "https://www.tdhca.state.tx.us/community-affairs/ceap/index.htm",
    "snap_apply_url": "https://www.yourtexasbenefits.com/",
    "snap_broad_categorical_eligibility": false,
    "tanf_program_name": "TANF",
    "tanf_apply_url": "https://www.yourtexasbenefits.com/"
  },
  "NY": {
    "name": "New York",
    "medicaid_expansion": true,
    "medicaid_adult_fpl_pct": 138,
    "medicaid_program_name": "Medicaid",
    "medicaid_apply_url": "https://www.health.ny.gov/health_care/medicaid/",
    "chip_fpl_pct": 400,
    "chip_program_name": "Child Health Plus",
    "chip_apply_url": "https://www.health.ny.gov/health_care/child_health_plus/",
    "liheap_fpl_pct": 200,
    "liheap_program_name": "HEAP",
    "liheap_apply_url": "https://otda.ny.gov/programs/heap/",
    "snap_apply_url": "https://mybenefits.ny.gov/",
    "snap_broad_categorical_eligibility": true,
    "tanf_program_name": "Family Assistance",
    "tanf_apply_url": "https://mybenefits.ny.gov/"
  },
  "FL": {
    "name": "Florida",
    "medicaid_expansion": false,
    "medicaid_adult_fpl_pct": null,
    "medicaid_nonexpansion_note": "Florida has not expanded Medicaid. Non-disabled adults without dependent children typically do not qualify.",
    "medicaid_program_name": "Florida Medicaid",
    "medicaid_apply_url": "https://www.myflorida.com/accessflorida/",
    "chip_fpl_pct": 215,
    "chip_program_name": "Florida KidCare",
    "chip_apply_url": "https://www.floridakidcare.org/",
    "liheap_fpl_pct": 150,
    "liheap_program_name": "LIHEAP",
    "liheap_apply_url": "https://www.myflfamilies.com/service-programs/community-action",
    "snap_apply_url": "https://www.myflorida.com/accessflorida/",
    "snap_broad_categorical_eligibility": false,
    "tanf_program_name": "TANF",
    "tanf_apply_url": "https://www.myflorida.com/accessflorida/"
  },
  "IL": {
    "name": "Illinois",
    "medicaid_expansion": true,
    "medicaid_adult_fpl_pct": 138,
    "medicaid_program_name": "Illinois Medicaid",
    "medicaid_apply_url": "https://abe.illinois.gov/",
    "chip_fpl_pct": 313,
    "chip_program_name": "All Kids",
    "chip_apply_url": "https://abe.illinois.gov/",
    "liheap_fpl_pct": 200,
    "liheap_program_name": "LIHEAP",
    "liheap_apply_url": "https://www.illinoisenergyassistance.org/",
    "snap_apply_url": "https://abe.illinois.gov/",
    "snap_broad_categorical_eligibility": true,
    "tanf_program_name": "TANF",
    "tanf_apply_url": "https://abe.illinois.gov/"
  }
}
```

### `backend/modules/data_layer/static/programs.json`

```json
{
  "snap": {
    "id": "snap",
    "name": "SNAP",
    "full_name": "Supplemental Nutrition Assistance Program",
    "colloquial": "Food Stamps",
    "category": "food",
    "description": "Monthly electronic benefit to help purchase groceries.",
    "national_apply_url": "https://www.fns.usda.gov/snap/state-directory",
    "more_info_url": "https://www.fns.usda.gov/snap/recipient/eligibility",
    "data_source": "USDA Food and Nutrition Service",
    "data_as_of": "FY2026 (October 2025)",
    "processing_time_days": "30 (7 if expedited)",
    "renewal_period": "12 months (24 months for some households)",
    "imputed_monthly_value_note": "Use maximum_allotments_monthly from snap_2026.json for cliff modeling",
    "required_documents": [
      "Photo ID (driver's license, state ID, or passport)",
      "Proof of residency (utility bill, lease, or recent mail)",
      "Social Security numbers for all household members applying",
      "Proof of income (recent pay stubs, employer letter, or most recent tax return)",
      "Proof of allowable expenses (rent/mortgage, utilities, childcare if claiming deductions)"
    ]
  },
  "medicaid": {
    "id": "medicaid",
    "name": "Medicaid",
    "full_name": "Medicaid Health Coverage",
    "colloquial": "Medicaid",
    "category": "health",
    "description": "Free or low-cost comprehensive health coverage for adults.",
    "national_apply_url": "https://www.healthcare.gov/medicaid-chip/",
    "more_info_url": "https://www.medicaid.gov/medicaid/eligibility/index.html",
    "data_source": "Centers for Medicare & Medicaid Services (CMS)",
    "data_as_of": "2026",
    "processing_time_days": "45 (90 if disability involved)",
    "renewal_period": "Annual",
    "imputed_monthly_value": 400,
    "imputed_monthly_value_note": "Approximate value of adult Medicaid coverage for cliff modeling. Not a real dollar benefit.",
    "required_documents": [
      "Photo ID",
      "Proof of income (pay stubs, tax return, or signed zero-income statement)",
      "Social Security number",
      "Proof of residency",
      "Immigration documentation if applicable"
    ]
  },
  "chip": {
    "id": "chip",
    "name": "CHIP",
    "full_name": "Children's Health Insurance Program",
    "colloquial": "CHIP",
    "category": "health",
    "description": "Low-cost health coverage for children in households earning too much for Medicaid.",
    "national_apply_url": "https://www.healthcare.gov/medicaid-chip/",
    "more_info_url": "https://www.medicaid.gov/chip/index.html",
    "data_source": "Centers for Medicare & Medicaid Services (CMS)",
    "data_as_of": "2026",
    "processing_time_days": "45",
    "renewal_period": "Annual",
    "imputed_monthly_value_per_child": 200,
    "imputed_monthly_value_note": "Approximate value of CHIP coverage per child for cliff modeling.",
    "required_documents": [
      "Child's birth certificate",
      "Child's Social Security number",
      "Proof of household income",
      "Proof of residency",
      "Parent or guardian photo ID"
    ]
  },
  "liheap": {
    "id": "liheap",
    "name": "LIHEAP",
    "full_name": "Low Income Home Energy Assistance Program",
    "colloquial": "Energy Assistance",
    "category": "utilities",
    "description": "Help paying home heating and cooling energy bills.",
    "national_apply_url": "https://www.acf.hhs.gov/ocs/programs/liheap/find-local-help",
    "more_info_url": "https://www.acf.hhs.gov/ocs/programs/liheap",
    "data_source": "HHS Office of Community Services",
    "data_as_of": "2026",
    "processing_time_days": "Varies — apply early, funds are limited",
    "renewal_period": "Annual — reapply each heating/cooling season",
    "imputed_annual_value_avg": 700,
    "imputed_monthly_value": 58,
    "imputed_monthly_value_note": "Approximate average LIHEAP benefit annualized. Actual varies widely by state.",
    "required_documents": [
      "Photo ID",
      "Proof of income for all household members (last 30 days)",
      "Most recent utility bills (heating and/or cooling)",
      "Social Security numbers for all household members",
      "Proof of residency (lease or utility bill in your name)"
    ]
  },
  "wic": {
    "id": "wic",
    "name": "WIC",
    "full_name": "Special Supplemental Nutrition Program for Women, Infants, and Children",
    "colloquial": "WIC",
    "category": "food",
    "description": "Supplemental food, nutrition education, and healthcare referrals for pregnant women, new mothers, and young children.",
    "national_apply_url": "https://www.fns.usda.gov/wic/wic-contacts",
    "more_info_url": "https://www.fns.usda.gov/wic",
    "data_source": "USDA Food and Nutrition Service",
    "data_as_of": "2026",
    "processing_time_days": "Same day or next day at WIC clinic",
    "renewal_period": "Every 6 months; ends when child turns 5",
    "imputed_monthly_value_per_person": 60,
    "imputed_monthly_value_note": "Approximate WIC food benefit value per eligible person per month.",
    "required_documents": [
      "Proof of identity (photo ID or child's birth certificate)",
      "Proof of residency",
      "Proof of income or participation in SNAP/Medicaid/TANF (auto-income-eligible)",
      "Proof of pregnancy (for pregnant women — doctor's note or due date)",
      "Child's most recent immunization records (recommended)"
    ]
  },
  "tanf": {
    "id": "tanf",
    "name": "TANF",
    "full_name": "Temporary Assistance for Needy Families",
    "colloquial": "Cash Assistance",
    "category": "cash",
    "description": "Short-term cash assistance for families with children. Rules vary significantly by state.",
    "national_apply_url": "https://www.acf.hhs.gov/ofa/programs/tanf",
    "more_info_url": "https://www.acf.hhs.gov/ofa/programs/tanf",
    "data_source": "HHS Administration for Children and Families",
    "data_as_of": "2026",
    "processing_time_days": "30–45 (varies by state)",
    "renewal_period": "Varies by state; federal lifetime limit of 60 months",
    "imputed_monthly_value": null,
    "imputed_monthly_value_note": "Do not include in cliff modeling — too state-variable. Flag as candidate, direct to state agency.",
    "required_documents": [
      "Photo ID for all adults in household",
      "Birth certificates for all children",
      "Social Security numbers for all household members",
      "Proof of income (or zero-income statement)",
      "Proof of residency",
      "Documentation of housing situation"
    ]
  }
}
```

### `backend/modules/data_layer/fpl.py`

Implement a `FPLLoader` class with:
- `__init__`: loads `fpl_2026.json` from the `static/` directory as the authoritative
  fallback. Optionally attempt to fetch from HHS ASPE API
  `https://aspe.hhs.gov/poverty-guidelines` on first instantiation (with a 3-second
  httpx timeout). If the API call fails for any reason, silently use the static file.
  Cache the loaded data as a class-level dict.
- `get_fpl(household_size: int, state: str) -> float`: returns the annual FPL
  for the given household size and state. `state` is a 2-letter code. Alaska and
  Hawaii use separate tables; all others use `contiguous_48_and_dc`. For sizes > 8,
  add the `increment_per_person` for each additional person.
- `get_fpl_monthly(household_size: int, state: str) -> float`: returns `get_fpl / 12`.
- `get_fpl_pct(income_annual: float, household_size: int, state: str) -> float`:
  returns `(income_annual / fpl) * 100` as a percentage.
- `get_fpl_pct_monthly(income_monthly: float, household_size: int, state: str) -> float`:
  converts monthly income to annual then calls `get_fpl_pct`.
- `get_income_at_pct(pct: float, household_size: int, state: str) -> float`:
  returns the annual income equivalent to `pct` percent of FPL.
- `get_income_at_pct_monthly(pct: float, household_size: int, state: str) -> float`:
  returns monthly.
- `get_source_info() -> dict`: returns `{"source": ..., "url": ..., "effective_date": ...}`
  from the loaded data.

Expose a module-level singleton: `fpl_loader = FPLLoader()`.

### `backend/modules/data_layer/snap_tables.py`

Implement a `SNAPTables` class with:
- `__init__`: loads `snap_2026.json` from `static/`.
- `get_gross_limit_monthly(household_size: int) -> float`
- `get_net_limit_monthly(household_size: int) -> float`
- `get_max_allotment_monthly(household_size: int) -> float`
- `get_standard_deduction_monthly(household_size: int) -> float`
- `get_asset_limit(has_elderly_or_disabled: bool) -> float`
- `calculate_net_income(gross_monthly: float, earned_monthly: float, household_size: int) -> float`:
  returns `gross_monthly - (earned_monthly * earned_income_deduction_rate) - get_standard_deduction_monthly(household_size)`.
  Never return negative.
- `estimate_benefit(net_monthly: float, household_size: int) -> float`:
  returns `max(0.0, get_max_allotment_monthly(household_size) - (net_monthly * 0.3))`.
- `get_source_info() -> dict`

Expose a module-level singleton: `snap_tables = SNAPTables()`.

### `backend/modules/data_layer/program_registry.py`

Implement a `ProgramRegistry` class with:
- `__init__`: loads `programs.json` and `state_programs.json` from `static/`.
- `get_program(program_id: str) -> dict`: returns program info dict. Raise
  `KeyError` if program not found.
- `get_state_program(state: str, program_id: str) -> dict`: merges program info with
  state-specific overrides. For `apply_url`, prefer state-specific URL over national.
  Raise `ValueError` if state not in `state_programs.json`.
- `get_required_documents(program_id: str) -> list[str]`
- `get_supported_states() -> list[str]`
- `is_state_supported(state: str) -> bool`
- `get_data_source_info(program_id: str) -> dict`: returns `{"source": ..., "url": ..., "data_as_of": ...}`

Expose a module-level singleton: `program_registry = ProgramRegistry()`.

---

## Module B: Rules Engine

### `backend/modules/rules_engine/base.py`

Define this abstract base class exactly:

```python
from abc import ABC, abstractmethod
from backend.schemas import UserProfile, EligibilityResult

class ProgramRule(ABC):
    """Abstract base for all program eligibility rules."""

    @property
    @abstractmethod
    def program_id(self) -> str:
        """e.g. 'snap'"""

    @abstractmethod
    def check(self, profile: UserProfile) -> EligibilityResult:
        """
        Evaluate eligibility. MUST be purely deterministic.
        MUST NOT make any network calls.
        MUST NOT call any AI API.
        Returns EligibilityResult with all fields populated.
        """
```

### `backend/modules/rules_engine/engine.py`

Implement `EligibilityEngine`:
- `__init__`: instantiates all program rules and registers them in a dict keyed by
  `program_id`. The rules are: `SNAPRule`, `MedicaidRule`, `CHIPRule`, `LIHEAPRule`,
  `WICRule`, `TANFRule`.
- `check_all(profile: UserProfile) -> list[EligibilityResult]`: runs all rules,
  skips any program the user is already receiving (returns `ALREADY_RECEIVING` status),
  catches any unexpected exception per rule and returns `UNABLE_TO_DETERMINE` with the
  exception message, never raises.
- `check_program(program_id: str, profile: UserProfile) -> EligibilityResult`: runs
  a single rule by ID.
- The engine must not import or reference anything from `modules/intake/`,
  `modules/explainer/`, or `modules/cliff/`.

### `backend/modules/rules_engine/programs/snap.py`

```python
# SNAPRule logic:
#
# ALREADY_RECEIVING: if "snap" in profile.current_benefits
#
# UNABLE_TO_DETERMINE: if profile.state not in program_registry.get_supported_states()
#
# Check 1 — Gross income test (LIKELY_INELIGIBLE if fails, unless elderly/disabled):
#   gross_limit = snap_tables.get_gross_limit_monthly(profile.household_size)
#   if profile.monthly_gross_income > gross_limit:
#     - If no elderly (60+) or disabled member: LIKELY_INELIGIBLE, confidence=0.9
#     - If elderly or disabled: set a flag to skip gross test (they only need net test)
#
# Check 2 — Net income test:
#   earned = profile.monthly_gross_income if profile.employment_status in
#             ["employed_full","employed_part","self_employed"] else 0.0
#   net = snap_tables.calculate_net_income(profile.monthly_gross_income, earned,
#          profile.household_size)
#   net_limit = snap_tables.get_net_limit_monthly(profile.household_size)
#   if net > net_limit: LIKELY_INELIGIBLE, confidence=0.85
#
# Check 3 — Categorical eligibility:
#   If profile.state's snap_broad_categorical_eligibility is True AND
#   any of ["tanf","ssi","medicaid"] in profile.current_benefits:
#   → LIKELY_ELIGIBLE, confidence=0.9, reason="Categorical eligibility via existing benefit"
#
# If all checks pass → LIKELY_ELIGIBLE, confidence=0.85
#
# estimated_monthly_benefit: use snap_tables.estimate_benefit(net_income, household_size)
#   formatted as f"~${amount:.0f}/month (estimated)"
#
# EligibilityFactor entries: one per check performed, with factor_name, value, threshold, passes.
#
# data_source: from snap_tables.get_source_info()
# required_documents: from program_registry.get_required_documents("snap")
# apply_url: state-specific from program_registry.get_state_program(state, "snap")
```

### `backend/modules/rules_engine/programs/medicaid.py`

```python
# MedicaidRule logic:
#
# ALREADY_RECEIVING: if "medicaid" in profile.current_benefits
#
# UNABLE_TO_DETERMINE: if profile.state not in supported states
#
# Expansion states (CA, NY, IL and those with medicaid_expansion=True in state data):
#   income_limit_monthly = fpl_loader.get_income_at_pct_monthly(
#     state_data["medicaid_adult_fpl_pct"], profile.household_size, profile.state)
#   Adults aged 19-64 (approximate: profile.adults > 0 and
#   profile.household_size - profile.children_under_18 > 0):
#   If profile.monthly_gross_income <= income_limit_monthly:
#     LIKELY_ELIGIBLE, confidence=0.9
#   Else:
#     LIKELY_INELIGIBLE, confidence=0.85
#
# Non-expansion states (TX, FL and those with medicaid_expansion=False):
#   If profile.children_under_18 > 0 or profile.pregnant_women > 0:
#     → note: children covered by CHIP, not Medicaid — return UNABLE_TO_DETERMINE
#       with reason explaining this
#   Else if profile.has_disability:
#     → POSSIBLY_ELIGIBLE, confidence=0.4,
#       reason="Disability-based Medicaid may be available. Eligibility rules are
#       complex — contact your state Medicaid office."
#   Else:
#     → LIKELY_INELIGIBLE, confidence=0.9,
#       reason=f"{state_data['name']} has not expanded Medicaid. {state_data['medicaid_nonexpansion_note']}"
#
# data_source: from program_registry
# apply_url: state-specific
```

### `backend/modules/rules_engine/programs/chip.py`

```python
# CHIPRule logic:
#
# ALREADY_RECEIVING: if "chip" in profile.current_benefits
#
# Only relevant if profile.children_under_18 > 0:
#   If no children: return EligibilityResult status=LIKELY_INELIGIBLE,
#   reason="CHIP covers children under 18. No children under 18 in your household."
#
# income_limit_monthly = fpl_loader.get_income_at_pct_monthly(
#   state_data["chip_fpl_pct"], profile.household_size, profile.state)
#
# If profile.monthly_gross_income <= income_limit_monthly:
#   → LIKELY_ELIGIBLE, confidence=0.85
#   estimated_monthly_benefit: f"~${programs['chip']['imputed_monthly_value_per_child'] * profile.children_under_18}/month (estimated coverage value)"
# Else:
#   → LIKELY_INELIGIBLE, confidence=0.85
#
# Note: If child is already on Medicaid (in profile.current_benefits), return ALREADY_RECEIVING.
#
# apply_url: state-specific chip_apply_url
```

### `backend/modules/rules_engine/programs/liheap.py`

```python
# LIHEAPRule logic:
#
# ALREADY_RECEIVING: if "liheap" in profile.current_benefits
#
# Ineligible if: profile.housing_status in ["unhoused", "shelter"]
#   reason: "LIHEAP requires you to be responsible for paying a home energy bill."
#
# income_limit_monthly = fpl_loader.get_income_at_pct_monthly(
#   state_data["liheap_fpl_pct"], profile.household_size, profile.state)
#
# If profile.monthly_gross_income <= income_limit_monthly:
#   LIKELY_ELIGIBLE, confidence=0.75
#   reason: "Income is within the limit, but LIHEAP is funded seasonally and
#            may have a waitlist. Apply as early as possible."
#   estimated_monthly_benefit: f"~${programs['liheap']['imputed_monthly_value']}/month avg (varies widely by state)"
# Else:
#   LIKELY_INELIGIBLE, confidence=0.8
#
# Note: LIHEAP has highest variance of all programs. Always set confidence ≤ 0.80.
```

### `backend/modules/rules_engine/programs/wic.py`

```python
# WICRule logic:
#
# ALREADY_RECEIVING: if "wic" in profile.current_benefits
#
# Categorical eligibility: if "snap" in profile.current_benefits OR
#   "medicaid" in profile.current_benefits OR "tanf" in profile.current_benefits:
#   income_eligible = True  (automatic income eligibility via linked program)
#
# Demographic eligibility: WIC serves only:
#   - Pregnant women (profile.pregnant_women > 0)
#   - Postpartum women (we cannot determine from profile; flag as possibly applicable)
#   - Children under 5 (profile.infants_under_5 > 0)
#
# If none of the above demographics are present:
#   Return LIKELY_INELIGIBLE, reason="WIC is available only to pregnant women,
#   new mothers (up to 6 months postpartum), breastfeeding mothers (up to 1 year),
#   and children under 5."
#
# If demographics present AND (income_eligible OR monthly_gross_income <=
#   fpl_loader.get_income_at_pct_monthly(185, profile.household_size, profile.state)):
#   LIKELY_ELIGIBLE, confidence=0.85
#   estimated_monthly_benefit: calculate total eligible persons × imputed_monthly_value_per_person
# Else:
#   LIKELY_INELIGIBLE, confidence=0.85
```

### `backend/modules/rules_engine/programs/tanf.py`

```python
# TANFRule logic:
#
# ALREADY_RECEIVING: if "tanf" in profile.current_benefits
#
# TANF rules are too state-variable to determine precisely.
# This rule always returns POSSIBLY_ELIGIBLE or LIKELY_INELIGIBLE.
#
# Basic candidate screening:
#   Must have: profile.children_under_18 > 0
#   Must have: profile.monthly_gross_income below a rough threshold
#     (use 50% FPL monthly as conservative indicator)
#   Must NOT be: employment_status == "employed_full" AND income above 50% FPL
#
# If profile.children_under_18 == 0:
#   LIKELY_INELIGIBLE, reason="TANF provides cash assistance to families with children."
#
# Else if income <= fpl_loader.get_income_at_pct_monthly(50, household_size, state):
#   POSSIBLY_ELIGIBLE, confidence=0.4
#   reason="You may qualify for cash assistance. TANF rules vary significantly
#   by state. Contact your local office to determine exact eligibility."
#
# Else:
#   POSSIBLY_ELIGIBLE, confidence=0.3
#   reason="TANF rules vary by state and your income may be within range.
#   Contact your local office to confirm."
#
# Always append: "Federal lifetime limit is 60 months of TANF cash assistance."
# apply_url: state-specific tanf_apply_url
```

### `backend/modules/rules_engine/tests/fixtures.py`

Create at minimum these test profiles as module-level constants:
- `PROFILE_CA_SINGLE_LOW_INCOME`: CA, 1 person, $900/month, employed_part,
  rents, no disability, no children, no current benefits, language="en"
- `PROFILE_TX_FAMILY_MEDIUM`: TX, 4 people, $2,800/month, employed_full,
  rents, no disability, 2 children under 18, no current benefits
- `PROFILE_NY_SINGLE_NO_INCOME`: NY, 1 person, $0/month, unemployed,
  shelter, no disability, no children, no current benefits
- `PROFILE_FL_PREGNANT`: FL, 2 people, $1,500/month, employed_part,
  rents, no disability, 0 children_under_18, 1 pregnant_women, 0 infants
- `PROFILE_IL_ELDERLY_DISABLED`: IL, 2 people, $1,200/month, not_seeking,
  owns, has_disability=True, elderly_members=1, no children

### Rules Engine Tests

For each test file, write tests that:
1. Assert that a clearly eligible profile returns `LIKELY_ELIGIBLE`
2. Assert that a clearly ineligible profile returns `LIKELY_INELIGIBLE`
3. Assert that an already-receiving profile returns `ALREADY_RECEIVING`
4. Assert that all `EligibilityResult` fields are populated (no None where not Optional)
5. Assert that `data_source` is a non-empty string
6. Assert that `required_documents` is a non-empty list
7. Assert that `apply_url` is a non-empty string starting with "https://"

---

## Module C: Intake (AI Intake Layer)

### `backend/modules/intake/session_manager.py`

Implement `SessionManager`:
- In-memory store: `dict[str, IntakeSession]` (module-level, not class-level)
- `create_session() -> IntakeSession`: creates new session with UUID4 session_id,
  empty messages list, `is_complete=False`, `profile=None`, sets created_at and updated_at.
- `get_session(session_id: str) -> IntakeSession`: raises `KeyError` if not found.
- `update_session(session: IntakeSession) -> None`: updates the store.
- `add_message(session_id: str, role: str, content: str) -> None`: appends to messages,
  updates `updated_at`.
- `mark_complete(session_id: str, profile: UserProfile) -> None`: sets `is_complete=True`
  and `profile=profile` on the session.
- `cleanup_expired_sessions() -> int`: removes sessions older than 2 hours (by
  `updated_at`). Returns count removed.
- `get_session_count() -> int`

Expose a module-level singleton: `session_manager = SessionManager()`.

### `backend/modules/intake/prompt_builder.py`

Implement `build_intake_system_prompt() -> str` that returns this exact string
(no changes, no paraphrasing):

```
You are a benefits navigator assistant helping people discover what public support
programs they may qualify for in the United States. Your job is to have a warm,
clear conversation to collect specific information. You are NOT determining
eligibility — a separate rules engine will do that. You are ONLY collecting
information.

Collect all of the following through natural conversation. Ask one or two questions
at a time. Be warm, empathetic, and non-judgmental. If the person gives an ambiguous
answer, ask a single clear follow-up question.

REQUIRED INFORMATION:
1. State they live in (2-letter code, e.g. CA, TX, NY, FL, IL — only these 5 states
   are currently supported; if a different state is given, apologize and say the
   system currently supports CA, TX, NY, FL, and IL only, and ask if they live in
   one of these)
2. Total number of people in their household (everyone who lives together and shares meals)
3. Household member demographics:
   a. Number of children under 18
   b. Number of children under 5 (for WIC/food programs)
   c. Number of pregnant women in household
   d. Number of people aged 60 or older
   e. Whether anyone in the household has a disability
4. Monthly household income (all sources combined — wages, benefits, support, etc.)
   Accept hourly/weekly/annual and convert: hourly×40×4.33, weekly×4.33, annual÷12.
   If income is variable, ask for a typical recent month.
   If income is zero, set to 0.
5. Employment status of the primary adult: employed_full, employed_part, unemployed,
   self_employed, or not_seeking
6. Housing situation: owns, rents, subsidized, shelter, unhoused, or other
7. Benefits currently being received (list all that apply: snap, medicaid, chip,
   liheap, wic, tanf, ssi, social_security, unemployment, none)

OPTIONAL (ask gently, flag as optional):
8. Zip code (for finding nearby offices and resources)

PRIVACY RULES — NEVER ask for:
- Social Security numbers
- Full legal names
- Dates of birth
- Bank account information
- Immigration status (it's collected only if the person volunteers it)

IMPORTANT BEHAVIORS:
- If the person seems distressed, acknowledge their feelings with one sentence before
  continuing.
- If asked "do I qualify for X?", say "I'll have all that information for you once I
  finish collecting your details — let me ask a few more questions."
- Never guess at eligibility or mention thresholds.
- If the person says they're in crisis (no food, utilities cut off, facing eviction),
  note that you'll flag this as urgent in the results, and continue collecting info.

COMPLETION:
When you have collected items 1–7, confirm with the user:
"Let me make sure I have everything right: [brief summary of what you collected].
Is that correct?"

After confirmation, output the marker [PROFILE_COMPLETE] on its own line, followed
immediately by a JSON object. The JSON must exactly match this structure:

[PROFILE_COMPLETE]
{
  "state": "CA",
  "household_size": 3,
  "adults": 2,
  "children_under_18": 1,
  "infants_under_5": 0,
  "pregnant_women": 0,
  "monthly_gross_income": 1500.0,
  "income_type": "wages",
  "employment_status": "employed_part",
  "housing_status": "rents",
  "has_disability": false,
  "elderly_members": 0,
  "current_benefits": [],
  "citizenship_status": "prefer_not_to_say",
  "language": "en",
  "zip_code": null
}

income_type must be one of: wages, self_employment, no_income, variable, mixed
employment_status must be one of: employed_full, employed_part, unemployed, self_employed, not_seeking
housing_status must be one of: owns, rents, subsidized, shelter, unhoused, other
citizenship_status must be one of: citizen, permanent_resident, qualified_alien, undocumented, prefer_not_to_say
language must be a BCP 47 code (e.g. "en", "es", "zh"). Detect from conversation or default to "en".
```

Also implement `build_intake_user_prompt(messages: list[dict]) -> list[dict]` that
formats the conversation history as an Anthropic messages array (list of
`{"role": "user"|"assistant", "content": str}` dicts).

### `backend/modules/intake/profile_extractor.py`

Implement `extract_profile(session_id: str, llm_response: str) -> tuple[bool, UserProfile | None]`:
- Returns `(False, None)` if `[PROFILE_COMPLETE]` is not in `llm_response`.
- If marker found, extract the JSON text after the marker.
- Parse the JSON, validate against `UserProfile` fields.
- Set `session_id` from the parameter.
- Set `profile_complete=True` and `collected_at=datetime.now(UTC)`.
- Compute `adults = household_size - children_under_18`. Clamp to min 1.
- If JSON parse fails, log the error and return `(False, None)`.
- If Pydantic validation fails, log and return `(False, None)`.
- On success, return `(True, UserProfile(...))`.

### `backend/modules/intake/conversation.py`

Implement `IntakeConversation`:
- `__init__(self, anthropic_client: anthropic.Anthropic)`: stores client.
- `async send_message(session_id: str, user_message: str) -> IntakeResponse`:
  1. Gets or creates session via `session_manager`.
  2. Adds user message to session.
  3. Builds messages array from session history.
  4. Calls `anthropic_client.messages.create` with:
     - `model="claude-sonnet-4-6"`
     - `max_tokens=1024`
     - `system=build_intake_system_prompt()`
     - `messages=build_intake_user_prompt(session.messages)`
  5. Extracts `response_text = response.content[0].text`.
  6. Calls `extract_profile(session_id, response_text)`.
  7. If complete: adds clean assistant reply (text before `[PROFILE_COMPLETE]`) to
     session, marks session complete with profile.
  8. If not complete: adds full response text as assistant message.
  9. Returns `IntakeResponse(session_id, reply_text, is_complete, profile)`.
  10. On any Anthropic API error, raise `HTTPException(502, "AI service unavailable")`.

---

## Module D: Explainer (LLM Action Plan Generator)

### `backend/modules/explainer/prompt_builder.py`

Implement `build_explainer_prompt(profile: UserProfile, results: list[EligibilityResult], language: str) -> str`:

The prompt must inject the eligibility results and program data (from program_registry)
verbatim into the prompt — the LLM must not invent any data. Structure:

```
You are a benefits navigator assistant. Your job is to turn the following eligibility
results into a clear, warm, and actionable plan for the user.

USER PROFILE SUMMARY:
- State: {state}
- Household size: {household_size} ({adults} adults, {children_under_18} children under 18)
- Monthly income: ${monthly_gross_income:.0f}
- Language requested: {language}

ELIGIBILITY RESULTS FROM RULES ENGINE (do not change these):
{json.dumps([r.model_dump() for r in results], indent=2)}

PROGRAM INFORMATION FROM DATABASE (use only these URLs, documents, and descriptions):
{json.dumps([program_registry.get_program(r.program_id) for r in results], indent=2)}

INSTRUCTIONS:
1. Respond entirely in the language specified ({language}). If "es", respond in Spanish.
   If "en" or unrecognized, respond in English.
2. Start with a brief, warm 1-sentence greeting.
3. List ONLY programs with status LIKELY_ELIGIBLE or POSSIBLY_ELIGIBLE.
4. For each eligible program:
   a. Program name and what it provides (use description from database, paraphrased).
   b. Why the user appears to qualify (use the reason field from the eligibility result).
   c. Estimated benefit if provided (use estimated_monthly_benefit exactly as given).
   d. Document checklist (use required_documents from the database exactly).
   e. Where to apply (use apply_url from the results exactly).
   f. Data source citation: "Source: {data_source}, {data_as_of}."
5. After listing programs, add a "Recommended order" section: list programs by fastest
   processing time first (WIC → SNAP → Medicaid/CHIP → LIHEAP → TANF).
6. End with this disclaimer (translate if needed):
   "This tool provides general guidance only. Final eligibility is determined by the
   agency you apply to, not by this tool. Information is current as of the dates cited
   above. This is not legal or financial advice. If you need help applying, contact a
   local benefits navigator or call 211."
7. Do not invent any dollar amounts, thresholds, or URLs not provided above.
8. Do not change any eligibility status from what is given.
9. If no programs are eligible, empathetically explain this and list the nearest
   general resource: "For additional support options, call 211 or visit findhelp.org."
```

### `backend/modules/explainer/action_plan.py`

Implement `ActionPlanGenerator`:
- `__init__(self, anthropic_client: anthropic.Anthropic)`
- `async generate(profile: UserProfile, results: list[EligibilityResult]) -> ActionPlanResponse`:
  1. Builds prompt via `build_explainer_prompt`.
  2. Calls `anthropic_client.messages.create` with:
     - `model="claude-sonnet-4-6"`, `max_tokens=2000`
     - Single user message containing the prompt (no system prompt — the full context
       is in the user message for reliability)
  3. Returns `ActionPlanResponse` with the text, results, profile, and generated_at timestamp.
  4. On Anthropic error, raise `HTTPException(502, "AI service unavailable")`.

---

## Module E: Benefits Cliff Calculator

### `backend/modules/cliff/calculator.py`

Implement `CliffCalculator`:
- `__init__`: imports `fpl_loader`, `snap_tables`, `program_registry` from data_layer.
  Does NOT import rules_engine (to avoid circular deps — implement inline thresholds
  by calling data_layer functions directly).
- `calculate(profile: UserProfile, min_income: float = 0, max_income: float = 5000,
  step: float = 50) -> CliffResponse`:
  1. For each income level from `min_income` to `max_income` in `step` increments:
     a. Build a temporary modified profile with `monthly_gross_income = income_level`.
     b. Calculate SNAP benefit:
        - If income > `snap_tables.get_gross_limit_monthly(household_size)`: snap_benefit = 0
        - Else: earned = income if employed else 0; net = snap_tables.calculate_net_income(income, earned, size); snap_benefit = snap_tables.estimate_benefit(net, size)
     c. Calculate Medicaid value (use `imputed_monthly_value=400` per adult if eligible):
        - Look up state's `medicaid_adult_fpl_pct` and `medicaid_expansion`.
        - If expansion state and income <= threshold: medicaid_value = 400 * adults
        - Else: medicaid_value = 0
     d. Calculate CHIP value (use `imputed_monthly_value_per_child=200` per child if eligible):
        - If income <= state CHIP threshold: chip_value = 200 * children_under_18
        - Else: chip_value = 0
     e. Calculate LIHEAP value (use `imputed_monthly_value=58`):
        - If income <= state LIHEAP threshold and housing_status not in ["unhoused","shelter"]: liheap_value = 58
        - Else: liheap_value = 0
     f. Calculate WIC value:
        - eligible_wic_persons = pregnant_women + infants_under_5
        - If eligible_wic_persons > 0 and income <= fpl_loader threshold at 185%:
          wic_value = 60 * eligible_wic_persons
        - Else: wic_value = 0
     g. total_benefit_value = snap_benefit + medicaid_value + chip_value + liheap_value + wic_value
     h. net_resources = income_level + total_benefit_value
     i. Append `CliffDataPoint` to list.
  2. Detect cliff zones: find income ranges where `net_resources[i+1] < net_resources[i]`
     over at least 2 consecutive steps. Build `CliffZone` entries.
  3. Return `CliffResponse(profile, data_points, cliff_zones)`.
  4. This method is synchronous (no async) — no network calls.
- `get_current_position(profile: UserProfile) -> CliffDataPoint`:
  calculates a single data point at `profile.monthly_gross_income`.

---

## Module F: Local Resources Finder

### `backend/modules/resources/overpass.py`

Implement `OverpassClient`:
- `OVERPASS_URL = "https://overpass-api.de/api/interpreter"`
- `async fetch_resources(lat: float, lon: float, radius_meters: int = 5000,
  categories: list[str] = None) -> list[dict]`:
  Builds an Overpass QL query to find:
  - `amenity=social_facility`
  - `amenity=food_bank`
  - `amenity=community_centre`
  - `amenity=clinic`
  - `office=government`
  Filter to those within `radius_meters` of (lat, lon).
  Use `httpx.AsyncClient` with a 10-second timeout.
  If the request fails, return an empty list (do not raise).
  Return the raw `elements` array from the Overpass JSON response.
- `async geocode_zip(zip_code: str) -> tuple[float, float] | None`:
  Uses Nominatim: `GET https://nominatim.openstreetmap.org/search?q={zip_code}&country=US&format=json&limit=1`
  with headers `User-Agent: BenefitsNavigator/1.0 (hackathon)`.
  Returns `(lat, lon)` or `None` on failure.

### `backend/modules/resources/normalizer.py`

Implement `normalize_element(element: dict) -> Resource | None`:
- Extracts `tags` from the OSM element.
- Returns `None` if no `name` tag.
- Maps `amenity` tag to a `category` string:
  - `food_bank` → "food"
  - `social_facility` → "social_services"
  - `community_centre` → "community"
  - `clinic` → "health"
  - `government` → "government"
  - anything else → "other"
- Constructs and returns `Resource` with: name, category, address (from addr tags),
  phone (from contact:phone or phone tag), website (from website tag), lat, lon.

---

## Module G: FastAPI Backend

### `backend/config.py`

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    anthropic_api_key: str
    frontend_url: str = "http://localhost:3000"
    google_places_api_key: str = ""  # optional
    environment: str = "development"
    log_level: str = "INFO"

    class Config:
        env_file = ".env"

settings = Settings()
```

Also add `pydantic-settings==2.3.0` to requirements.txt.

### `backend/.env.example`

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
FRONTEND_URL=http://localhost:3000
GOOGLE_PLACES_API_KEY=
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### `backend/requirements.txt`

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
anthropic==0.28.0
pydantic==2.7.0
pydantic-settings==2.3.0
httpx==0.27.0
python-dotenv==1.0.1
pytest==8.2.0
pytest-asyncio==0.23.7
```

### `backend/api/middleware.py`

Set up FastAPI CORS middleware allowing:
- `allow_origins=[settings.frontend_url, "http://localhost:3000"]`
- `allow_methods=["GET", "POST", "OPTIONS"]`
- `allow_headers=["*"]`
- `allow_credentials=True`

Add a global exception handler that catches unhandled exceptions and returns:
`{"error": "Internal server error", "code": "INTERNAL_ERROR", "status": 500}`

### `backend/api/routes/intake.py`

Two endpoints:

`POST /api/intake/start` — no request body.
Returns `IntakeResponse` with a new session and the first greeting message.
Call `intake_conversation.send_message(new_session_id, "Hello, I need help finding benefits")`.

`POST /api/intake/message` — request body: `IntakeRequest`.
If `session_id` is None, start a new session.
Call `intake_conversation.send_message(session_id, message)`.
If `session_id` not found in session_manager, return 404: `{"error": "Session not found", "code": "SESSION_NOT_FOUND", "status": 404}`.
Returns `IntakeResponse`.

### `backend/api/routes/eligibility.py`

`POST /api/eligibility/check` — request body: `UserProfile`.
Validates state is supported; if not returns 400 with helpful message.
Calls `eligibility_engine.check_all(profile)`.
Returns `EligibilityResponse(results=results, checked_at=datetime.now(UTC))`.

### `backend/api/routes/explain.py`

`POST /api/explain/action-plan` — request body: `ExplainRequest(profile, results, language)`.
Calls `action_plan_generator.generate(profile, results)`.
Returns `ActionPlanResponse`.

### `backend/api/routes/cliff.py`

`POST /api/cliff/calculate` — request body: `CliffRequest(profile, min_income, max_income, step)`.
Defaults: min=0, max=5000, step=50.
Validates max_income <= 10000 and step >= 10.
Calls `cliff_calculator.calculate(profile, min_income, max_income, step)`.
Returns `CliffResponse`.

### `backend/api/routes/resources.py`

`GET /api/resources?zip_code={zip}&state={state}` — both params optional.
If `zip_code` provided: geocodes it, then fetches OSM resources.
Returns `ResourcesResponse(resources=list[Resource], source="OpenStreetMap")`.
If no zip_code: return empty list with note "Provide a zip code for local resources."

### `backend/main.py`

```python
from fastapi import FastAPI
from contextlib import asynccontextmanager
import anthropic
from backend.config import settings
from backend.api.middleware import setup_middleware
from backend.api.routes import intake, eligibility, explain, cliff, resources
from backend.modules.intake.conversation import IntakeConversation
from backend.modules.explainer.action_plan import ActionPlanGenerator
from backend.modules.rules_engine.engine import EligibilityEngine
from backend.modules.cliff.calculator import CliffCalculator

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize singletons
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    app.state.intake = IntakeConversation(client)
    app.state.explainer = ActionPlanGenerator(client)
    app.state.engine = EligibilityEngine()
    app.state.cliff = CliffCalculator()
    yield
    # Cleanup (none needed for this app)

app = FastAPI(
    title="Benefits Navigator API",
    version="1.0.0",
    lifespan=lifespan
)

setup_middleware(app)

app.include_router(intake.router, prefix="/api/intake", tags=["intake"])
app.include_router(eligibility.router, prefix="/api/eligibility", tags=["eligibility"])
app.include_router(explain.router, prefix="/api/explain", tags=["explain"])
app.include_router(cliff.router, prefix="/api/cliff", tags=["cliff"])
app.include_router(resources.router, prefix="/api/resources", tags=["resources"])

@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
```

---

## All Pydantic Schemas (`backend/schemas.py`)

```python
from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional
from datetime import datetime


class EligibilityStatus(str, Enum):
    LIKELY_ELIGIBLE = "likely_eligible"
    POSSIBLY_ELIGIBLE = "possibly_eligible"
    LIKELY_INELIGIBLE = "likely_ineligible"
    UNABLE_TO_DETERMINE = "unable_to_determine"
    ALREADY_RECEIVING = "already_receiving"


class IncomeType(str, Enum):
    WAGES = "wages"
    SELF_EMPLOYMENT = "self_employment"
    NO_INCOME = "no_income"
    VARIABLE = "variable"
    MIXED = "mixed"


class EmploymentStatus(str, Enum):
    EMPLOYED_FULL = "employed_full"
    EMPLOYED_PART = "employed_part"
    UNEMPLOYED = "unemployed"
    SELF_EMPLOYED = "self_employed"
    NOT_SEEKING = "not_seeking"


class HousingStatus(str, Enum):
    OWNS = "owns"
    RENTS = "rents"
    SUBSIDIZED = "subsidized"
    SHELTER = "shelter"
    UNHOUSED = "unhoused"
    OTHER = "other"


class CitizenshipStatus(str, Enum):
    CITIZEN = "citizen"
    PERMANENT_RESIDENT = "permanent_resident"
    QUALIFIED_ALIEN = "qualified_alien"
    UNDOCUMENTED = "undocumented"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class UserProfile(BaseModel):
    session_id: str = ""
    state: str = Field(..., description="2-letter state code. Supported: CA, TX, NY, FL, IL")
    household_size: int = Field(..., ge=1, le=20)
    adults: int = Field(..., ge=1)
    children_under_18: int = Field(0, ge=0)
    infants_under_5: int = Field(0, ge=0)
    pregnant_women: int = Field(0, ge=0)
    elderly_members: int = Field(0, ge=0, description="Members aged 60+")
    has_disability: bool = False
    monthly_gross_income: float = Field(..., ge=0)
    income_type: IncomeType = IncomeType.WAGES
    employment_status: EmploymentStatus = EmploymentStatus.UNEMPLOYED
    housing_status: HousingStatus = HousingStatus.RENTS
    current_benefits: list[str] = Field(default_factory=list)
    citizenship_status: CitizenshipStatus = CitizenshipStatus.PREFER_NOT_TO_SAY
    language: str = "en"
    zip_code: Optional[str] = None
    profile_complete: bool = False
    collected_at: Optional[datetime] = None


class EligibilityFactor(BaseModel):
    factor_name: str
    user_value: str
    threshold: str
    passes: bool
    note: Optional[str] = None


class EligibilityResult(BaseModel):
    program_id: str
    program_name: str
    status: EligibilityStatus
    confidence: float = Field(..., ge=0.0, le=1.0)
    reason: str
    eligibility_factors: list[EligibilityFactor] = Field(default_factory=list)
    estimated_monthly_benefit: Optional[str] = None
    required_documents: list[str] = Field(default_factory=list)
    apply_url: str = ""
    more_info_url: str = ""
    data_source: str = ""
    data_as_of: str = ""


class IntakeMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class IntakeSession(BaseModel):
    session_id: str
    messages: list[IntakeMessage] = Field(default_factory=list)
    profile: Optional[UserProfile] = None
    is_complete: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class IntakeRequest(BaseModel):
    session_id: Optional[str] = None
    message: str


class IntakeResponse(BaseModel):
    session_id: str
    reply: str
    is_complete: bool
    profile: Optional[UserProfile] = None


class EligibilityResponse(BaseModel):
    results: list[EligibilityResult]
    checked_at: datetime


class ExplainRequest(BaseModel):
    profile: UserProfile
    results: list[EligibilityResult]
    language: str = "en"


class ActionPlanResponse(BaseModel):
    action_plan_text: str
    profile: UserProfile
    results: list[EligibilityResult]
    generated_at: datetime
    disclaimer: str = (
        "This tool provides general guidance only. Final eligibility is determined "
        "by the agency you apply to. This is not legal or financial advice."
    )


class CliffDataPoint(BaseModel):
    monthly_income: float
    snap_benefit: float
    medicaid_value: float
    chip_value: float
    liheap_value: float
    wic_value: float
    total_benefit_value: float
    net_resources: float


class CliffZone(BaseModel):
    income_start: float
    income_end: float
    description: str
    benefit_lost: str
    net_change: float


class CliffRequest(BaseModel):
    profile: UserProfile
    min_income: float = 0
    max_income: float = 5000
    step: float = 50


class CliffResponse(BaseModel):
    profile: UserProfile
    data_points: list[CliffDataPoint]
    cliff_zones: list[CliffZone]
    calculated_at: datetime = Field(default_factory=datetime.utcnow)


class Resource(BaseModel):
    name: str
    category: str
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None


class ResourcesResponse(BaseModel):
    resources: list[Resource]
    source: str = "OpenStreetMap"
    zip_code: Optional[str] = None


class FPLData(BaseModel):
    source: str
    effective_date: str
    household_1: float
    household_4: float
    increment_per_person: float
```

---

## Frontend Functional Spec

The frontend is a Next.js application with TypeScript and Tailwind CSS.
**All library, component, styling, and architectural choices beyond this are left
entirely to the frontend developer.** This section defines only what each page must
do and which API calls it makes. No assumptions are made about routing strategy,
state management, component structure, or CSS class names.

---

### TypeScript Types

Mirror every Pydantic schema from `backend/schemas.py` as TypeScript interfaces
and enums in a `types/` file (or wherever the frontend developer prefers).
Use the exact same field names. All Python `Optional[X]` fields map to `field?: Type`.

The enum values must match exactly:
- `EligibilityStatus`: `"likely_eligible"`, `"possibly_eligible"`, `"likely_ineligible"`,
  `"unable_to_determine"`, `"already_receiving"`
- `EmploymentStatus`, `HousingStatus`, `IncomeType`, `CitizenshipStatus`: match
  the string values defined in `backend/schemas.py`

---

### API Client

Implement typed async functions for each backend route. All requests go to
`/api/*` (Next.js can proxy to the backend via `next.config.js` rewrites or
the frontend dev runs against `http://localhost:8000` directly).

Required functions (naming is a suggestion, not a requirement):
- Start intake session → `POST /api/intake/start`
- Send intake message → `POST /api/intake/message`
- Check eligibility → `POST /api/eligibility/check`
- Get action plan → `POST /api/explain/action-plan`
- Calculate cliff → `POST /api/cliff/calculate`
- Get local resources → `GET /api/resources`

All functions should handle the standard error response format:
`{ "error": string, "code": string, "status": number }`

---

### Page: Home `/`

**Purpose:** Entry point. User selects their mode.

**Must contain:**
- App title: "Benefits Navigator"
- Tagline or brief explanation (1–2 sentences about what the tool does)
- Button to start the AI chat intake flow
- Button to open the case worker (structured form) mode
- Language selector: English / Español
- Note that the tool currently covers CA, TX, NY, FL, and IL only

**API calls:** None on this page.

---

### Page: Intake (AI chat) `/intake` or similar

**Purpose:** Conversational intake flow driven by the AI backend.

**Must do:**
1. On page load: call `POST /api/intake/start`, display the returned greeting message.
2. Display a scrollable conversation history (user messages visually distinct from AI messages).
3. Text input + send button. Disable input while waiting for API response.
4. On each send: call `POST /api/intake/message` with `{ session_id, message }`.
5. When `is_complete === true` in the response:
   - Call `POST /api/eligibility/check` with the returned `profile`.
   - Call `POST /api/explain/action-plan` with `{ profile, results, language }`.
   - Navigate to the Results page.
6. Show loading/typing state while waiting for the AI response.
7. Handle errors: display a user-visible error message, allow retry.
8. Store `session_id`, `profile`, `results`, and `action_plan` for use on Results/Cliff
   pages (method of storage is frontend developer's choice).

**API calls:** `intake/start`, `intake/message`, `eligibility/check`, `explain/action-plan`

---

### Page: Navigator (case worker mode) `/navigator` or similar

**Purpose:** Structured form for case workers or users who prefer direct data entry.
No AI conversation — direct form submission.

**Must contain:**
- Labeled input for every `UserProfile` field:
  - State: dropdown limited to CA, TX, NY, FL, IL
  - Household size, adults, children under 18, infants under 5, pregnant women,
    elderly members: number inputs
  - Monthly gross income: number input with label specifying "monthly, before tax"
  - Employment status: select (employed full-time, part-time, self-employed, unemployed, not seeking)
  - Housing situation: select (owns, rents, subsidized housing, shelter, unhoused, other)
  - Current benefits: multi-select or checkboxes (snap, medicaid, chip, liheap, wic, tanf, none)
  - Disability: checkbox
  - Zip code: optional text input
  - Language preference: English / Español
- Submit button labeled "Check Eligibility"
- On submit: call `eligibility/check`, then `explain/action-plan`, navigate to Results.
- Validation: all required fields must be filled before submit.

**API calls:** `eligibility/check`, `explain/action-plan`

---

### Page: Results `/results` or similar

**Purpose:** Display the action plan and per-program eligibility cards.

**Must contain:**
- The `action_plan_text` rendered as formatted text (it may contain markdown-style
  formatting — handle appropriately).
- One card per program result where `status` is `likely_eligible` or `possibly_eligible`.
  Each card must show:
  - Program name
  - Status badge (color-coded: green for likely eligible, amber for possibly eligible)
  - `reason` text
  - `estimated_monthly_benefit` if present
  - `required_documents` as a checklist (with checkboxes the user can tick off)
  - "Apply Here" link/button opening `apply_url` in a new tab
  - Source citation: `data_source` + `data_as_of` in small text
- "See How Benefits Change With Income" link/button → navigates to Cliff page
- Print or export action plan button (`window.print()` is sufficient)
- Disclaimer text (use the `disclaimer` field from `ActionPlanResponse`)
- "Start Over" button that clears state and returns to Home

**API calls:** None (data already loaded from Intake or Navigator page).

---

### Page: Cliff Visualization `/cliff` or similar

**Purpose:** Show the benefits cliff — how net resources change as monthly income rises.

**Must contain:**
- A chart with:
  - X-axis: monthly income in dollars
  - Y-axis: total monthly resources (income + benefits)
  - A line or area showing `net_resources` across all data points
  - A vertical reference line at the user's current `monthly_gross_income`
  - Visual highlighting of `cliff_zones` (income ranges where net resources decrease)
  - Tooltip or hover state showing the benefit breakdown at any given income level
    (snap_benefit, medicaid_value, chip_value, liheap_value, wic_value)
  - The chart library choice is entirely up to the frontend developer
- Listed `cliff_zones` below the chart as plain-language warnings explaining what
  benefit is lost and how much net resources decrease.
- A control to adjust `max_income` (e.g., slider or number input) and recalculate
  by calling `POST /api/cliff/calculate` again.
- "Back to Results" navigation.

**API calls:** `cliff/calculate` (on load and on max_income change)

---

### Internationalization (EN / ES)

The frontend must support English and Spanish.

- All static UI strings (button labels, page titles, error messages, status labels)
  must be translatable. The method (i18n library, JSON files, inline, etc.) is left
  to the frontend developer.
- The `action_plan_text` returned from the backend is already in the user's language
  (the backend LLM responds in the requested language). Do not translate it in the
  frontend — render it as-is.
- The user's selected language must be passed as the `language` field in requests
  to `explain/action-plan` (e.g., `"en"` or `"es"`).
- Language selection should persist across navigation within the session.

---

### Eligibility Status Display

Regardless of implementation, the five status values must map to distinct visual
treatments so users can immediately understand their situation:

| Status | Meaning to User | Suggested visual treatment |
|--------|----------------|---------------------------|
| `likely_eligible` | Strong match | Positive / green |
| `possibly_eligible` | Possible match | Cautious / amber |
| `likely_ineligible` | Doesn't match | Neutral / gray |
| `already_receiving` | Already enrolled | Informational / blue |
| `unable_to_determine` | Needs human review | Orange / attention |

The exact colors, component, and Tailwind classes are left to the frontend developer.

---

### Next.js API Proxy (recommended)

Add rewrites in `next.config.js` so `/api/*` proxies to the backend:

```js
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};
```

This avoids CORS issues in development and means the frontend makes all requests
to its own origin.

---

### Running the Frontend

```bash
cd frontend
npm install
npm run dev    # typically http://localhost:3000
```

Ensure the backend is running on port 8000 before starting the frontend.



---

## Environment Variables

Required:
- `ANTHROPIC_API_KEY` — get from Anthropic console

Optional:
- `FRONTEND_URL` — the origin of the frontend (used for CORS). Defaults to `http://localhost:3000`
- `GOOGLE_PLACES_API_KEY` — leave blank to skip Google Places (OSM only)
- `ENVIRONMENT` — `development` or `production`
- `LOG_LEVEL` — `DEBUG`, `INFO`, `WARNING`

---

## How to Run

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # then edit .env and add ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000
```

API available at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev    # Next.js default: http://localhost:3000
```

Configure `/api/*` to proxy to `http://localhost:8000` via `next.config.js` rewrites.

### Tests

```bash
cd backend
pytest modules/rules_engine/tests/ -v
```

---

## Testing Requirements

The rules engine must have 100% test coverage for all happy paths and edge cases.
Every test must be deterministic — no mocking of the rules engine itself.
The following scenarios must each have an explicit test:

1. SNAP: eligible family in CA (4 people, $2,000/month)
2. SNAP: ineligible individual in TX (1 person, $2,500/month)
3. SNAP: elderly exception (1 person, 70 y.o., $1,800/month — fails gross but passes net after deductions)
4. Medicaid: eligible adult in NY expansion state
5. Medicaid: non-expansion state (TX) adult without children — ineligible
6. CHIP: children eligible in FL
7. CHIP: no children — ineligible
8. LIHEAP: eligible household — not unhoused
9. LIHEAP: unhoused household — ineligible (no energy bill responsibility)
10. WIC: pregnant woman at 180% FPL — eligible
11. WIC: no eligible demographics — ineligible
12. All programs: ALREADY_RECEIVING returned when in current_benefits

---

## Responsible AI Notes (Document in Code Comments)

Add a docstring to `backend/modules/rules_engine/engine.py` stating:

```python
"""
RESPONSIBLE AI DESIGN NOTE:
This rules engine is the sole source of eligibility determination.
The LLM (Claude) is never consulted for eligibility decisions.
All thresholds are sourced from official government publications (see static/).
Data freshness timestamps are included in all EligibilityResult objects.
Users are always directed to verify with the administering agency.
No PII is persisted beyond the in-memory session (2-hour TTL).
"""
```

Add inline comments to each program rule explaining the legal citation for each
threshold used (e.g., "# USDA FNS FY2026 SNAP income limits, 7 C.F.R. § 273.9").
