/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FAQItem } from '../types';

export const MEDICAL_DISCLAIMER = "This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.";

export const EDUCATIONAL_TOPICS = [
  {
    id: 'bp_numbers',
    title: 'Understanding Your Blood Pressure Numbers',
    description: 'Blood pressure is recorded as two numbers, measured in millimetres of mercury (mmHg).',
    details: [
      {
        title: 'Systolic Blood Pressure (The top number)',
        content: 'This measures the pressure in your arteries when your heart beats and pumps blood.'
      },
      {
        title: 'Diastolic Blood Pressure (The bottom number)',
        content: 'This measures the pressure in your arteries when your heart rests between beats.'
      },
      {
        title: 'Persistent Elevated Readings',
        content: 'The National Heart Foundation of Australia defines high blood pressure (hypertension) as a persistent level of 140/90 mmHg or higher. A single high reading does not mean you have high blood pressure, as your blood pressure fluctuates throughout the day due to physical activity, stress, caffeine, and other factors.'
      }
    ]
  },
  {
    id: 'measurement_technique',
    title: 'How to Measure Blood Pressure at Home (HBPM)',
    description: 'Measuring your blood pressure at home correctly ensures your GP gets an accurate picture of your actual health.',
    details: [
      {
        title: '1. Prepare yourself',
        content: 'Avoid caffeine, smoking, and vigorous exercise for at least 30 minutes before measuring. Empty your bladder and sit quietly for 5 minutes without distraction.'
      },
      {
        title: '2. Correct posture',
        content: 'Sit in a comfortable chair with your back supported, feet flat on the floor (do not cross your legs), and your arm resting on a table so the cuff is at heart level.'
      },
      {
        title: '3. Cuff fit and placement',
        content: 'Place the cuff on your bare arm, about 2cm above the bend of your elbow. The cuff should fit snugly but allow two fingers to slide underneath.'
      },
      {
        title: '4. Take two readings',
        content: 'Take two measurements 1-2 minutes apart, both in the morning (before eating or taking medication) and evening. Record both readings.'
      }
    ]
  },
  {
    id: 'healthy_habits',
    title: 'Healthy Lifestyle Interventions',
    description: 'According to the National Heart Foundation of Australia, making these healthy choices can help lower blood pressure or reduce the need for medications.',
    details: [
      {
        title: 'Sodium (Salt) Reduction',
        content: 'Limit salt intake to less than 5 grams per day (approx 2000mg of sodium, or about 1 teaspoon). Avoid adding salt during cooking or at the table, and check nutrition labels for low-sodium options.'
      },
      {
        title: 'Heart-Healthy Eating',
        content: 'Follow a heart-healthy diet such as the Mediterranean-style diet. Enjoy plenty of vegetables, fruit, wholegrains, nuts, seeds, lean protein (fish, poultry), and limit foods high in saturated fat and sugar.'
      },
      {
        title: 'Regular Physical Activity',
        content: 'Aim for at least 30 minutes of moderate-intensity physical activity on most, preferably all, days of the week (minimum 150-300 minutes per week). This can include brisk walking, swimming, or cycling.'
      },
      {
        title: 'Limit Alcohol Intake',
        content: 'Limit alcohol consumption to no more than 10 standard drinks per week, and no more than 4 standard drinks on any single day.'
      },
      {
        title: 'Smoke-Free Living',
        content: 'Quitting smoking is the single most important lifestyle change for protecting your heart and blood vessels from damage.'
      },
      {
        title: 'Maintain a Healthy Weight',
        content: 'Aim for a healthy body mass index (BMI 18.5 - 24.9) and a healthy waist circumference (< 94 cm for men, < 80 cm for women).'
      },
      {
        title: 'Stress Management',
        content: 'Incorporate relaxation techniques such as mindfulness, deep breathing exercises, physical activity, and ensuring you get adequate sleep.'
      }
    ]
  },
  {
    id: 'medication_adherence',
    title: 'Taking Blood Pressure Medications',
    description: 'If your doctor has prescribed medications to manage your hypertension, taking them regularly is vital.',
    details: [
      {
        title: 'Take exactly as directed',
        content: 'Take your medications at the same time every day to establish a consistent routine and keep your blood pressure stable.'
      },
      {
        title: 'Never stop or adjust without your doctor',
        content: 'Even if your blood pressure feels normal or falls back to a safe range, this is likely because the medication is working. Do NOT stop, skip, or change your dose without first speaking with your GP.'
      },
      {
        title: 'Manage side effects safely',
        content: 'If you suspect you are experiencing side effects, contact your doctor or pharmacist. They can help adjust the medication type or schedule safely. Never self-prescribe or adjust.'
      }
    ]
  }
];

export const FAQS: FAQItem[] = [
  {
    id: 'faq_1',
    category: 'General',
    question: 'What is high blood pressure (hypertension)?',
    answer: 'High blood pressure (hypertension) occurs when the blood pumps through your arteries with more force than normal. Over time, this extra pressure damages the walls of your blood vessels and increases the workload on your heart.'
  },
  {
    id: 'faq_2',
    category: 'Risks',
    question: 'Why is managing high blood pressure so important?',
    answer: 'If left untreated, high blood pressure can cause serious health complications, including heart attacks, heart failure, strokes, kidney damage, and vascular dementia. Lowering blood pressure significantly reduces these risks.'
  },
  {
    id: 'faq_3',
    category: 'Symptoms',
    question: 'What are the symptoms of high blood pressure?',
    answer: 'Hypertension is often called a "silent killer" because it rarely has obvious warning signs or symptoms. Most people feel perfectly well. The only way to know if you have high blood pressure is to have it measured regularly.'
  },
  {
    id: 'faq_4',
    category: 'Lifestyle',
    question: 'How much salt (sodium) should I consume daily?',
    answer: 'The National Heart Foundation of Australia recommends limiting your total salt intake to less than 5 grams per day. This is approximately 2000mg of sodium, which is roughly equivalent to 1 level teaspoon of salt.'
  },
  {
    id: 'faq_5',
    category: 'Lifestyle',
    question: 'How does physical activity help blood pressure?',
    answer: 'Regular aerobic exercise makes your heart stronger. A stronger heart can pump more blood with less effort, reducing the force on your arteries and lowering blood pressure. Aim for at least 30 minutes of moderate activity on most days.'
  },
  {
    id: 'faq_6',
    category: 'Medications',
    question: 'Can I stop taking blood pressure pills if my BP is normal?',
    answer: 'No. Normal readings indicate that your medication is working effectively to control your blood pressure. Stopping your medication will cause your blood pressure to rise again, putting you at risk. Always speak to your GP before making any changes.'
  }
];

export const PRESET_CHAT_QUESTIONS = [
  "What is hypertension and what are its risks?",
  "How much salt should I have per day according to guidelines?",
  "What is the correct way to measure my blood pressure at home?",
  "Why must I not stop my blood pressure medications when my readings are normal?",
  "What are the heart-healthy lifestyle habits recommended by the Heart Foundation of Australia?"
];

export const GP_QUESTIONS = [
  { id: 'gp_1', question: 'Are my current home blood pressure readings in a safe range for my individual health?', checked: false },
  { id: 'gp_2', question: 'What is my personal target blood pressure level?', checked: false },
  { id: 'gp_3', question: 'Are there any specific side effects of my prescribed medication I should watch out for?', checked: false },
  { id: 'gp_4', question: 'What should I do if I accidentally miss a dose of my medication?', checked: false },
  { id: 'gp_5', question: 'How often would you like me to monitor my blood pressure at home, and when should we schedule our next check-up?', checked: false },
  { id: 'gp_6', question: 'Which lifestyle changes (like low salt, diet, or exercise) should I prioritize first for my blood pressure?', checked: false }
];
