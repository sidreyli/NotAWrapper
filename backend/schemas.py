from pydantic import BaseModel, Field
from enum import Enum
from typing import Literal, Optional
from uuid import uuid4
from datetime import date, datetime, timezone


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
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class IntakeSession(BaseModel):
    session_id: str
    messages: list[IntakeMessage] = Field(default_factory=list)
    profile: Optional[UserProfile] = None
    is_complete: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class IntakeRequest(BaseModel):
    session_id: Optional[str] = None
    message: str = Field(..., min_length=1, max_length=4000)
    history: list[IntakeMessage] = Field(default_factory=list, max_length=40)


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


class ProgramChatRequest(BaseModel):
    profile: UserProfile
    results: list[EligibilityResult] = Field(default_factory=list)
    language: str = "en"
    history: list[IntakeMessage] = Field(default_factory=list)
    message: str


class ProgramChatResponse(BaseModel):
    reply: str


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
    calculated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Resource(BaseModel):
    id: str
    name: str
    category: str
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    open_now: Optional[bool] = None
    hours: list[str] = Field(default_factory=list)
    directions_url: Optional[str] = None
    distance_meters: Optional[int] = None
    travel_duration_minutes: Optional[int] = None
    program_ids: list[str] = Field(default_factory=list)
    source: str = "OpenStreetMap"


class ResourcesResponse(BaseModel):
    resources: list[Resource]
    source: str = "OpenStreetMap"
    zip_code: Optional[str] = None
    center_lat: Optional[float] = None
    center_lon: Optional[float] = None
    message: Optional[str] = None


class ExtractedDocumentField(BaseModel):
    key: str
    label: str
    value: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    evidence: str
    page: Optional[int] = None
    sensitive: bool = False


class DetectedDeadline(BaseModel):
    label: str
    date: Optional[str] = None
    evidence: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    page: Optional[int] = None


class DocumentChecklistMatch(BaseModel):
    program_id: str
    requirement: str
    status: Literal["matched", "possible", "missing"]
    reason: str


class DocumentAnalysis(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    file_name: str
    document_type: str
    summary: str
    fields: list[ExtractedDocumentField] = Field(default_factory=list)
    deadlines: list[DetectedDeadline] = Field(default_factory=list)
    checklist_matches: list[DocumentChecklistMatch] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    processed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ActionTask(BaseModel):
    id: str
    title: str
    description: str
    kind: Literal["document", "call", "visit", "apply", "follow_up", "deadline"]
    due_at: str
    date_source: Literal["official", "extracted", "suggested"]
    program_id: Optional[str] = None
    duration_minutes: Optional[int] = None
    location: Optional[str] = None
    url: Optional[str] = None
    completed: bool = False


class ActionTimeline(BaseModel):
    tasks: list[ActionTask]
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TimelineBuildRequest(BaseModel):
    program_ids: list[str] = Field(default_factory=list)
    document_analyses: list[DocumentAnalysis] = Field(default_factory=list)
    selected_resources: list[Resource] = Field(default_factory=list)
    target_date: date


class CalendarAuthorizeResponse(BaseModel):
    configured: bool
    authorization_url: Optional[str] = None


class CalendarEventsRequest(BaseModel):
    authorization_code: str
    state: str
    tasks: list[ActionTask]


class CalendarEventsResponse(BaseModel):
    created: int
    skipped: int = 0
    errors: list[str] = Field(default_factory=list)


class FPLData(BaseModel):
    source: str
    effective_date: str
    household_1: float
    household_4: float
    increment_per_person: float
