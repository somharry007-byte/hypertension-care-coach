# Hypertension Care Companion

An interactive full-stack digital care companion specifically tailored to support adults managing hypertension (high blood pressure). Built using a secure React frontend, Express backend, and the advanced Gemini 3.5 Flash model, this app acts as a supportive 24/7 cardiovascular coach to promote consistent habits and protect vital organ health.

---

## Key Features

### 1. Medication Scheduling & Timers
- **Daily Reminders**: Log your active prescriptions (Name, Dosage, Frequency, scheduled times) or configure standard blood pressure medications (such as Lisinopril, Losartan, or Amlodipine) instantly.
- **Alarm Simulator**: Real-time timer checks trigger alert prompts exactly at scheduled minutes, requesting a Taken/Missed confirm.

### 2. Adherence Logs & Barrier Triggers
- **Dose Tracking**: Check off daily pills taken. If a dose is missed or skipped, the user can select an underlying adherence barrier (e.g., forgetfulness, side effects, cost, complex regimen).
- **Redirection Callback**: Specifying a barrier instantly navigates you to the AI Coach with the barrier loaded for targeted resolution.

### 3. Patient Education Hub
- **Cardiovascular Lexicon**: Read structured, easy-to-understand descriptions of systolic vs. diastolic pressure and the silent nature of hypertension.
- **Gemini AI Pharmacist**: Type any hypertensive drug name (e.g., Spironolactone, Carvedilol) to have Gemini instantly translate complex pharmacology, side effects, and best practices into gentle, encouraging guidelines.

### 4. Overcome Obstacles Questionnaire
- **Non-Judgmental Checklist**: Highlight specific friction points in your routine.
- **Personalized Action Blueprint**: Connected to the server-side Gemini API `/api/gemini/analyze-barriers` endpoint to generate custom habit switches, alarm suggestions, and physician dialogue scripts.

### 5. Healthy Habits & BP Tracker
- **AHA Blood Pressure Logbook**: Track daily numbers with pulse rates. Readings are classified based on official American Heart Association guidelines, prompting warnings for Hypertensive Crisis (Systolic >180 / Diastolic >120 mmHg).
- **Interactive Line Trends**: Beautiful multi-line graphs powered by `recharts` to map blood pressure variations.
- **Support Chatbot**: Talk to "CalmPulse Coach" about DASH diet recipes, sodium limits, or exercise routines.
- **Regulator breathing circle**: A clinically backable visual expanding/shrinking circle guide (Inhale, Hold, Exhale) designed to trigger parasympathetic relaxation and calm arterial tension.
- **Daily Heart Challenges**: Check-off non-pharmacological tasks (DASH swapper, zero table salt days, walks) to build positive health streaks.

---

## 🛡️ Medical Disclaimer
This Hypertension Care Companion is designed for educational and health-literacy tracking purposes only. It does not provide licensed diagnostic or therapeutic determinations. Patients must consult with their cardiologist or primary practitioner before making any changes to their drug dosages, schedules, or physical activity regimens.
