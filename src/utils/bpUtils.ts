/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BPClassification, BPClassificationInfo, BPReading } from '../types';

export const BP_CLASSES: Record<BPClassification, BPClassificationInfo> = {
  optimal: {
    category: 'optimal',
    label: 'Optimal',
    rangeSystolic: '< 120',
    rangeDiastolic: '< 80',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Your blood pressure is in the optimal range. This is associated with the lowest risk of cardiovascular disease.',
    advice: 'Continue maintaining your healthy lifestyle choices! Keep up a balanced diet, stay active, and check your blood pressure regularly.'
  },
  normal: {
    category: 'normal',
    label: 'Normal',
    rangeSystolic: '120–129',
    rangeDiastolic: '80–84',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    description: 'Your blood pressure is in the normal range. This is a healthy level, but close monitoring is still encouraged.',
    advice: 'Maintain a heart-healthy diet, limit alcohol, avoid smoking, stay active, and continue checking your blood pressure at home.'
  },
  high_normal: {
    category: 'high_normal',
    label: 'High-Normal',
    rangeSystolic: '130–139',
    rangeDiastolic: '85–89',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Your blood pressure is slightly elevated. While not classified as clinical hypertension, it is a strong signal to focus on heart-healthy habits.',
    advice: 'Review your lifestyle habits. Cutting back on salt, increasing physical activity, and limiting alcohol can help lower your numbers. Have a chat with your doctor about this.'
  },
  grade_1: {
    category: 'grade_1',
    label: 'Grade 1 Hypertension (Mild)',
    rangeSystolic: '140–159',
    rangeDiastolic: '90–99',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'This level suggests mild hypertension. A single reading doesn\'t confirm a diagnosis, but persistent readings in this range require medical evaluation.',
    advice: 'You should schedule an appointment with your GP to discuss these readings. Focus strictly on healthy changes: lower salt intake, regular exercise, and taking any prescribed medications exactly as directed.'
  },
  grade_2: {
    category: 'grade_2',
    label: 'Grade 2 Hypertension (Moderate)',
    rangeSystolic: '160–179',
    rangeDiastolic: '100–109',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    description: 'This level suggests moderate hypertension. Readings in this range are associated with an increased risk of heart disease and stroke.',
    advice: 'Please consult your doctor or healthcare professional promptly for clinical advice and proper assessment. Focus on strict adherence to any medications and lifestyle modifications.'
  },
  grade_3: {
    category: 'grade_3',
    label: 'Grade 3 Hypertension (Severe)',
    rangeSystolic: '≥ 180',
    rangeDiastolic: '≥ 110',
    color: 'text-red-700',
    bgColor: 'bg-red-50/70',
    borderColor: 'border-red-300',
    description: 'This level indicates severely high blood pressure. Severe hypertension requires urgent clinical attention.',
    advice: 'Contact your doctor or visit a medical clinic immediately for guidance. If you experience ANY symptoms like chest pain, shortness of breath, severe headache, numbness/weakness, or vision changes, please call 000 immediately as this is a medical emergency.'
  },
  hypertensive_crisis: {
    category: 'hypertensive_crisis',
    label: 'Hypertensive Emergency Warning',
    rangeSystolic: '≥ 180',
    rangeDiastolic: '≥ 120',
    color: 'text-red-800 font-bold animate-pulse',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-400',
    description: 'Extremely high blood pressure reading detected.',
    advice: 'If you have chest pain, shortness of breath, back pain, numbness, weakness, difficulty speaking, or changes in vision, do not wait. Call 000 in Australia immediately. If you have no symptoms, rest for 5 minutes and test again. If it remains high, contact your doctor immediately.'
  }
};

/**
 * Classify a blood pressure reading according to the National Heart Foundation of Australia.
 * If systolic and diastolic fall into different categories, the higher category is selected.
 */
export function classifyBP(systolic: number, diastolic: number): BPClassification {
  if (systolic >= 180 || diastolic >= 120) {
    // Check for extreme warning levels first
    return 'grade_3'; // We'll handle crisis notifications conditionally in UI if symptoms exist
  }
  if (systolic >= 180 || diastolic >= 110) {
    return 'grade_3';
  }
  if ((systolic >= 160 && systolic <= 179) || (diastolic >= 100 && diastolic <= 109)) {
    return 'grade_2';
  }
  if ((systolic >= 140 && systolic <= 159) || (diastolic >= 90 && diastolic <= 99)) {
    return 'grade_1';
  }
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 85 && diastolic <= 89)) {
    return 'high_normal';
  }
  if ((systolic >= 120 && systolic <= 129) || (diastolic >= 80 && diastolic <= 84)) {
    return 'normal';
  }
  return 'optimal';
}

export function getBPRatingInfo(systolic: number, diastolic: number): BPClassificationInfo {
  // If the values are very high, we check if they hit the emergency boundary
  if (systolic >= 180 || diastolic >= 120) {
    return {
      ...BP_CLASSES.grade_3,
      category: 'hypertensive_crisis',
      label: 'Hypertensive Emergency (Warning)',
      color: 'text-red-700 font-semibold',
      bgColor: 'bg-red-50',
      description: 'Your reading is extremely high (Systolic ≥ 180 or Diastolic ≥ 120). This is a critical warning level.',
      advice: 'Please consult your doctor immediately. If you have symptoms such as chest pain, shortness of breath, severe headache, numbness/weakness, or changes in vision, call 000 (Emergency Services in Australia) immediately.'
    };
  }
  const category = classifyBP(systolic, diastolic);
  return BP_CLASSES[category];
}

export function calculateAverage(readings: BPReading[]): { systolic: number; diastolic: number; count: number } {
  if (readings.length === 0) return { systolic: 0, diastolic: 0, count: 0 };
  const sumSys = readings.reduce((sum, r) => sum + r.systolic, 0);
  const sumDia = readings.reduce((sum, r) => sum + r.diastolic, 0);
  return {
    systolic: Math.round(sumSys / readings.length),
    diastolic: Math.round(sumDia / readings.length),
    count: readings.length
  };
}
