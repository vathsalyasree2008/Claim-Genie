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
    // Simulate a mismatch check
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

  // 4. Repeated claims
  const previousClaims = getClaimsByPlate(params.vehicle.numberPlate);
  const totalPreviousClaims = params.vehicle.previousClaims + previousClaims.length;
  if (totalPreviousClaims >= 3) {
    score += 25;
    reasons.push(`Vehicle has ${totalPreviousClaims} previous claims — high frequency`);
  } else if (totalPreviousClaims >= 1) {
    score += 10;
    reasons.push(`Vehicle has ${totalPreviousClaims} previous claim(s)`);
  }

  // 5. High severity with low damage count (simulated)
  const severeCount = params.damageSeverities.filter(s => s === 'severe').length;
  const totalParts = params.damageSeverities.length;
  if (severeCount > 0 && totalParts <= 1) {
    score += 15;
    reasons.push('High severity reported with minimal visible damage areas');
  }

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
