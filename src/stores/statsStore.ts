import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { format, startOfWeek, endOfWeek, isWithinInterval, subDays } from 'date-fns';
import type { AlarmStats, DifficultyLevel, TaskType } from '../types';

interface StatsState {
  stats: AlarmStats[];
  currentDifficulty: DifficultyLevel;
  currentStreak: number;
  bestStreak: number;

  // Actions
  recordAlarmStart: (alarmId: string, taskType: TaskType) => string;
  recordAlarmComplete: (statsId: string, snoozeCount: number, taskAttempts: number) => void;
  recordSnooze: (statsId: string) => void;

  // Getters
  getWeeklyStats: () => {
    totalAlarms: number;
    completedAlarms: number;
    averageSnoozeCount: number;
    successRate: number;
  };
  getMonthlyStats: () => {
    totalAlarms: number;
    completedAlarms: number;
    averageSnoozeCount: number;
    successRate: number;
  };
  getTodayStats: () => AlarmStats[];

  // Difficulty calculation
  updateDifficulty: () => void;
}

const calculateStreak = (stats: AlarmStats[]): number => {
  if (stats.length === 0) return 0;

  const sortedStats = [...stats]
    .filter((s) => s.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedStats.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const hasCompletedAlarm = sortedStats.some((s) => s.date === dateStr);

    if (hasCompletedAlarm) {
      streak++;
    } else if (i > 0) {
      // Allow current day to be incomplete
      break;
    }

    currentDate = subDays(currentDate, 1);
  }

  return streak;
};

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      stats: [],
      currentDifficulty: 1,
      currentStreak: 0,
      bestStreak: 0,

      recordAlarmStart: (alarmId, taskType) => {
        const id = Crypto.randomUUID();
        const now = new Date();
        const newStats: AlarmStats = {
          id,
          alarmId,
          date: format(now, 'yyyy-MM-dd'),
          scheduledTime: format(now, 'HH:mm'),
          actualWakeTime: null,
          snoozeCount: 0,
          taskAttempts: 0,
          completed: false,
          taskType,
        };

        set((state) => ({
          stats: [...state.stats, newStats],
        }));

        return id;
      },

      recordAlarmComplete: (statsId, snoozeCount, taskAttempts) => {
        const now = new Date();

        set((state) => {
          const updatedStats = state.stats.map((s) =>
            s.id === statsId
              ? {
                  ...s,
                  actualWakeTime: format(now, 'HH:mm'),
                  snoozeCount,
                  taskAttempts,
                  completed: true,
                }
              : s
          );

          const newStreak = calculateStreak(updatedStats);
          const newBestStreak = Math.max(state.bestStreak, newStreak);

          return {
            stats: updatedStats,
            currentStreak: newStreak,
            bestStreak: newBestStreak,
          };
        });

        // Update difficulty after completion
        get().updateDifficulty();
      },

      recordSnooze: (statsId) => {
        set((state) => ({
          stats: state.stats.map((s) =>
            s.id === statsId ? { ...s, snoozeCount: s.snoozeCount + 1 } : s
          ),
        }));
      },

      getWeeklyStats: () => {
        const stats = get().stats;
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

        const weeklyStats = stats.filter((s) =>
          isWithinInterval(new Date(s.date), { start: weekStart, end: weekEnd })
        );

        const totalAlarms = weeklyStats.length;
        const completedAlarms = weeklyStats.filter((s) => s.completed).length;
        const totalSnooze = weeklyStats.reduce((sum, s) => sum + s.snoozeCount, 0);

        return {
          totalAlarms,
          completedAlarms,
          averageSnoozeCount: totalAlarms > 0 ? totalSnooze / totalAlarms : 0,
          successRate: totalAlarms > 0 ? (completedAlarms / totalAlarms) * 100 : 0,
        };
      },

      getMonthlyStats: () => {
        const stats = get().stats;
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const monthlyStats = stats.filter((s) =>
          isWithinInterval(new Date(s.date), { start: monthStart, end: monthEnd })
        );

        const totalAlarms = monthlyStats.length;
        const completedAlarms = monthlyStats.filter((s) => s.completed).length;
        const totalSnooze = monthlyStats.reduce((sum, s) => sum + s.snoozeCount, 0);

        return {
          totalAlarms,
          completedAlarms,
          averageSnoozeCount: totalAlarms > 0 ? totalSnooze / totalAlarms : 0,
          successRate: totalAlarms > 0 ? (completedAlarms / totalAlarms) * 100 : 0,
        };
      },

      getTodayStats: () => {
        const stats = get().stats;
        const today = format(new Date(), 'yyyy-MM-dd');
        return stats.filter((s) => s.date === today);
      },

      updateDifficulty: () => {
        const weeklyStats = get().getWeeklyStats();
        const avgSnooze = weeklyStats.averageSnoozeCount;

        let newDifficulty: DifficultyLevel = 1;

        if (avgSnooze >= 4) {
          newDifficulty = 3; // Hard
        } else if (avgSnooze >= 2) {
          newDifficulty = 2; // Medium
        } else {
          newDifficulty = 1; // Easy
        }

        set({ currentDifficulty: newDifficulty });
      },
    }),
    {
      name: 'stats-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
