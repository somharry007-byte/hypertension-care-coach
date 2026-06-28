/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BPReading {
  id: string;
  systolic: number;
  diastolic: number;
  heartRate?: number;
  timestamp: string; // ISO string
  notes: string;
  method: 'home' | 'clinic';
}

export type BPClassification = 
  | 'optimal' 
  | 'normal' 
  | 'high_normal' 
  | 'grade_1' 
  | 'grade_2' 
  | 'grade_3' 
  | 'hypertensive_crisis';

export interface BPClassificationInfo {
  category: BPClassification;
  label: string;
  rangeSystolic: string;
  rangeDiastolic: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  advice: string;
}

export type HabitCategory = 'diet' | 'sodium' | 'alcohol' | 'activity' | 'weight' | 'smoking' | 'stress';

export interface LifestyleHabit {
  id: string;
  category: HabitCategory;
  title: string;
  goalText: string;
  completedDays: string[]; // ISO 'YYYY-MM-DD'
  targetFrequencyPerWeek: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay?: string;
  takenDates: string[]; // array of 'YYYY-MM-DD'
  reminders?: string[]; // array of reminder times, e.g. ["08:00", "20:00"]
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}
