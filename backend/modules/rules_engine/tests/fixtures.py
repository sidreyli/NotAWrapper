"""Shared UserProfile fixtures for the rules-engine tests.

These are deterministic inputs; no mocking of the rules engine itself.
"""

from schemas import (
    UserProfile,
    IncomeType,
    EmploymentStatus,
    HousingStatus,
)

PROFILE_CA_SINGLE_LOW_INCOME = UserProfile(
    state="CA",
    household_size=1,
    adults=1,
    children_under_18=0,
    infants_under_5=0,
    pregnant_women=0,
    elderly_members=0,
    has_disability=False,
    monthly_gross_income=900.0,
    income_type=IncomeType.WAGES,
    employment_status=EmploymentStatus.EMPLOYED_PART,
    housing_status=HousingStatus.RENTS,
    current_benefits=[],
    language="en",
)

PROFILE_TX_FAMILY_MEDIUM = UserProfile(
    state="TX",
    household_size=4,
    adults=2,
    children_under_18=2,
    infants_under_5=0,
    pregnant_women=0,
    elderly_members=0,
    has_disability=False,
    monthly_gross_income=2800.0,
    income_type=IncomeType.WAGES,
    employment_status=EmploymentStatus.EMPLOYED_FULL,
    housing_status=HousingStatus.RENTS,
    current_benefits=[],
    language="en",
)

PROFILE_NY_SINGLE_NO_INCOME = UserProfile(
    state="NY",
    household_size=1,
    adults=1,
    children_under_18=0,
    infants_under_5=0,
    pregnant_women=0,
    elderly_members=0,
    has_disability=False,
    monthly_gross_income=0.0,
    income_type=IncomeType.NO_INCOME,
    employment_status=EmploymentStatus.UNEMPLOYED,
    housing_status=HousingStatus.SHELTER,
    current_benefits=[],
    language="en",
)

PROFILE_FL_PREGNANT = UserProfile(
    state="FL",
    household_size=2,
    adults=2,
    children_under_18=0,
    infants_under_5=0,
    pregnant_women=1,
    elderly_members=0,
    has_disability=False,
    monthly_gross_income=1500.0,
    income_type=IncomeType.WAGES,
    employment_status=EmploymentStatus.EMPLOYED_PART,
    housing_status=HousingStatus.RENTS,
    current_benefits=[],
    language="en",
)

PROFILE_IL_ELDERLY_DISABLED = UserProfile(
    state="IL",
    household_size=2,
    adults=2,
    children_under_18=0,
    infants_under_5=0,
    pregnant_women=0,
    elderly_members=1,
    has_disability=True,
    monthly_gross_income=1200.0,
    income_type=IncomeType.NO_INCOME,
    employment_status=EmploymentStatus.NOT_SEEKING,
    housing_status=HousingStatus.OWNS,
    current_benefits=[],
    language="en",
)
