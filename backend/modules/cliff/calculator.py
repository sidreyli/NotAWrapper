"""Benefits cliff calculator.

Computes how net resources (income + imputed benefit value) change as monthly income
rises, and detects "cliff zones" where net resources decrease. Uses only the data
layer — no AI, no rules_engine import, no network calls. Synchronous.
"""

from schemas import UserProfile, CliffResponse, CliffDataPoint, CliffZone
from modules.data_layer.fpl import fpl_loader
from modules.data_layer.snap_tables import snap_tables
from modules.data_layer.program_registry import program_registry


class CliffCalculator:
    def __init__(self) -> None:
        self.fpl = fpl_loader
        self.snap = snap_tables
        self.registry = program_registry

    def _point(self, profile: UserProfile, income: float) -> CliffDataPoint:
        state = profile.state
        size = profile.household_size
        children = profile.children_under_18
        adults = profile.adults
        is_employed = profile.employment_status.value in (
            "employed_full", "employed_part", "self_employed"
        )

        # SNAP
        snap_benefit = 0.0
        gross_limit = self.snap.get_gross_limit_monthly(size)
        if income <= gross_limit:
            earned = income if is_employed else 0.0
            net = self.snap.calculate_net_income(income, earned, size)
            snap_benefit = self.snap.estimate_benefit(net, size)

        # Medicaid (expansion states only, $400/adult imputed)
        medicaid_value = 0.0
        try:
            state_data = self.registry.state_programs.get(state, {})
            if state_data.get("medicaid_expansion") and state_data.get("medicaid_adult_fpl_pct"):
                threshold = self.fpl.get_income_at_pct_monthly(
                    state_data["medicaid_adult_fpl_pct"], size, state
                )
                if income <= threshold:
                    medicaid_value = 400.0 * max(1, adults)
        except Exception:
            pass

        # CHIP ($200/child imputed)
        chip_value = 0.0
        if children > 0:
            try:
                state_data = self.registry.state_programs.get(state, {})
                chip_pct = state_data.get("chip_fpl_pct")
                if chip_pct:
                    threshold = self.fpl.get_income_at_pct_monthly(chip_pct, size, state)
                    if income <= threshold:
                        chip_value = 200.0 * children
            except Exception:
                pass

        # LIHEAP ($58/month imputed)
        liheap_value = 0.0
        if profile.housing_status.value not in ("unhoused", "shelter"):
            try:
                state_data = self.registry.state_programs.get(state, {})
                liheap_pct = state_data.get("liheap_fpl_pct")
                if liheap_pct:
                    threshold = self.fpl.get_income_at_pct_monthly(liheap_pct, size, state)
                    if income <= threshold:
                        liheap_value = 58.0
            except Exception:
                pass

        # WIC ($60/eligible person)
        wic_value = 0.0
        eligible_wic = profile.pregnant_women + profile.infants_under_5
        if eligible_wic > 0:
            try:
                threshold = self.fpl.get_income_at_pct_monthly(185, size, state)
                if income <= threshold:
                    wic_value = 60.0 * eligible_wic
            except Exception:
                pass

        total = snap_benefit + medicaid_value + chip_value + liheap_value + wic_value
        return CliffDataPoint(
            monthly_income=income,
            snap_benefit=round(snap_benefit, 2),
            medicaid_value=round(medicaid_value, 2),
            chip_value=round(chip_value, 2),
            liheap_value=round(liheap_value, 2),
            wic_value=round(wic_value, 2),
            total_benefit_value=round(total, 2),
            net_resources=round(income + total, 2),
        )

    def calculate(
        self,
        profile: UserProfile,
        min_income: float = 0,
        max_income: float = 5000,
        step: float = 50,
    ) -> CliffResponse:
        data_points: list[CliffDataPoint] = []
        income = min_income
        while income <= max_income + 0.01:
            data_points.append(self._point(profile, round(income, 2)))
            income += step

        # Detect cliff zones: consecutive steps where net_resources drops
        cliff_zones: list[CliffZone] = []
        i = 0
        while i < len(data_points) - 1:
            if data_points[i + 1].net_resources < data_points[i].net_resources:
                zone_start = i
                while (
                    i < len(data_points) - 1
                    and data_points[i + 1].net_resources < data_points[i].net_resources
                ):
                    i += 1
                zone_end = i
                start_pt = data_points[zone_start]
                end_pt = data_points[zone_end]
                net_change = round(end_pt.net_resources - start_pt.net_resources, 2)

                # Figure out which benefit dropped most
                lost_parts = []
                if end_pt.snap_benefit < start_pt.snap_benefit:
                    lost_parts.append("SNAP")
                if end_pt.medicaid_value < start_pt.medicaid_value:
                    lost_parts.append("Medicaid")
                if end_pt.chip_value < start_pt.chip_value:
                    lost_parts.append("CHIP")
                if end_pt.liheap_value < start_pt.liheap_value:
                    lost_parts.append("LIHEAP")
                if end_pt.wic_value < start_pt.wic_value:
                    lost_parts.append("WIC")

                benefit_lost = ", ".join(lost_parts) if lost_parts else "benefits"
                cliff_zones.append(CliffZone(
                    income_start=start_pt.monthly_income,
                    income_end=end_pt.monthly_income,
                    description=(
                        f"Earning ${start_pt.monthly_income:.0f}–${end_pt.monthly_income:.0f}/month "
                        f"reduces your net resources by ${abs(net_change):.0f} "
                        f"due to loss of {benefit_lost}."
                    ),
                    benefit_lost=benefit_lost,
                    net_change=net_change,
                ))
            else:
                i += 1

        return CliffResponse(profile=profile, data_points=data_points, cliff_zones=cliff_zones)

    def get_current_position(self, profile: UserProfile) -> CliffDataPoint:
        return self._point(profile, profile.monthly_gross_income)


cliff_calculator = CliffCalculator()
