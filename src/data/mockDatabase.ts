export interface Vehicle {
  numberPlate: string;
  ownerName: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  policyId: string;
  coveragePercent: number;
  deductible: number;
  maxCoverageLimit: number;
  policyExpiry: string;
  previousClaims: number;
  registeredMobile: string;
  idvValue: number;
  ncbPercent: number;
  addOns: string[];
  aadhaarLast4: string;
  panLast4: string;
}

export interface Claim {
  claimId: string;
  numberPlate: string;
  detectedParts: DamagedPart[];
  totalDamageCost: number;
  claimableAmount: number;
  fraudRisk: 'low' | 'medium' | 'high';
  fraudScore: number;
  fraudReasons: string[];
  status: 'pending' | 'approved' | 'rejected' | 'under_investigation';
  timestamp: string;
  accidentLocation?: { lat: number; lng: number };
  userEnteredLocation?: string;
  geotagLocation?: { lat: number; lng: number };
  settlementEstimate?: string;
  requiredDocuments?: string[];
}

export interface DamagedPart {
  partName: string;
  partLabel: string;
  severity: 'minor' | 'moderate' | 'severe';
  baseCost: number;
  depreciatedCost: number;
  finalCost: number;
}

export interface PartCatalog {
  partName: string;
  partLabel: string;
  baseCostRange: [number, number];
  depreciationRate: number;
}

// Parts catalog with Indian pricing (INR)
export const PARTS_CATALOG: PartCatalog[] = [
  { partName: 'bumper_front', partLabel: 'Front Bumper', baseCostRange: [8000, 25000], depreciationRate: 0.15 },
  { partName: 'bumper_rear', partLabel: 'Rear Bumper', baseCostRange: [7000, 22000], depreciationRate: 0.15 },
  { partName: 'headlight_left', partLabel: 'Left Headlight', baseCostRange: [5000, 18000], depreciationRate: 0.20 },
  { partName: 'headlight_right', partLabel: 'Right Headlight', baseCostRange: [5000, 18000], depreciationRate: 0.20 },
  { partName: 'taillight_left', partLabel: 'Left Taillight', baseCostRange: [3000, 10000], depreciationRate: 0.20 },
  { partName: 'taillight_right', partLabel: 'Right Taillight', baseCostRange: [3000, 10000], depreciationRate: 0.20 },
  { partName: 'door_front_left', partLabel: 'Front Left Door', baseCostRange: [15000, 45000], depreciationRate: 0.10 },
  { partName: 'door_front_right', partLabel: 'Front Right Door', baseCostRange: [15000, 45000], depreciationRate: 0.10 },
  { partName: 'door_rear_left', partLabel: 'Rear Left Door', baseCostRange: [12000, 40000], depreciationRate: 0.10 },
  { partName: 'door_rear_right', partLabel: 'Rear Right Door', baseCostRange: [12000, 40000], depreciationRate: 0.10 },
  { partName: 'windshield', partLabel: 'Windshield', baseCostRange: [8000, 30000], depreciationRate: 0.00 },
  { partName: 'hood', partLabel: 'Hood/Bonnet', baseCostRange: [12000, 35000], depreciationRate: 0.12 },
  { partName: 'fender_left', partLabel: 'Left Fender', baseCostRange: [6000, 20000], depreciationRate: 0.12 },
  { partName: 'fender_right', partLabel: 'Right Fender', baseCostRange: [6000, 20000], depreciationRate: 0.12 },
  { partName: 'side_mirror_left', partLabel: 'Left Side Mirror', baseCostRange: [2000, 8000], depreciationRate: 0.25 },
  { partName: 'side_mirror_right', partLabel: 'Right Side Mirror', baseCostRange: [2000, 8000], depreciationRate: 0.25 },
];

// Mock insured vehicles
export const MOCK_VEHICLES: Vehicle[] = [
  {
    numberPlate: 'MH01AB1234',
    ownerName: 'Rajesh Kumar Sharma',
    vehicleType: 'Sedan',
    make: 'Maruti Suzuki',
    model: 'Ciaz',
    year: 2021,
    policyId: 'POL-2024-001',
    coveragePercent: 80,
    deductible: 5000,
    maxCoverageLimit: 500000,
    policyExpiry: '2026-12-31',
    previousClaims: 0,
    registeredMobile: '9876543210',
    idvValue: 725000,
    ncbPercent: 50,
    addOns: ['Zero Depreciation', 'Engine Protect'],
    aadhaarLast4: '4321',
    panLast4: 'K78A',
  },
  {
    numberPlate: 'DL05CE5678',
    ownerName: 'Priya Verma',
    vehicleType: 'SUV',
    make: 'Hyundai',
    model: 'Creta',
    year: 2022,
    policyId: 'POL-2024-002',
    coveragePercent: 85,
    deductible: 7500,
    maxCoverageLimit: 750000,
    policyExpiry: '2026-06-30',
    previousClaims: 1,
    registeredMobile: '9123456789',
    idvValue: 1050000,
    ncbPercent: 35,
    addOns: ['Zero Depreciation'],
    aadhaarLast4: '8765',
    panLast4: 'V22B',
  },
  {
    numberPlate: 'KA03MN9012',
    ownerName: 'Arun Patel',
    vehicleType: 'Hatchback',
    make: 'Tata',
    model: 'Altroz',
    year: 2020,
    policyId: 'POL-2024-003',
    coveragePercent: 75,
    deductible: 3000,
    maxCoverageLimit: 350000,
    policyExpiry: '2025-03-15',
    previousClaims: 3,
    registeredMobile: '9988776655',
    idvValue: 480000,
    ncbPercent: 0,
    addOns: [],
    aadhaarLast4: '1122',
    panLast4: 'P33C',
  },
  {
    numberPlate: 'TN07PQ3456',
    ownerName: 'Lakshmi Narayanan',
    vehicleType: 'Sedan',
    make: 'Honda',
    model: 'City',
    year: 2023,
    policyId: 'POL-2024-004',
    coveragePercent: 90,
    deductible: 10000,
    maxCoverageLimit: 800000,
    policyExpiry: '2027-01-15',
    previousClaims: 0,
    registeredMobile: '9012345678',
    idvValue: 1200000,
    ncbPercent: 50,
    addOns: ['Zero Depreciation', 'Engine Protect', 'Roadside Assistance'],
    aadhaarLast4: '5566',
    panLast4: 'N44D',
  },
  {
    numberPlate: 'GJ01RS7890',
    ownerName: 'Mehul Desai',
    vehicleType: 'SUV',
    make: 'Mahindra',
    model: 'XUV700',
    year: 2022,
    policyId: 'POL-2024-005',
    coveragePercent: 80,
    deductible: 8000,
    maxCoverageLimit: 600000,
    policyExpiry: '2026-09-20',
    previousClaims: 2,
    registeredMobile: '9345678901',
    idvValue: 1550000,
    ncbPercent: 20,
    addOns: ['Engine Protect'],
    aadhaarLast4: '3344',
    panLast4: 'D55E',
  },
];

// Claims storage (in-memory)
export const claimsStore: Claim[] = [
  // Pre-populated claims for history demo
  {
    claimId: 'CLM-2024-001',
    numberPlate: 'DL05CE5678',
    detectedParts: [
      { partName: 'bumper_rear', partLabel: 'Rear Bumper', severity: 'moderate', baseCost: 15000, depreciatedCost: 12750, finalCost: 22950 },
    ],
    totalDamageCost: 22950,
    claimableAmount: 12008,
    fraudRisk: 'low',
    fraudScore: 10,
    fraudReasons: ['Vehicle has 1 previous claim(s)'],
    status: 'approved',
    timestamp: '2024-08-15T10:30:00Z',
    userEnteredLocation: 'Connaught Place, New Delhi',
  },
  {
    claimId: 'CLM-2024-002',
    numberPlate: 'KA03MN9012',
    detectedParts: [
      { partName: 'windshield', partLabel: 'Windshield', severity: 'severe', baseCost: 20000, depreciatedCost: 20000, finalCost: 60000 },
      { partName: 'hood', partLabel: 'Hood/Bonnet', severity: 'moderate', baseCost: 24000, depreciatedCost: 18720, finalCost: 33696 },
    ],
    totalDamageCost: 93696,
    claimableAmount: 67272,
    fraudRisk: 'high',
    fraudScore: 55,
    fraudReasons: ['Vehicle has 3 previous claims — high frequency', 'Image missing GPS/geotag metadata', 'Claim amount exceeds maximum policy coverage limit'],
    status: 'under_investigation',
    timestamp: '2024-11-02T14:15:00Z',
    userEnteredLocation: 'MG Road, Bangalore',
  },
  {
    claimId: 'CLM-2025-001',
    numberPlate: 'GJ01RS7890',
    detectedParts: [
      { partName: 'fender_left', partLabel: 'Left Fender', severity: 'minor', baseCost: 13000, depreciatedCost: 11440, finalCost: 11440 },
    ],
    totalDamageCost: 11440,
    claimableAmount: 1152,
    fraudRisk: 'medium',
    fraudScore: 35,
    fraudReasons: ['Vehicle has 2 previous claim(s)', 'Geotag location does not match user-entered accident location'],
    status: 'pending',
    timestamp: '2025-01-20T09:45:00Z',
    userEnteredLocation: 'SG Highway, Ahmedabad',
  },
];

export function lookupVehicle(numberPlate: string): Vehicle | null {
  const normalized = numberPlate.replace(/[\s-]/g, '').toUpperCase();
  return MOCK_VEHICLES.find(v => v.numberPlate === normalized) || null;
}

export function isPolicyExpired(vehicle: Vehicle): boolean {
  return new Date(vehicle.policyExpiry) < new Date();
}

export function saveClaim(claim: Claim): void {
  claimsStore.push(claim);
}

export function getClaimsByPlate(numberPlate: string): Claim[] {
  return claimsStore.filter(c => c.numberPlate === numberPlate);
}

export function getAllClaims(): Claim[] {
  return [...claimsStore].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function updateClaimStatus(claimId: string, status: Claim['status']): boolean {
  const claim = claimsStore.find(c => c.claimId === claimId);
  if (claim) {
    claim.status = status;
    return true;
  }
  return false;
}

export function getSettlementEstimate(fraudRisk: 'low' | 'medium' | 'high', hasSevere: boolean): string {
  if (fraudRisk === 'high') return '7–14 working days (under investigation)';
  if (hasSevere) return '5–7 working days';
  if (fraudRisk === 'medium') return '5–10 working days';
  return '3–5 working days';
}

export function getRequiredDocuments(severity: string[], fraudRisk: 'low' | 'medium' | 'high'): string[] {
  const docs = ['RC Copy (Registration Certificate)', 'Driving License', 'Claim Form (signed)'];
  const hasSevere = severity.includes('severe');
  if (hasSevere) {
    docs.push('FIR Copy (First Information Report)');
    docs.push('Medical Report (if injuries)');
  }
  if (fraudRisk === 'high' || fraudRisk === 'medium') {
    docs.push('Previous Claim Documents');
  }
  docs.push('Repair Estimate from Authorized Workshop');
  return docs;
}
