import { Vehicle, DamagedPart, PARTS_CATALOG } from '@/data/mockDatabase';

const SEVERITY_MULTIPLIER = {
  minor: 1.0,
  moderate: 1.8,
  severe: 3.0,
};

export interface CostBreakdown {
  parts: DamagedPart[];
  totalBaseCost: number;
  totalDepreciatedCost: number;
  totalDamageCost: number;
  coverageAmount: number;
  deductible: number;
  claimableAmount: number;
  maxLimitApplied: boolean;
  coveragePercent: number;
}

export function calculateClaimCost(
  damagedPartNames: { partName: string; severity: 'minor' | 'moderate' | 'severe' }[],
  vehicle: Vehicle
): CostBreakdown {
  const vehicleAge = new Date().getFullYear() - vehicle.year;

  const parts: DamagedPart[] = damagedPartNames.map(({ partName, severity }) => {
    const catalog = PARTS_CATALOG.find(p => p.partName === partName);
    if (!catalog) {
      return {
        partName,
        partLabel: partName,
        severity,
        baseCost: 5000,
        depreciatedCost: 5000,
        finalCost: 5000 * SEVERITY_MULTIPLIER[severity],
      };
    }

    const baseCost = Math.round(
      catalog.baseCostRange[0] + (catalog.baseCostRange[1] - catalog.baseCostRange[0]) * 0.6
    );

    const depreciationFactor = Math.max(0.3, 1 - catalog.depreciationRate * vehicleAge);
    const depreciatedCost = Math.round(baseCost * depreciationFactor);
    const finalCost = Math.round(depreciatedCost * SEVERITY_MULTIPLIER[severity]);

    return {
      partName,
      partLabel: catalog.partLabel,
      severity,
      baseCost,
      depreciatedCost,
      finalCost,
    };
  });

  const totalBaseCost = parts.reduce((sum, p) => sum + p.baseCost, 0);
  const totalDepreciatedCost = parts.reduce((sum, p) => sum + p.depreciatedCost, 0);
  const totalDamageCost = parts.reduce((sum, p) => sum + p.finalCost, 0);

  const coverageAmount = Math.round(totalDamageCost * (vehicle.coveragePercent / 100));
  const afterDeductible = Math.max(0, coverageAmount - vehicle.deductible);
  const maxLimitApplied = afterDeductible > vehicle.maxCoverageLimit;
  const claimableAmount = Math.min(afterDeductible, vehicle.maxCoverageLimit);

  return {
    parts,
    totalBaseCost,
    totalDepreciatedCost,
    totalDamageCost,
    coverageAmount,
    deductible: vehicle.deductible,
    claimableAmount,
    maxLimitApplied,
    coveragePercent: vehicle.coveragePercent,
  };
}
