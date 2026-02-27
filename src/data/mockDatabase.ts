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
}

export interface Claim {
  claimId: string;
  numberPlate: string;
  detectedParts: DamagedPart[];
  totalDamageCost: number;
  claimableAmount: number;
  fraudRisk: 'low' | 'medium' | 'high';
  fraudReasons: string[];
  status: 'pending' | 'approved' | 'rejected' | 'under_investigation';
  timestamp: string;
  accidentLocation?: { lat: number; lng: number };
  userEnteredLocation?: string;
  geotagLocation?: { lat: number; lng: number };
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
  },
];

// Claims storage (in-memory)
export const claimsStore: Claim[] = [];

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
