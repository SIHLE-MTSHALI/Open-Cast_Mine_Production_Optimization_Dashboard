"""
Monte Carlo Quality Simulation — Issue #21

Extends the quality_simulator with:
 - Configurable iteration count
 - Per-field uncertainty parameters (mean, std, distribution)
 - Probability of meeting spec
 - Sensitivity analysis (tornado chart data)
"""

import logging
import uuid
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
import numpy as np
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


@dataclass
class UncertaintyParam:
    """Uncertainty distribution for a single quality field."""
    field_name: str
    mean: float
    std: float
    distribution: str = "normal"  # normal, lognormal, uniform, triangular
    min_val: Optional[float] = None
    max_val: Optional[float] = None


@dataclass
class MonteCarloResult:
    """Result of Monte Carlo quality simulation."""
    iterations: int
    product_id: str
    probability_of_compliance: float  # 0-1
    field_stats: Dict[str, Dict]  # field -> {mean, std, p5, p50, p95, prob_in_spec}
    sensitivity: List[Dict]  # sorted by impact, for tornado chart
    compliance_histogram: List[float]  # histogram bins of compliance score
    revenue_at_risk: float  # expected revenue loss from non-compliance


class MonteCarloQualitySimulator:
    """
    Monte Carlo simulation for quality compliance probability.

    Runs N iterations with randomized quality inputs based on
    uncertainty parameters, blends through the schedule, and
    reports probability of meeting product specifications.
    """

    def __init__(self, db: Session):
        self.db = db
        self.rng = np.random.default_rng()

    def run_simulation(
        self,
        parcels: List[Dict],
        product_specs: Dict[str, Dict],  # field -> {min, max, target}
        uncertainty_params: List[UncertaintyParam],
        iterations: int = 1000,
        product_id: str = "default",
        revenue_per_tonne: float = 0,
        total_tonnes: float = 0,
    ) -> MonteCarloResult:
        """
        Run Monte Carlo simulation.

        Args:
            parcels: List of parcel dicts with quality fields
            product_specs: Quality specification {field: {min, max, target}}
            uncertainty_params: Per-field uncertainty distributions
            iterations: Number of simulation iterations
            product_id: Product identifier
            revenue_per_tonne: Revenue per tonne for risk calculation
            total_tonnes: Total planned tonnes
        """
        if not parcels or not product_specs:
            return MonteCarloResult(
                iterations=iterations, product_id=product_id,
                probability_of_compliance=0, field_stats={},
                sensitivity=[], compliance_histogram=[], revenue_at_risk=0,
            )

        # Build uncertainty lookup
        uncertainty_map = {u.field_name: u for u in uncertainty_params}

        # Run iterations
        compliance_scores = []
        field_values = {f: [] for f in product_specs}

        for _ in range(iterations):
            # Perturb parcel qualities
            blended = self._blend_with_uncertainty(parcels, uncertainty_map, product_specs)

            # Check compliance
            score = 1.0
            for field_name, spec in product_specs.items():
                val = blended.get(field_name, 0)
                field_values[field_name].append(val)

                in_spec = True
                if 'min' in spec and spec['min'] is not None and val < spec['min']:
                    in_spec = False
                if 'max' in spec and spec['max'] is not None and val > spec['max']:
                    in_spec = False
                if not in_spec:
                    score *= 0  # Binary compliance per field

            compliance_scores.append(score)

        # Calculate statistics
        prob_compliance = np.mean(compliance_scores)

        field_stats = {}
        for field_name, values in field_values.items():
            arr = np.array(values)
            spec = product_specs[field_name]
            in_spec_count = sum(
                1 for v in values
                if (spec.get('min') is None or v >= spec['min'])
                and (spec.get('max') is None or v <= spec['max'])
            )
            field_stats[field_name] = {
                'mean': float(np.mean(arr)),
                'std': float(np.std(arr)),
                'p5': float(np.percentile(arr, 5)),
                'p50': float(np.percentile(arr, 50)),
                'p95': float(np.percentile(arr, 95)),
                'prob_in_spec': in_spec_count / iterations,
                'spec_min': spec.get('min'),
                'spec_max': spec.get('max'),
            }

        # Sensitivity analysis (tornado chart)
        sensitivity = self._sensitivity_analysis(
            parcels, uncertainty_map, product_specs, iterations=min(iterations, 200)
        )

        # Revenue at risk
        revenue_at_risk = (1 - prob_compliance) * revenue_per_tonne * total_tonnes

        # Compliance histogram
        hist, _ = np.histogram(compliance_scores, bins=20, range=(0, 1))
        compliance_histogram = hist.tolist()

        return MonteCarloResult(
            iterations=iterations,
            product_id=product_id,
            probability_of_compliance=float(prob_compliance),
            field_stats=field_stats,
            sensitivity=sensitivity,
            compliance_histogram=compliance_histogram,
            revenue_at_risk=float(revenue_at_risk),
        )

    def _blend_with_uncertainty(
        self,
        parcels: List[Dict],
        uncertainty_map: Dict[str, UncertaintyParam],
        product_specs: Dict[str, Dict],
    ) -> Dict[str, float]:
        """Blend parcel qualities with randomized perturbations."""
        total_tonnes = sum(p.get('tonnes', 1) for p in parcels)
        if total_tonnes == 0:
            return {}

        blended = {}
        for field_name in product_specs:
            weighted_sum = 0
            for p in parcels:
                base_val = p.get('quality', {}).get(field_name, 0) or p.get(field_name, 0)
                tonnes = p.get('tonnes', 1)

                # Apply uncertainty
                if field_name in uncertainty_map:
                    u = uncertainty_map[field_name]
                    perturbation = self._sample_distribution(u)
                    val = base_val + perturbation
                else:
                    val = base_val

                weighted_sum += val * tonnes

            blended[field_name] = weighted_sum / total_tonnes if total_tonnes > 0 else 0

        return blended

    def _sample_distribution(self, u: UncertaintyParam) -> float:
        """Sample from the specified distribution."""
        if u.distribution == 'normal':
            return float(self.rng.normal(0, u.std))
        elif u.distribution == 'lognormal':
            return float(self.rng.lognormal(0, u.std) - 1) * u.mean
        elif u.distribution == 'uniform':
            half = u.std * 1.732  # sqrt(3) for uniform with same std
            return float(self.rng.uniform(-half, half))
        elif u.distribution == 'triangular':
            return float(self.rng.triangular(-u.std * 2, 0, u.std * 2))
        return 0.0

    def _sensitivity_analysis(
        self,
        parcels: List[Dict],
        uncertainty_map: Dict[str, UncertaintyParam],
        product_specs: Dict[str, Dict],
        iterations: int = 200,
    ) -> List[Dict]:
        """
        One-at-a-time sensitivity: freeze all fields except one,
        measure compliance change per field.
        """
        baseline = self.run_simulation(
            parcels, product_specs,
            [u for u in uncertainty_map.values()],
            iterations=iterations,
        ).probability_of_compliance

        sensitivity = []
        for field_name, u in uncertainty_map.items():
            # Run with only this field uncertain
            single_result = self.run_simulation(
                parcels, product_specs,
                [u],  # only this field
                iterations=iterations,
            ).probability_of_compliance

            impact = abs(baseline - single_result)
            sensitivity.append({
                'field': field_name,
                'impact': float(impact),
                'baseline_compliance': float(baseline),
                'isolated_compliance': float(single_result),
            })

        # Sort by impact descending
        sensitivity.sort(key=lambda x: x['impact'], reverse=True)
        return sensitivity


def create_monte_carlo_simulator(db: Session) -> MonteCarloQualitySimulator:
    """Factory function."""
    return MonteCarloQualitySimulator(db)
