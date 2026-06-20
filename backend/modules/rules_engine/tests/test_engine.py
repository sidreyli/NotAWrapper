"""Rules-engine tests.

Verify deterministic outcomes for representative profiles and that every result
is fully populated (data source, apply URL, required documents). The rules engine
never calls AI and never makes network calls.
"""

from backend.modules.rules_engine.engine import EligibilityEngine
from backend.schemas import EligibilityStatus
from backend.modules.rules_engine.tests import fixtures as F

engine = EligibilityEngine()


def _result(profile, program_id):
    return {r.program_id: r for r in engine.check_all(profile)}[program_id]


def test_all_results_are_fully_populated():
    """Every program result carries a data source citation and the eligible ones
    carry an apply URL + required documents."""
    for profile in (
        F.PROFILE_CA_SINGLE_LOW_INCOME,
        F.PROFILE_TX_FAMILY_MEDIUM,
        F.PROFILE_NY_SINGLE_NO_INCOME,
        F.PROFILE_FL_PREGNANT,
        F.PROFILE_IL_ELDERLY_DISABLED,
    ):
        results = engine.check_all(profile)
        assert {r.program_id for r in results} == {
            "snap", "medicaid", "chip", "liheap", "wic", "tanf"
        }
        for r in results:
            assert r.data_source, f"{r.program_id} missing data_source"
            assert isinstance(r.confidence, float)
            if r.status in (
                EligibilityStatus.LIKELY_ELIGIBLE,
                EligibilityStatus.POSSIBLY_ELIGIBLE,
            ):
                assert r.apply_url.startswith("https://"), r.program_id
                assert r.required_documents, r.program_id


def test_snap_eligible_for_low_income_single():
    r = _result(F.PROFILE_CA_SINGLE_LOW_INCOME, "snap")
    assert r.status == EligibilityStatus.LIKELY_ELIGIBLE
    assert r.estimated_monthly_benefit


def test_chip_ineligible_without_children():
    r = _result(F.PROFILE_CA_SINGLE_LOW_INCOME, "chip")
    assert r.status == EligibilityStatus.LIKELY_INELIGIBLE


def test_chip_eligible_for_tx_family():
    r = _result(F.PROFILE_TX_FAMILY_MEDIUM, "chip")
    assert r.status == EligibilityStatus.LIKELY_ELIGIBLE


def test_medicaid_nonexpansion_state_defers_for_children():
    r = _result(F.PROFILE_TX_FAMILY_MEDIUM, "medicaid")
    assert r.status == EligibilityStatus.UNABLE_TO_DETERMINE


def test_medicaid_eligible_in_expansion_state_low_income():
    r = _result(F.PROFILE_NY_SINGLE_NO_INCOME, "medicaid")
    assert r.status == EligibilityStatus.LIKELY_ELIGIBLE


def test_wic_eligible_for_pregnant():
    r = _result(F.PROFILE_FL_PREGNANT, "wic")
    assert r.status == EligibilityStatus.LIKELY_ELIGIBLE


def test_wic_ineligible_without_demographics():
    r = _result(F.PROFILE_CA_SINGLE_LOW_INCOME, "wic")
    assert r.status == EligibilityStatus.LIKELY_INELIGIBLE


def test_liheap_ineligible_when_unhoused_or_shelter():
    r = _result(F.PROFILE_NY_SINGLE_NO_INCOME, "liheap")
    assert r.status == EligibilityStatus.LIKELY_INELIGIBLE


def test_already_receiving_is_reported():
    profile = F.PROFILE_CA_SINGLE_LOW_INCOME.model_copy(
        update={"current_benefits": ["snap"]}
    )
    r = _result(profile, "snap")
    assert r.status == EligibilityStatus.ALREADY_RECEIVING


def test_unsupported_state_is_unable_to_determine():
    profile = F.PROFILE_CA_SINGLE_LOW_INCOME.model_copy(update={"state": "WA"})
    r = _result(profile, "snap")
    assert r.status == EligibilityStatus.UNABLE_TO_DETERMINE
