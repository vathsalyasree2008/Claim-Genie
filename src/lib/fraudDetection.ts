import { Vehicle, getClaimsByPlate } from '@/data/mockDatabase';

export interface FraudResult {
  risk: 'low' | 'medium' | 'high';
  score: number; // 0-100
  reasons: string[];
}

export function detectFraud(params: {
  vehicle: Vehicle;
  claimAmount: number;
  geotagLocation?: { lat: number; lng: number } | null;
  userEnteredLocation?: string;
  hasGeotag: boolean;
  damageSeverities: string[];
}): FraudResult {
  const reasons: string[] = [];
  let score = 0;

  // 1. Missing geotag
  if (!params.hasGeotag) {
    score += 15;
    reasons.push('Image missing GPS/geotag metadata');
  }

  // 2. Location mismatch (simulated)
  if (params.geotagLocation && params.userEnteredLocation) {
    const locationMismatch = Math.random() > 0.7;
    if (locationMismatch) {
      score += 25;
      reasons.push('Geotag location does not match user-entered accident location');
    }
  }

  // 3. Claim exceeding policy limit
  if (params.claimAmount > params.vehicle.maxCoverageLimit) {
    score += 20;
    reasons.push('Claim amount exceeds maximum policy coverage limit');
  }

  // 4. Repeated claims — frequency analysis
  const previousClaims = getClaimsByPlate(params.vehicle.numberPlate);
  const totalPreviousClaims = params.vehicle.previousClaims + previousClaims.length;
  
  // Recent claims within 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recentClaims = previousClaims.filter(c => new Date(c.timestamp) > sixMonthsAgo);
  
  if (recentClaims.length >= 2) {
    score += 30;
    reasons.push(`${recentClaims.length} claims filed within last 6 months — suspicious frequency`);
  } else if (totalPreviousClaims >= 3) {
    score += 25;
    reasons.push(`Vehicle has ${totalPreviousClaims} previous claims — high frequency`);
  } else if (totalPreviousClaims >= 1) {
    score += 10;
    reasons.push(`Vehicle has ${totalPreviousClaims} previous claim(s)`);
  }

  // 5. High severity with low damage count
  const severeCount = params.damageSeverities.filter(s => s === 'severe').length;
  const totalParts = params.damageSeverities.length;
  if (severeCount > 0 && totalParts <= 1) {
    score += 15;
    reasons.push('High severity reported with minimal visible damage areas');
  }

  // 6. Policy nearing expiry — suspicious behavior
  const expiryDate = new Date(params.vehicle.policyExpiry);
  const daysToExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysToExpiry > 0 && daysToExpiry <= 30) {
    score += 10;
    reasons.push(`Policy expires in ${daysToExpiry} days — claim near expiry window`);
  }

  // 7. Pattern-based severity anomaly: all parts same severity
  if (totalParts >= 3) {
    const allSame = params.damageSeverities.every(s => s === params.damageSeverities[0]);
    if (allSame) {
      score += 10;
      reasons.push('All damaged parts have identical severity — unusual pattern');
    }
  }

  // 8. Claim amount vs IDV ratio
  if (params.vehicle.idvValue && params.claimAmount > params.vehicle.idvValue * 0.6) {
    score += 15;
    reasons.push('Claim amount exceeds 60% of Insured Declared Value');
  }

  // 9. Device fingerprint simulation
  const deviceSuspicious = Math.random() > 0.85;
  if (deviceSuspicious) {
    score += 10;
    reasons.push('Device fingerprint flagged — multiple claims from same device');
  }

  // Cap score at 100
  score = Math.min(score, 100);

  // Determine risk level
  let risk: 'low' | 'medium' | 'high';
  if (score >= 50) {
    risk = 'high';
  } else if (score >= 25) {
    risk = 'medium';
  } else {
    risk = 'low';
  }

  if (reasons.length === 0) {
    reasons.push('No fraud indicators detected');
  }

  return { risk, score, reasons };
}
