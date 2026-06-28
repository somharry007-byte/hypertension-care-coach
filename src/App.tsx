/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Heart,
  Activity,
  ShieldAlert,
  Sparkles,
  BookOpen,
  ClipboardList,
  CheckCircle2,
  Plus,
  Trash2,
  Printer,
  ArrowRight,
  Clock,
  Send,
  RefreshCw,
  AlertTriangle,
  User,
  Stethoscope,
  Info,
  X,
  ChevronRight,
  Check,
  Calendar,
  Pill,
  Flame,
  Bell,
  HeartPulse
} from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

import { BPReading, ChatMessage, LifestyleHabit, HabitCategory, Medication } from './types';
import { getBPRatingInfo, calculateAverage, BP_CLASSES } from './utils/bpUtils';
import {
  MEDICAL_DISCLAIMER,
  EDUCATIONAL_TOPICS,
  FAQS,
  PRESET_CHAT_QUESTIONS,
  GP_QUESTIONS
} from './data/guidelinesData';

// Helper to get past 7 dates
const getPastDates = (numDays: number): string[] => {
  const dates = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

// Initial Sample Data for better UX on first load
const INITIAL_READINGS: BPReading[] = [
  {
    id: 'r1',
    systolic: 145,
    diastolic: 92,
    heartRate: 72,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Feeling a bit stressed after work.',
    method: 'home'
  },
  {
    id: 'r2',
    systolic: 138,
    diastolic: 88,
    heartRate: 68,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Measured in the morning before food.',
    method: 'home'
  },
  {
    id: 'r3',
    systolic: 132,
    diastolic: 84,
    heartRate: 70,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'After light walking exercise.',
    method: 'home'
  },
  {
    id: 'r4',
    systolic: 128,
    diastolic: 82,
    heartRate: 65,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Morning routine reading.',
    method: 'home'
  }
];

const INITIAL_HABITS: LifestyleHabit[] = [
  {
    id: 'h1',
    category: 'sodium',
    title: 'Salt Limit (< 5g per day)',
    goalText: 'Limit daily salt to < 5g (approx 2000mg sodium, or 1 tsp). Cook with herbs, avoid processed foods.',
    completedDays: [getPastDates(3)[0], getPastDates(3)[2]],
    targetFrequencyPerWeek: 7
  },
  {
    id: 'h2',
    category: 'activity',
    title: '30 Mins Physical Activity',
    goalText: 'Aim for at least 30 minutes of moderate-intensity exercise (like brisk walking or swimming).',
    completedDays: [getPastDates(3)[1], getPastDates(3)[2]],
    targetFrequencyPerWeek: 5
  },
  {
    id: 'h3',
    category: 'alcohol',
    title: 'Limit Alcohol Intake',
    goalText: 'Limit to ≤ 10 standard drinks per week, and ≤ 4 standard drinks on any single day.',
    completedDays: [getPastDates(3)[0], getPastDates(3)[1], getPastDates(3)[2]],
    targetFrequencyPerWeek: 7
  },
  {
    id: 'h4',
    category: 'smoking',
    title: 'Smoke-Free Living',
    goalText: 'Avoid smoking or exposure to tobacco smoke. Single most important cardiorespiratory change.',
    completedDays: [getPastDates(3)[0], getPastDates(3)[1], getPastDates(3)[2]],
    targetFrequencyPerWeek: 7
  },
  {
    id: 'h5',
    category: 'stress',
    title: 'Stress Management Routine',
    goalText: 'Dedicate 10-15 minutes to deep breathing, mindfulness, or walking to regulate stress.',
    completedDays: [getPastDates(3)[1]],
    targetFrequencyPerWeek: 5
  }
];

const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med_1',
    name: 'Perindopril',
    dosage: '5mg',
    frequency: 'Once daily',
    timeOfDay: 'Morning',
    takenDates: [getPastDates(3)[0], getPastDates(3)[1], getPastDates(3)[2]],
    reminders: ['08:00']
  },
  {
    id: 'med_2',
    name: 'Amlodipine',
    dosage: '5mg',
    frequency: 'Once daily',
    timeOfDay: 'Evening',
    takenDates: [getPastDates(3)[0], getPastDates(3)[1], getPastDates(3)[2]],
    reminders: ['20:00']
  }
];

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    role: 'model',
    text: `Hello! I am your **Hypertension Care Coach**. I am here to help you understand high blood pressure, track your readings, set heart-healthy lifestyle goals, and prepare for productive conversations with your doctor.

We operate strictly according to the evidence-based **National Heart Foundation of Australia** guidelines.

How can I support your self-management journey today? Ask me any questions, or select one of the quick questions below to learn more!

*Please note: I am an educational guide. I cannot diagnose conditions, recommend medication dosages, or replace your doctor's clinical advice.*

*This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.*`,
    timestamp: new Date().toISOString()
  }
];

const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  const [hrs, mins] = timeStr.split(':');
  if (!hrs || !mins) return timeStr;
  const h = parseInt(hrs, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:${mins} ${ampm}`;
};

export default function App() {
  // Tabs: 'chat' | 'diary' | 'habits' | 'gp_prep' | 'library'
  const [activeTab, setActiveTab] = useState<'chat' | 'diary' | 'habits' | 'gp_prep' | 'library'>('chat');

  // --- Core State ---
  const [readings, setReadings] = useState<BPReading[]>(() => {
    const saved = localStorage.getItem('coach_bp_readings');
    return saved ? JSON.parse(saved) : INITIAL_READINGS;
  });

  const [habits, setHabits] = useState<LifestyleHabit[]>(() => {
    const saved = localStorage.getItem('coach_lifestyle_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('coach_medications');
    return saved ? JSON.parse(saved) : INITIAL_MEDICATIONS;
  });

  // --- Medication Form State ---
  const [medNameInput, setMedNameInput] = useState<string>('');
  const [medDosageInput, setMedDosageInput] = useState<string>('');
  const [medFrequencyInput, setMedFrequencyInput] = useState<string>('Once daily');
  const [medTimeInput, setMedTimeInput] = useState<string>('Morning');
  const [medReminderInput, setMedReminderInput] = useState<string>('');
  const [medFormError, setMedFormError] = useState<string>('');
  const [newReminderTimes, setNewReminderTimes] = useState<Record<string, string>>({});

  // --- Missed Medication Adherence Survey State ---
  const [missedDoseSurvey, setMissedDoseSurvey] = useState<{
    medicationId: string;
    medicationName: string;
    dateStr: string;
  } | null>(null);
  const [selectedMissedReason, setSelectedMissedReason] = useState<string>('');
  const [customMissedReason, setCustomMissedReason] = useState<string>('');

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('coach_chat_messages');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });

  const [gpQuestions, setGpQuestions] = useState(() => {
    const saved = localStorage.getItem('coach_gp_questions');
    return saved ? JSON.parse(saved) : GP_QUESTIONS;
  });

  // --- UI/Form State ---
  const [systolicInput, setSystolicInput] = useState<string>('');
  const [diastolicInput, setDiastolicInput] = useState<string>('');
  const [heartRateInput, setHeartRateInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');
  const [methodInput, setMethodInput] = useState<'home' | 'clinic'>('home');
  const [bpFormError, setBpFormError] = useState<string>('');

  const [customQuestionInput, setCustomQuestionInput] = useState<string>('');

  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Save states on modification ---
  useEffect(() => {
    localStorage.setItem('coach_bp_readings', JSON.stringify(readings));
  }, [readings]);

  useEffect(() => {
    localStorage.setItem('coach_lifestyle_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('coach_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('coach_gp_questions', JSON.stringify(gpQuestions));
  }, [gpQuestions]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // --- Analytics & Aggregates ---
  const bpStats = useMemo(() => {
    return calculateAverage(readings);
  }, [readings]);

  const recentReadingInfo = useMemo(() => {
    if (readings.length === 0) return null;
    // Sort descending by date
    const sorted = [...readings].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const latest = sorted[0];
    return {
      reading: latest,
      info: getBPRatingInfo(latest.systolic, latest.diastolic)
    };
  }, [readings]);

  const averageReadingInfo = useMemo(() => {
    if (readings.length === 0) return null;
    return getBPRatingInfo(bpStats.systolic, bpStats.diastolic);
  }, [readings, bpStats]);

  // Chart data formatting (sorted chronological)
  const chartData = useMemo(() => {
    return [...readings]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(r => ({
        date: new Date(r.timestamp).toLocaleDateString('en-AU', { day: '2-digit', month: 'short' }),
        systolic: r.systolic,
        diastolic: r.diastolic,
        pulse: r.heartRate || 70,
        fullDate: new Date(r.timestamp).toLocaleString('en-AU')
      }));
  }, [readings]);

  // --- Action Handlers ---

  // Log blood pressure reading
  const handleAddReading = (e: React.FormEvent) => {
    e.preventDefault();
    setBpFormError('');

    const sys = parseInt(systolicInput);
    const dia = parseInt(diastolicInput);
    const hr = heartRateInput ? parseInt(heartRateInput) : undefined;

    // Strict safety thresholds for inputs to prevent nonsense values
    if (isNaN(sys) || sys < 70 || sys > 260) {
      setBpFormError('Please enter a valid Systolic reading between 70 and 260 mmHg.');
      return;
    }
    if (isNaN(dia) || dia < 40 || dia > 160) {
      setBpFormError('Please enter a valid Diastolic reading between 40 and 160 mmHg.');
      return;
    }
    if (hr !== undefined && (isNaN(hr) || hr < 30 || hr > 220)) {
      setBpFormError('Please enter a valid Heart Rate between 30 and 220 bpm.');
      return;
    }

    const newReading: BPReading = {
      id: Math.random().toString(36).substring(2, 9),
      systolic: sys,
      diastolic: dia,
      heartRate: hr,
      timestamp: new Date().toISOString(),
      notes: notesInput.trim(),
      method: methodInput
    };

    setReadings([newReading, ...readings]);
    setSystolicInput('');
    setDiastolicInput('');
    setHeartRateInput('');
    setNotesInput('');
    setMethodInput('home');

    // Notify user in chat tab if high
    if (sys >= 180 || dia >= 120) {
      const urgentMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'model',
        text: `⚠️ **Emergency Notice**: I noticed you logged an extremely elevated reading of **${sys}/${dia} mmHg**. 
        
According to the National Heart Foundation of Australia, if this reading is accompanied by any of these warning symptoms:
*   Chest pain or heaviness
*   Shortness of breath
*   Severe headache
*   Numbness, weakness, or difficulty speaking
*   Blurry or changed vision

Please call **000** for emergency services immediately. If you have no symptoms, rest quietly for 5 minutes and test again. Please consult your doctor as soon as possible.`,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, urgentMessage]);
    }
  };

  const handleDeleteReading = (id: string) => {
    if (confirm('Are you sure you want to remove this reading?')) {
      setReadings(readings.filter(r => r.id !== id));
    }
  };

  // Toggle habit completed for today or past days
  const handleToggleHabit = (habitId: string, dateStr: string) => {
    setHabits(habits.map(h => {
      if (h.id === habitId) {
        const index = h.completedDays.indexOf(dateStr);
        let updated;
        if (index > -1) {
          updated = h.completedDays.filter(d => d !== dateStr);
        } else {
          updated = [...h.completedDays, dateStr];
        }
        return { ...h, completedDays: updated };
      }
      return h;
    }));
  };

  // Add a custom question for the GP visit
  const handleAddCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestionInput.trim()) return;

    const newQ = {
      id: Math.random().toString(36).substring(2, 9),
      question: customQuestionInput.trim(),
      checked: false
    };

    setGpQuestions([...gpQuestions, newQ]);
    setCustomQuestionInput('');
  };

  // Toggle prepared GP question
  const handleToggleGpQuestion = (id: string) => {
    setGpQuestions(gpQuestions.map(q => q.id === id ? { ...q, checked: !q.checked } : q));
  };

  // Remove GP question
  const handleDeleteGpQuestion = (id: string) => {
    setGpQuestions(gpQuestions.filter(q => q.id !== id));
  };

  // --- Medication Trackers & Streak Calculation ---
  useEffect(() => {
    localStorage.setItem('coach_medications', JSON.stringify(medications));
  }, [medications]);

  const medicationStreak = useMemo(() => {
    if (medications.length === 0) return 0;

    const getRelativeDateStr = (offset: number): string => {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      return d.toISOString().split('T')[0];
    };

    const isDayCompliant = (dateStr: string): boolean => {
      return medications.every(m => m.takenDates.includes(dateStr));
    };

    const todayStr = getRelativeDateStr(0);
    const yesterdayStr = getRelativeDateStr(1);

    let startOffset = 0;
    if (isDayCompliant(todayStr)) {
      startOffset = 0;
    } else if (isDayCompliant(yesterdayStr)) {
      startOffset = 1;
    } else {
      return 0;
    }

    let streak = 0;
    let currentOffset = startOffset;
    
    while (streak < 100) {
      const checkDateStr = getRelativeDateStr(currentOffset);
      if (isDayCompliant(checkDateStr)) {
        streak++;
        currentOffset++;
      } else {
        break;
      }
    }
    
    return streak;
  }, [medications]);

  const handleToggleMedication = (id: string, dateStr: string) => {
    setMedications(prev => prev.map(med => {
      if (med.id !== id) return med;
      const isTaken = med.takenDates.includes(dateStr);
      const newTakenDates = isTaken
        ? med.takenDates.filter(d => d !== dateStr)
        : [...med.takenDates, dateStr];
      return { ...med, takenDates: newTakenDates };
    }));
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    setMedFormError('');
    if (!medNameInput.trim()) {
      setMedFormError('Please enter a medication name.');
      return;
    }
    const newMed: Medication = {
      id: 'med_' + Date.now(),
      name: medNameInput.trim(),
      dosage: medDosageInput.trim() || '1 tablet',
      frequency: medFrequencyInput,
      timeOfDay: medTimeInput,
      takenDates: [],
      reminders: medReminderInput ? [medReminderInput] : []
    };
    setMedications(prev => [...prev, newMed]);
    setMedNameInput('');
    setMedDosageInput('');
    setMedReminderInput('');
  };

  const handleDeleteMedication = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  const handleSaveMissedReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missedDoseSurvey) return;

    const finalReason = selectedMissedReason === 'other' ? customMissedReason.trim() : selectedMissedReason;
    if (!finalReason) return;

    const { medicationName, dateStr } = missedDoseSurvey;
    const formattedDate = new Date(dateStr).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });

    // Format GP Question
    const gpQuestionText = `Discuss with GP: I missed taking my ${medicationName} on ${formattedDate} because I "${finalReason}". What are some good strategies or adjustments we can make to improve my medication adherence?`;

    const newQ = {
      id: 'gp_q_missed_' + Date.now(),
      question: gpQuestionText,
      checked: true // Automatically pre-select the question so it shows up in their printed discussion sheet!
    };

    setGpQuestions(prev => [...prev, newQ]);

    // Close the survey
    setMissedDoseSurvey(null);
    setSelectedMissedReason('');
    setCustomMissedReason('');
  };

  const handleAddReminder = (medId: string, reminderTime: string) => {
    if (!reminderTime) return;
    setMedications(prev => prev.map(med => {
      if (med.id !== medId) return med;
      const currentReminders = med.reminders || [];
      if (currentReminders.includes(reminderTime)) return med;
      return { ...med, reminders: [...currentReminders, reminderTime].sort() };
    }));
  };

  const handleRemoveReminder = (medId: string, reminderTime: string) => {
    setMedications(prev => prev.map(med => {
      if (med.id !== medId) return med;
      const currentReminders = med.reminders || [];
      return { ...med, reminders: currentReminders.filter(r => r !== reminderTime) };
    }));
  };

  // Reset chat history
  const handleResetChat = () => {
    if (confirm('Are you sure you want to clear your chat conversation?')) {
      setChatMessages(INITIAL_CHAT_MESSAGES);
      setChatError('');
    }
  };

  // Clear all logged data
  const handleClearAllData = () => {
    if (confirm('This will delete all logged blood pressure readings, medication tracking, chat history, and lifestyle habit tracking. This cannot be undone. Do you want to proceed?')) {
      setReadings([]);
      setHabits(INITIAL_HABITS.map(h => ({ ...h, completedDays: [] })));
      setMedications([]);
      setChatMessages(INITIAL_CHAT_MESSAGES);
      setGpQuestions(GP_QUESTIONS);
      localStorage.clear();
      alert('Application reset successfully.');
    }
  };

  // --- API Call to Hypertension Care Coach ---
  const handleSendMessage = async (userMsgText: string) => {
    if (!userMsgText.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      text: userMsgText,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);
    setChatError('');

    try {
      // Prepare history to send (limit to last 10 messages for token efficiency)
      const historyToSend = chatMessages
        .slice(-10)
        .map(msg => ({ role: msg.role, text: msg.text }));

      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMsgText,
          history: historyToSend
        })
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'model',
        text: data.reply,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      setChatError('Could not contact the Care Coach. Please check your network and ensure your GEMINI_API_KEY is configured in Settings > Secrets.');
    } finally {
      setIsChatLoading(false);
    }
  };

  // Format date helper
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white antialiased">

      {/* Header */}
      <header className="bg-white border-b border-slate-100 py-4 px-6 sticky top-0 z-40 shadow-xs no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-rose-50 p-2.5 rounded-2xl border border-rose-100 flex items-center justify-center shadow-xs">
              <Heart className="h-6 w-6 text-rose-500 fill-rose-500 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-display font-bold text-slate-950 tracking-tight flex items-center gap-2">
                Hypertension Care Coach
                <span className="text-xs bg-rose-50 text-rose-600 font-sans font-semibold px-2 py-0.5 rounded-full border border-rose-100">
                  AU Guidelines
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-sans">
                Aligning with the National Heart Foundation of Australia guidelines
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Care Coach
            </button>
            <button
              onClick={() => setActiveTab('diary')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 ${
                activeTab === 'diary'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              BP Diary
            </button>
            <button
              onClick={() => setActiveTab('habits')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 ${
                activeTab === 'habits'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
              Routine & Meds
            </button>
            <button
              onClick={() => setActiveTab('gp_prep')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 ${
                activeTab === 'gp_prep'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              GP Prep Guide
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 ${
                activeTab === 'library'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Education
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* Urgent Emergency Callout - Display prominently on relevant panels */}
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-xl shadow-xs no-print">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-900">
                Warning Symptoms: Hypertensive Emergency
              </h4>
              <p className="text-xs text-red-700 mt-1">
                If you have severely high blood pressure AND experience <strong>chest pain, severe headache, shortness of breath, numbness, weakness, slurred speech, or blurred vision</strong>, please call <strong>000</strong> immediately in Australia. Do not drive yourself to the hospital.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Tab Panel */}
        <div className="flex-1 flex flex-col">
          {/* TAB 1: COACH CHAT */}
          {activeTab === 'chat' && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
              {/* Left Column: Preset triggers & disclaimer */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-slate-900 font-display font-bold text-sm">
                    <Stethoscope className="h-4 w-4 text-rose-600" />
                    How to talk to your coach
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Our care coach answers queries using criteria from the National Heart Foundation of Australia. Ask about blood pressure numbers, salt intake, lifestyle advice, and monitoring habits.
                  </p>
                  <hr className="border-slate-100" />
                  <div className="text-xs font-semibold text-slate-700">Quick Questions:</div>
                  <div className="flex flex-col gap-2">
                    {PRESET_CHAT_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        disabled={isChatLoading}
                        className="text-left text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 p-2.5 rounded-lg border border-slate-100 hover:border-rose-100 transition-all cursor-pointer leading-tight"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 shadow-xs flex flex-col gap-3">
                  <div className="flex items-center gap-2 font-display font-bold text-sm text-white">
                    <ShieldAlert className="h-4 w-4 text-amber-400" />
                    Safety Standard
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    This coach does NOT prescribe medications, adjust dosages, or replace GP diagnostics. It is purely designed to help you organize logs, self-manage healthy habits, and explain high blood pressure basics.
                  </p>
                </div>
              </div>

              {/* Right Column: Active Chat Feed */}
              <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col overflow-hidden min-h-[500px] max-h-[650px]">
                {/* Chat header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-semibold text-slate-800">Care Coach AI Support</span>
                  </div>
                  <button
                    onClick={handleResetChat}
                    className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Restart Chat
                  </button>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${
                        msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                      }`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-xs border ${
                          msg.role === 'user'
                            ? 'bg-rose-50 border-rose-100 text-rose-600'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        {msg.role === 'user' ? <User className="h-4 w-4" /> : <Heart className="h-4 w-4 text-rose-500" />}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div
                           className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs whitespace-pre-wrap ${
                            msg.role === 'user'
                              ? 'bg-rose-500 text-white font-medium rounded-tr-none'
                              : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-slate-400 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center animate-pulse">
                        <Heart className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs">
                        <div className="flex gap-1 items-center py-1">
                          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {chatError && (
                    <div className="bg-red-50 border border-red-100 text-red-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{chatError}</span>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Input block */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(chatInput);
                  }}
                  className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question about high blood pressure management (e.g. guidelines on daily salt intake)..."
                    disabled={isChatLoading}
                    className="flex-1 bg-white border border-slate-200 text-xs rounded-xl px-4 py-3 focus:outline-hidden focus:ring-1 focus:ring-rose-500 focus:border-rose-500 text-slate-900 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isChatLoading}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    Send
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: BP DIARY */}
          {activeTab === 'diary' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Form & Statistics */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                
                {/* Form */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
                  <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="h-4.5 w-4.5 text-rose-600" />
                    Log Blood Pressure Reading
                  </h3>

                  <form onSubmit={handleAddReading} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                          Systolic (Top)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            placeholder="e.g. 120"
                            value={systolicInput}
                            onChange={(e) => setSystolicInput(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:ring-1 focus:ring-rose-500 focus:outline-hidden text-slate-900 font-semibold"
                          />
                          <span className="absolute right-3 top-3 text-[10px] text-slate-400">mmHg</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                          Diastolic (Bottom)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            placeholder="e.g. 80"
                            value={diastolicInput}
                            onChange={(e) => setDiastolicInput(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:ring-1 focus:ring-rose-500 focus:outline-hidden text-slate-900 font-semibold"
                          />
                          <span className="absolute right-3 top-3 text-[10px] text-slate-400">mmHg</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                          Heart Rate (Pulse)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Optional"
                            value={heartRateInput}
                            onChange={(e) => setHeartRateInput(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:ring-1 focus:ring-rose-500 focus:outline-hidden text-slate-900 font-semibold"
                          />
                          <span className="absolute right-3 top-3 text-[10px] text-slate-400">bpm</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                          Cuff Location
                        </label>
                        <select
                          value={methodInput}
                          onChange={(e) => setMethodInput(e.target.value as 'home' | 'clinic')}
                          className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:ring-1 focus:ring-rose-500 focus:outline-hidden text-slate-900 font-semibold"
                        >
                          <option value="home">At Home (HBPM)</option>
                          <option value="clinic">GP Clinic</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                        Quick Notes / Context
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. rested for 5m, took meds, feeling calm"
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:ring-1 focus:ring-rose-500 focus:outline-hidden text-slate-900"
                      />
                    </div>

                    {bpFormError && (
                      <div className="text-red-600 bg-red-50 text-xs p-2.5 rounded-xl border border-red-100 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{bpFormError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Save reading in Diary
                    </button>
                  </form>
                </div>

                {/* Statistics panel */}
                {readings.length > 0 && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
                    <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="h-4.5 w-4.5 text-rose-600" />
                      Clinical Summary
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Log Average
                        </span>
                        <div className="text-xl font-display font-extrabold text-slate-900 mt-1">
                          {bpStats.systolic}/{bpStats.diastolic}
                        </div>
                        <span className="text-[10px] text-slate-400">mmHg ({bpStats.count} readings)</span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Recent Category
                        </span>
                        {recentReadingInfo && (
                          <div className={`text-xs font-bold mt-2 ${recentReadingInfo.info.color}`}>
                            {recentReadingInfo.info.label}
                          </div>
                        )}
                      </div>
                    </div>

                    {averageReadingInfo && (
                      <div className={`p-4 rounded-xl border ${averageReadingInfo.bgColor} ${averageReadingInfo.borderColor} text-xs leading-relaxed`}>
                        <div className="font-semibold mb-1 flex items-center gap-1">
                          <Info className="h-3.5 w-3.5 shrink-0" />
                          <span>Average Status: {averageReadingInfo.label}</span>
                        </div>
                        <p className="text-slate-700">{averageReadingInfo.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Chart & Logs Table */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* Recharts graph */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                  <h3 className="text-sm font-display font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Activity className="h-4.5 w-4.5 text-rose-600" />
                    Blood Pressure Trend Chart
                  </h3>

                  {chartData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" />
                          <YAxis domain={[40, 200]} tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" />
                          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} />
                          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                          {/* Heart Foundation Hypertension diagnostic guideline line at 140/90 */}
                          <ReferenceLine y={140} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Hypertension Sys (140)', fill: '#f43f5e', fontSize: 8, position: 'top' }} />
                          <ReferenceLine y={90} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Hypertension Dia (90)', fill: '#f43f5e', fontSize: 8, position: 'top' }} />
                          <Line type="monotone" dataKey="systolic" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Systolic (mmHg)" />
                          <Line type="monotone" dataKey="diastolic" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Diastolic (mmHg)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <Activity className="h-8 w-8 text-slate-300 mb-2" />
                      <p className="text-xs text-slate-500">No blood pressure readings logged yet.</p>
                    </div>
                  )}
                </div>

                {/* Log Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                  <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                      <ClipboardList className="h-4.5 w-4.5 text-rose-600" />
                      Historical Diary Logs
                    </h3>
                    <span className="text-[10px] text-slate-500 font-semibold">{readings.length} entries total</span>
                  </div>

                  {readings.length > 0 ? (
                    <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                            <th className="py-3 px-4 font-semibold">Date & Time</th>
                            <th className="py-3 px-4 font-semibold text-center">Reading (mmHg)</th>
                            <th className="py-3 px-4 font-semibold text-center">Pulse (bpm)</th>
                            <th className="py-3 px-4 font-semibold">Classification</th>
                            <th className="py-3 px-4 font-semibold">Notes</th>
                            <th className="py-3 px-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {readings.map((r) => {
                            const info = getBPRatingInfo(r.systolic, r.diastolic);
                            return (
                              <tr key={r.id} className="hover:bg-slate-50/50 transition-all">
                                <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                                  {formatDate(r.timestamp)}
                                  <span className="ml-2 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm text-[9px] font-semibold uppercase">
                                    {r.method}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center font-display font-bold text-slate-900 text-sm">
                                  {r.systolic}/{r.diastolic}
                                </td>
                                <td className="py-3 px-4 text-center text-slate-600 font-mono">
                                  {r.heartRate || '—'}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${info.bgColor} ${info.color} border ${info.borderColor}`}>
                                    {info.label}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-slate-600 max-w-[150px] truncate" title={r.notes}>
                                  {r.notes || '—'}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button
                                    onClick={() => handleDeleteReading(r.id)}
                                    className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-all cursor-pointer"
                                    title="Delete reading"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
                      <Heart className="h-10 w-10 text-slate-200 mb-2" />
                      No logs recorded yet. Start logging above.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ROUTINE & MEDS TRACKER */}
          {activeTab === 'habits' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Left Column: Streaks, Prescriptions & Add Medication Form */}
              <div className="xl:col-span-1 flex flex-col gap-6">
                
                {/* Streak Counter Card */}
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                      <Flame className="h-5 w-5 text-rose-600 animate-pulse" />
                      Medication Compliance
                    </h3>
                    <span className="text-xs bg-rose-100/50 text-rose-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Daily routine
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-display font-extrabold text-rose-600">
                      {medicationStreak}
                    </span>
                    <span className="text-sm font-semibold text-rose-800">
                      day streak
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {medicationStreak > 0 ? (
                      <span>Excellent effort! You have taken all your prescribed medications for <strong>{medicationStreak}</strong> consecutive {medicationStreak === 1 ? 'day' : 'days'}. Keep this streak alive to maintain stable, healthy blood pressure levels.</span>
                    ) : (
                      <span>No current streak. Record your medication doses for today or yesterday to start your streak! A single missed day will reset the counter to 0.</span>
                    )}
                  </p>

                  <div className="bg-white/60 p-3 rounded-xl border border-rose-100/50 text-[11px] text-rose-900 leading-normal">
                    <span className="font-bold">Streak Rule:</span> Your compliance streak resets to 0 if you forget or fail to take any of your active medications on any day. Consistency is key!
                  </div>
                </div>

                {/* Add Medication Form */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
                  <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="h-4.5 w-4.5 text-rose-600" />
                    Add New Medication
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add blood pressure or cardiovascular medications as prescribed by your GP.
                  </p>

                  <form onSubmit={handleAddMedication} className="flex flex-col gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Medication Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Perindopril, Ramipril, Amlodipine"
                        value={medNameInput}
                        onChange={(e) => setMedNameInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:ring-1 focus:ring-rose-500 focus:outline-hidden text-slate-900 font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Dosage *</label>
                        <input
                          type="text"
                          placeholder="e.g. 5mg, 1 tablet"
                          value={medDosageInput}
                          onChange={(e) => setMedDosageInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:ring-1 focus:ring-rose-500 focus:outline-hidden text-slate-900 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Frequency</label>
                        <select
                          value={medFrequencyInput}
                          onChange={(e) => setMedFrequencyInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:ring-1 focus:ring-rose-500 focus:outline-hidden text-slate-900 font-semibold"
                        >
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily</option>
                          <option value="Thrice daily">Thrice daily</option>
                          <option value="As required">As required</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Best Taken At</label>
                        <select
                          value={medTimeInput}
                          onChange={(e) => setMedTimeInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:ring-1 focus:ring-rose-500 focus:outline-hidden text-slate-900 font-semibold"
                        >
                          <option value="Morning">Morning (Breakfast)</option>
                          <option value="Evening">Evening (Dinner)</option>
                          <option value="Night">Night (Bedtime)</option>
                          <option value="Anytime">Anytime / General</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Reminder Time</label>
                        <input
                          type="time"
                          value={medReminderInput}
                          onChange={(e) => setMedReminderInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 focus:ring-1 focus:ring-rose-500 focus:outline-hidden text-slate-900 font-semibold"
                        />
                      </div>
                    </div>

                    {medFormError && (
                      <div className="text-red-600 bg-red-50 text-xs p-2.5 rounded-xl border border-red-100 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{medFormError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Add to Prescriptions
                    </button>
                  </form>
                </div>

                {/* My Medications & Reminders List */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
                  <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                    <Pill className="h-4.5 w-4.5 text-rose-600" />
                    Prescriptions & Daily Reminders ({medications.length})
                  </h3>

                  {medications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No medications in your profile. Add medications on the form above to configure reminders.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3.5">
                      {medications.map((med) => (
                        <div key={med.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <div className="bg-rose-50 border border-rose-100 p-2 rounded-lg text-rose-600 mt-0.5">
                                <Pill className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-900">{med.name}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Dosage: {med.dosage}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{med.frequency} ({med.timeOfDay})</div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleDeleteMedication(med.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                              title="Remove medication"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Reminders section for this medication */}
                          <div className="border-t border-slate-100/70 pt-2.5 flex flex-col gap-2">
                            <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                              <Bell className="h-3 w-3 text-rose-500 animate-pulse" />
                              Active Reminders
                            </div>

                            {/* List of active reminders */}
                            <div className="flex flex-wrap gap-1.5">
                              {med.reminders && med.reminders.length > 0 ? (
                                med.reminders.map((rem) => (
                                  <span key={rem} className="bg-rose-50 text-rose-700 border border-rose-100/50 rounded-lg py-0.5 pl-2 pr-1 text-[10px] font-semibold flex items-center gap-1 shadow-xs">
                                    {formatTime(rem)}
                                    <button
                                      onClick={() => handleRemoveReminder(med.id, rem)}
                                      className="p-0.5 rounded-md text-rose-400 hover:text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
                                      title="Remove reminder"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">No reminders set</span>
                              )}
                            </div>

                            {/* Add reminder mini form */}
                            <div className="flex gap-1.5 mt-1">
                              <input
                                type="time"
                                id={`reminder-time-${med.id}`}
                                value={newReminderTimes[med.id] || ''}
                                onChange={(e) => setNewReminderTimes(prev => ({ ...prev, [med.id]: e.target.value }))}
                                className="flex-1 bg-white border border-slate-200 text-[10px] rounded-lg p-1.5 focus:ring-1 focus:ring-rose-500 focus:outline-hidden text-slate-900 font-medium"
                              />
                              <button
                                onClick={() => {
                                  const val = newReminderTimes[med.id];
                                  if (val) {
                                    handleAddReminder(med.id, val);
                                    setNewReminderTimes(prev => ({ ...prev, [med.id]: '' }));
                                  }
                                }}
                                className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="h-3 w-3" />
                                Add Reminder
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 mt-2 leading-relaxed flex items-start gap-2.5">
                    <Info className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Australian Adherence Guideline:</span> 
                      {' '}To establish a perfect daily habit, link taking your medication to a daily ritual, such as brushing your teeth or eating breakfast. Never adjust your dosage without consulting your prescribing doctor or GP.
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Checklists & Guidance (lifestyle + medications trackers) */}
              <div className="xl:col-span-2 flex flex-col gap-6">
                
                {/* Introduction Card (Lifestyle Guidelines explanation) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
                  <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-3">
                    <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                      <HeartPulse className="h-5 w-5 text-rose-600 animate-pulse" />
                      Australian Guidelines Lifestyle & Medication Routine
                    </h3>
                    <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-100 font-bold px-2 py-0.5 rounded-full">
                      Heart Foundation Standards
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    The National Heart Foundation of Australia highly recommends implementing specific lifestyle adjustments in combination with any prescribed medical regimens to optimize blood pressure management. Use these checklists to track your past 3 days of healthy habits and medications.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs flex flex-col gap-1.5">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Healthy Lifestyle Habits
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Sodium restriction, physical activity, and stress management are highly effective and can lower blood pressure by 5-10 mmHg!
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs flex flex-col gap-1.5">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <Pill className="h-4 w-4 text-rose-600" />
                        Medication Compliance
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Taking medications exactly as prescribed reduces risk of heart attack, stroke, and kidney failure. Active reminders help you stay on schedule!
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1. Medication Checklist (Past 3 Days Tracker) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="h-4.5 w-4.5 text-rose-600" />
                      Medication Tracker Checklist (Past 3 Days)
                    </h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2.5 py-0.5 rounded-full">
                      Medication Adherence
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    Check off each medication you took on these days. Staying fully compliant is essential for cardiovascular health.
                  </p>

                  {medications.length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                      <Pill className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      No prescribed medications listed yet. Add a medication on the left panel to start tracking your daily doses!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {medications.map((med) => {
                        const dates = getPastDates(3);
                        const takenCount = dates.filter(d => med.takenDates.includes(d)).length;
                        return (
                          <div key={med.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/35 transition-all">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                                  {med.name} <span className="text-slate-400 font-normal lowercase">({med.dosage})</span>
                                </h4>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[10px] text-slate-500 font-medium">
                                  <span>{med.frequency} • {med.timeOfDay} schedule</span>
                                  {med.reminders && med.reminders.length > 0 && (
                                    <span className="flex items-center gap-1 text-rose-600 font-bold bg-rose-50/50 px-1.5 py-0.5 rounded border border-rose-100/50">
                                      <Bell className="h-2.5 w-2.5" />
                                      Reminders: {med.reminders.map(formatTime).join(', ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                                  takenCount === 3
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}>
                                  Taken {takenCount}/3 days ({Math.round((takenCount/3)*100)}%)
                                </span>
                              </div>
                            </div>

                            {/* Checklist columns */}
                            <div className="grid grid-cols-3 gap-2">
                              {dates.map((dateStr) => {
                                const isTaken = med.takenDates.includes(dateStr);
                                const formattedDay = new Date(dateStr).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric' });
                                return (
                                  <div key={dateStr} className="flex flex-col gap-1">
                                    <button
                                      onClick={() => handleToggleMedication(med.id, dateStr)}
                                      className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                                        isTaken
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium shadow-xs'
                                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                      }`}
                                    >
                                      <span className="truncate">{formattedDay}</span>
                                      <div className={`h-4.5 w-4.5 rounded-md flex items-center justify-center border transition-all ${
                                        isTaken
                                          ? 'bg-emerald-500 border-emerald-600 text-white'
                                          : 'border-slate-300 bg-slate-50'
                                      }`}>
                                        {isTaken && <Check className="h-3 w-3 stroke-[3]" />}
                                      </div>
                                    </button>

                                    {!isTaken && (
                                      <button
                                        onClick={() => {
                                          setMissedDoseSurvey({
                                            medicationId: med.id,
                                            medicationName: med.name,
                                            dateStr
                                          });
                                          setSelectedMissedReason('');
                                          setCustomMissedReason('');
                                        }}
                                        className="text-[9px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-0.5 justify-center mt-0.5 hover:underline bg-rose-50/50 py-1 px-1.5 rounded border border-rose-100/45 cursor-pointer transition-all"
                                        title="Click to log why you missed this dose for your GP report"
                                      >
                                        <AlertTriangle className="h-2.5 w-2.5 text-rose-500 shrink-0" />
                                        Log Missed
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Habits Tracker Checklist */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="h-4.5 w-4.5 text-rose-600" />
                      Lifestyle Habits Checklist (Past 3 Days)
                    </h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2.5 py-0.5 rounded-full">
                      Daily Goals
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    Check off each of the lifestyle changes you implemented. Heart Foundation guidelines show significant long-term blood pressure benefits from these choices.
                  </p>

                  <div className="space-y-6">
                    {habits.map((h) => {
                      const dates = getPastDates(3);
                      const completedInPeriod = dates.filter(d => h.completedDays.includes(d)).length;
                      const completionRate = Math.round((completedInPeriod / 3) * 100);

                      return (
                        <div key={h.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/35 transition-all">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                                {h.title}
                              </h4>
                              <p className="text-xs text-slate-500 mt-1">{h.goalText}</p>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-md">
                                {completedInPeriod}/3 days ({completionRate}%)
                              </span>
                            </div>
                          </div>

                          {/* Checklist boxes for past 3 days */}
                          <div className="grid grid-cols-3 gap-2">
                            {dates.map((dateStr) => {
                              const isCompleted = h.completedDays.includes(dateStr);
                              const formattedDay = new Date(dateStr).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric' });
                              return (
                                <button
                                  key={dateStr}
                                  onClick={() => handleToggleHabit(h.id, dateStr)}
                                  className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                                    isCompleted
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  <span>{formattedDay}</span>
                                  <div className={`h-4 w-4 rounded-md flex items-center justify-center border ${
                                    isCompleted
                                      ? 'bg-emerald-500 border-emerald-600 text-white'
                                      : 'border-slate-300'
                                  }}`}>
                                    {isCompleted && <Check className="h-3 w-3 stroke-[3]" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: GP DISCUSSION PREPARATION GUIDE */}
          {activeTab === 'gp_prep' && (
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-6">
              
              <div className="flex flex-col md:flex-row items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-lg font-display font-bold text-slate-950 flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-rose-600 animate-pulse" />
                    Doctor's Visit Discussion Guide
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Prepare for your next GP appointment by review-summarizing your blood pressure logs and printing this clinical sheet.
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer no-print"
                >
                  <Printer className="h-4 w-4" />
                  Print Discussion Sheet
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Printable Left Column: Readings summary & Stats */}
                <div className="lg:col-span-1 bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col gap-4">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-4.5 w-4.5 text-rose-600" />
                    Blood Pressure Record Summary
                  </div>

                  {readings.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-100 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Log Average BP
                        </span>
                        <div className="text-2xl font-display font-extrabold text-slate-900 mt-1">
                          {bpStats.systolic}/{bpStats.diastolic}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          Based on {bpStats.count} home/clinic readings
                        </span>
                      </div>

                      {recentReadingInfo && (
                        <div className="bg-white p-3.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Latest Reading:
                          </span>
                          <div className="text-lg font-bold text-slate-900">
                            {recentReadingInfo.reading.systolic}/{recentReadingInfo.reading.diastolic} mmHg
                          </div>
                          <span className={`inline-block mt-1 text-[10px] font-bold ${recentReadingInfo.info.color}`}>
                            {recentReadingInfo.info.label}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-1">
                            Logged on {formatDate(recentReadingInfo.reading.timestamp)}
                          </span>
                        </div>
                      )}

                      <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs">
                        <span className="font-semibold block text-slate-800 mb-1">Lifestyle Habits Tracked:</span>
                        <ul className="space-y-1 text-slate-600">
                          {habits.map(h => (
                            <li key={h.id} className="flex justify-between">
                              <span>{h.title}:</span>
                              <span className="font-bold">{h.completedDays.length} completions</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {medications.length > 0 && (
                        <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs">
                          <span className="font-semibold block text-slate-800 mb-1">Prescribed Medications:</span>
                          <ul className="space-y-1 text-slate-600">
                            {medications.map(m => (
                              <li key={m.id} className="flex justify-between text-[11px]">
                                <span>{m.name} ({m.dosage}):</span>
                                <span className="font-bold text-rose-600">{m.frequency}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-2 text-[10px] text-slate-500 border-t border-slate-100 pt-1.5 flex justify-between">
                            <span>Compliance Streak:</span>
                            <span className="font-bold text-rose-600">{medicationStreak} days</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs py-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
                      No readings logged yet. Add readings in the BP Diary tab to populate this sheet.
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 leading-relaxed italic border-t border-slate-200 pt-3">
                    Approved Australian Guidelines advise checking your home device against clinic readings periodically. Take this sheet to your doctor.
                  </p>
                </div>

                {/* Right Column: Interactive Question Builder */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ClipboardList className="h-4.5 w-4.5 text-rose-600" />
                    Questions to ask your Healthcare Professional
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Select prepared questions you wish to review during your GP appointment, or add customized queries below.
                  </p>

                  <form onSubmit={handleAddCustomQuestion} className="flex gap-2 no-print">
                    <input
                      type="text"
                      placeholder="Type a custom question for your doctor (e.g., 'Can I do high-intensity cycling?')..."
                      value={customQuestionInput}
                      onChange={(e) => setCustomQuestionInput(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-xl px-4 py-3 focus:outline-hidden focus:ring-1 focus:ring-rose-500 text-slate-900"
                    />
                    <button
                      type="submit"
                      className="bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs px-4 py-3 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Add Question
                    </button>
                  </form>

                  <div className="flex flex-col gap-2.5">
                    {gpQuestions.map((q) => (
                      <div
                        key={q.id}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                          q.checked
                            ? 'bg-rose-50/50 border-rose-100 text-slate-700'
                            : 'bg-white border-slate-100 text-slate-800'
                        }`}
                      >
                        <button
                          onClick={() => handleToggleGpQuestion(q.id)}
                          className={`mt-0.5 h-4.5 w-4.5 rounded-full shrink-0 flex items-center justify-center border transition-all cursor-pointer ${
                            q.checked
                              ? 'bg-rose-500 border-rose-600 text-white'
                              : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                          }`}
                        >
                          {q.checked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </button>
                        
                        <div className="flex-1 text-xs font-semibold leading-relaxed">
                          {q.question}
                        </div>

                        <button
                          onClick={() => handleDeleteGpQuestion(q.id)}
                          className="text-slate-300 hover:text-red-500 hover:bg-slate-50 p-1 rounded-md transition-all cursor-pointer no-print"
                          title="Remove question"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Printable-only view layout at the end */}
              <div className="hidden print-only text-xs mt-12 border-t border-slate-300 pt-6">
                <div className="text-center font-bold text-sm mb-4">Patient Self-Measurement Summary Report</div>
                <div className="grid grid-cols-2 gap-4 border border-slate-300 p-4 rounded-xl mb-6">
                  <div><strong>Prepared for:</strong> Healthcare Team / GP Consultation</div>
                  <div className="text-right"><strong>Printed on:</strong> {new Date().toLocaleDateString('en-AU')}</div>
                </div>
                
                <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">Blood Pressure Readings History</h4>
                <table className="w-full text-left border-collapse border border-slate-300 mb-6">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-2">Date</th>
                      <th className="border border-slate-300 p-2 text-center">Reading (mmHg)</th>
                      <th className="border border-slate-300 p-2 text-center">Pulse (bpm)</th>
                      <th className="border border-slate-300 p-2">Method</th>
                      <th className="border border-slate-300 p-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readings.map(r => (
                      <tr key={r.id}>
                        <td className="border border-slate-300 p-2">{formatDate(r.timestamp)}</td>
                        <td className="border border-slate-300 p-2 text-center font-bold">{r.systolic}/{r.diastolic}</td>
                        <td className="border border-slate-300 p-2 text-center">{r.heartRate || '—'}</td>
                        <td className="border border-slate-300 p-2">{r.method === 'home' ? 'Home' : 'Clinic'}</td>
                        <td className="border border-slate-300 p-2">{r.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">Selected Discussion Questions</h4>
                <ul className="list-disc pl-5 space-y-1 mb-6">
                  {gpQuestions.filter(q => q.checked).map(q => (
                    <li key={q.id} className="font-medium">{q.question}</li>
                  ))}
                  {gpQuestions.filter(q => q.checked).length === 0 && (
                    <li className="text-slate-400 italic">No specific questions selected.</li>
                  )}
                </ul>

                <div className="text-[10px] text-slate-500 italic mt-6 border-t border-slate-200 pt-3">
                  This report is generated by the patient using the Hypertension Care Coach, in accordance with educational standards derived from the National Heart Foundation of Australia.
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: APPROVED EDUCATION HUB */}
          {activeTab === 'library' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: List of Guidelines Topics */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* Emergency Stroke F.A.S.T warning callout */}
                <div className="bg-red-600 text-white p-6 rounded-2xl shadow-xs border border-red-700">
                  <div className="flex gap-4">
                    <ShieldAlert className="h-10 w-10 shrink-0 text-white animate-pulse" />
                    <div>
                      <h3 className="text-base font-display font-bold">EMERGENCY ACTION PLAN: F.A.S.T.</h3>
                      <p className="text-xs text-red-100 mt-1 leading-relaxed">
                        Stroke is a critical medical emergency. Act quickly if you notice any of these signs:
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
                        <div className="bg-red-700/50 p-2 rounded-xl border border-red-500/20">
                          <strong className="block text-red-200 text-[10px] uppercase tracking-wide">F - Face</strong>
                          <span className="text-xs">Has their mouth drooped?</span>
                        </div>
                        <div className="bg-red-700/50 p-2 rounded-xl border border-red-500/20">
                          <strong className="block text-red-200 text-[10px] uppercase tracking-wide">A - Arms</strong>
                          <span className="text-xs">Can they lift both arms?</span>
                        </div>
                        <div className="bg-red-700/50 p-2 rounded-xl border border-red-500/20">
                          <strong className="block text-red-200 text-[10px] uppercase tracking-wide">S - Speech</strong>
                          <span className="text-xs">Is their speech slurred?</span>
                        </div>
                        <div className="bg-red-700/50 p-2 rounded-xl border border-red-500/20">
                          <strong className="block text-red-200 text-[10px] uppercase tracking-wide">T - Time</strong>
                          <span className="text-xs font-bold text-amber-300">Call 000 immediately!</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Topics Expandable */}
                <div className="space-y-4">
                  {EDUCATIONAL_TOPICS.map((topic) => (
                    <div key={topic.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
                      <h4 className="text-sm font-display font-extrabold text-slate-900 border-b border-slate-50 pb-2">
                        {topic.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold italic">
                        {topic.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {topic.details.map((detail, idx) => (
                          <div key={idx} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                            <h5 className="text-xs font-bold text-slate-900 mb-1">
                              {detail.title}
                            </h5>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {detail.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Guidelines FAQs */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                
                {/* Guidelines BP Table Summary */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <Heart className="h-4 w-4 text-rose-600" />
                    Australian BP Classifications
                  </div>
                  
                  <div className="space-y-2">
                    {Object.values(BP_CLASSES).slice(0, 6).map((c) => (
                      <div key={c.category} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-slate-50/20 text-xs">
                        <span className="font-semibold text-slate-800">{c.label}</span>
                        <span className={`font-mono font-bold px-2 py-0.5 rounded-sm ${c.bgColor} ${c.color} text-[10px]`}>
                          {c.rangeSystolic} / {c.rangeDiastolic}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 italic mt-3 text-center leading-relaxed">
                    Source: National Heart Foundation of Australia reference chart standards.
                  </p>
                </div>

                {/* FAQs */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
                  <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                    <Info className="h-4.5 w-4.5 text-rose-600 animate-pulse" />
                    Frequently Asked Questions
                  </h3>

                  <div className="divide-y divide-slate-100">
                    {FAQS.map((faq) => (
                      <div key={faq.id} className="py-4 first:pt-0 last:pb-0">
                        <h4 className="text-xs font-bold text-slate-950 mb-1.5 flex items-start gap-1">
                          <ChevronRight className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span>{faq.question}</span>
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed pl-4.5">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

        {/* Clinical Disclaimer - Placed prominently at the bottom of the page */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 text-xs text-slate-600 no-print">
            <div className="flex items-center gap-2 text-rose-800 font-bold mb-2">
              <ShieldAlert className="h-4.5 w-4.5 text-rose-600 shrink-0" />
              <span>CLINICAL DISCLAIMER & USE LIMITATIONS</span>
            </div>
            <p className="leading-relaxed">
              <strong>Please Note:</strong> {MEDICAL_DISCLAIMER}
            </p>
          </div>
        </div>

        {/* Global Reset Option in Footer */}
        <div className="mt-4 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 no-print">
          <div>
            © 2026 Hypertension Care Coach. Education platform aligned with National Heart Foundation of Australia standards.
          </div>
          <button
            onClick={handleClearAllData}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 hover:border-red-200 transition-all cursor-pointer"
          >
            Reset All Application Data
          </button>
        </div>

      </main>

      {/* Missed Dose Survey Modal */}
      {missedDoseSurvey && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 no-print animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-rose-950 text-white p-5 flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-rose-800/60 p-2 rounded-xl text-rose-200">
                  <Pill className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold">Log Missed Medication</h3>
                  <p className="text-[10px] text-rose-200 mt-0.5 font-medium">Adherence & Doctor Report Helper</p>
                </div>
              </div>
              <button
                onClick={() => setMissedDoseSurvey(null)}
                className="text-rose-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveMissedReason} className="p-6 flex flex-col gap-4">
              <div className="text-xs text-slate-600 leading-relaxed">
                You are logging a missed dose for <strong className="text-slate-900">{missedDoseSurvey.medicationName}</strong> on{' '}
                <strong className="text-slate-900">
                  {new Date(missedDoseSurvey.dateStr).toLocaleDateString('en-AU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short'
                  })}
                </strong>.
              </div>

              <div className="flex flex-col gap-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Why did you miss this medication?
                </label>
                
                <div className="space-y-2">
                  {[
                    { value: 'Simply forgot to take it', label: 'I simply forgot' },
                    { value: 'Fear of side effects', label: 'Fear of side effects' },
                    { value: 'Lack of support', label: 'Lack of support' },
                    { value: 'Lack of any benefits from the medication', label: 'Lack of any benefits from the medication' },
                    { value: 'Was away from home or too busy', label: 'Away from home or busy' },
                    { value: 'Felt better and did not think I needed it', label: "Felt better / didn't need it" },
                    { value: 'other', label: 'Other reason (explain below)' }
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        selectedMissedReason === opt.value
                          ? 'bg-rose-50/70 border-rose-200 text-rose-900 shadow-xs'
                          : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="missed_reason"
                        value={opt.value}
                        checked={selectedMissedReason === opt.value}
                        onChange={(e) => setSelectedMissedReason(e.target.value)}
                        className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-slate-300"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {selectedMissedReason === 'other' && (
                <div className="flex flex-col gap-1 animate-fade-in">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Please specify your reason:
                  </label>
                  <textarea
                    value={customMissedReason}
                    onChange={(e) => setCustomMissedReason(e.target.value)}
                    placeholder="Type your reason here..."
                    required
                    maxLength={100}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-hidden focus:ring-1 focus:ring-rose-500 text-slate-900"
                  />
                </div>
              )}

              {/* Australian Heart Foundation warning callout */}
              <div className="bg-amber-50/60 border border-amber-100/60 rounded-xl p-3.5 text-[11px] text-slate-600 flex items-start gap-2.5">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-800">Heart Foundation Precaution:</strong> Never stop or skip taking your blood pressure medication without talking with your GP first. Your GP can help you manage side effects safely or switch you to a more suitable alternative.
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center gap-2 border-t border-slate-100 pt-4 mt-1">
                <button
                  type="button"
                  onClick={() => setMissedDoseSurvey(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-3 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedMissedReason || (selectedMissedReason === 'other' && !customMissedReason.trim())}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs px-4 py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ClipboardList className="h-4 w-4" />
                  Save & Add to GP List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
