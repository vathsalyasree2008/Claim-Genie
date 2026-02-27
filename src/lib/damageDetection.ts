import { PARTS_CATALOG } from '@/data/mockDatabase';

export interface DetectionResult {
  parts: { partName: string; severity: 'minor' | 'moderate' | 'severe' }[];
}

/**
 * Simulates AI-based damage detection from an uploaded image.
 * In production, this would call a computer vision API.
 */
export function detectDamage(): DetectionResult {
  // Randomly select 2-5 damaged parts
  const numParts = 2 + Math.floor(Math.random() * 4);
  const shuffled = [...PARTS_CATALOG].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, numParts);

  const severities: ('minor' | 'moderate' | 'severe')[] = ['minor', 'moderate', 'severe'];
  const weights = [0.3, 0.5, 0.2]; // moderate most common

  const parts = selected.map(part => {
    const rand = Math.random();
    let severity: 'minor' | 'moderate' | 'severe';
    if (rand < weights[0]) severity = 'minor';
    else if (rand < weights[0] + weights[1]) severity = 'moderate';
    else severity = 'severe';

    return { partName: part.partName, severity };
  });

  return { parts };
}
