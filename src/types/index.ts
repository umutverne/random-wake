// Alarm Types
export type TaskType = 'math' | 'typing' | 'sequence' | 'shake';

export type DifficultyLevel = 1 | 2 | 3;

// Sound ID options - 'random' means pick randomly each time
export type AlarmSoundId = 'classic' | 'digital' | 'gentle' | 'morning' | 'bell' | 'beep' | 'chime' | 'rooster' | 'random';

export interface Alarm {
  id: string;
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
  repeatDays: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  taskType: TaskType;
  soundUri: string | null; // deprecated - use soundId instead
  soundId: AlarmSoundId; // 'random' = pick randomly, or specific sound ID
  isEnabled: boolean;
  label: string;
  createdAt: number;
  updatedAt: number;
}

export interface ScheduledAlarm {
  alarmId: string;
  scheduledTime: Date;
  notificationId: string;
}

// Task Types
export interface MathTask {
  type: 'math';
  question: string;
  answer: number;
  difficulty: DifficultyLevel;
}

export interface TypingTask {
  type: 'typing';
  text: string;
  difficulty: DifficultyLevel;
}

export interface SequenceTask {
  type: 'sequence';
  sequence: string;
  difficulty: DifficultyLevel;
}

export interface ShakeTask {
  type: 'shake';
  requiredShakes: number;
  difficulty: DifficultyLevel;
}

export type Task = MathTask | TypingTask | SequenceTask | ShakeTask;

// Stats Types
export interface AlarmStats {
  id: string;
  alarmId: string;
  date: string; // "YYYY-MM-DD" format
  scheduledTime: string;
  actualWakeTime: string | null;
  snoozeCount: number;
  taskAttempts: number;
  completed: boolean;
  taskType: TaskType;
}

export interface WeeklyStats {
  weekStart: string;
  totalAlarms: number;
  completedAlarms: number;
  averageSnoozeCount: number;
  currentStreak: number;
}

// Settings Types
export type ThemeMode = 'dark' | 'light';
export type Language = 'tr' | 'en';

export interface Settings {
  theme: ThemeMode;
  language: Language;
  defaultTaskType: TaskType;
  defaultSoundUri: string | null;
  vibrationEnabled: boolean;
  gradualVolumeEnabled: boolean;
}

// Navigation Types
export type RootStackParamList = {
  '(tabs)': undefined;
  'alarm/create': undefined;
  'alarm/[id]': { id: string };
  'alarm/ring': { alarmId: string };
  'task/math': { alarmId: string; snoozeCount: number };
  'task/typing': { alarmId: string; snoozeCount: number };
  'task/sequence': { alarmId: string; snoozeCount: number };
  'task/shake': { alarmId: string; snoozeCount: number };
};
