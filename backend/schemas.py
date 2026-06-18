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
