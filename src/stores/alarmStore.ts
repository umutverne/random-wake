import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import type { Alarm, TaskType, AlarmSoundId } from '../types';

interface AlarmState {
  alarms: Alarm[];
  addAlarm: (alarm: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateAlarm: (id: string, updates: Partial<Omit<Alarm, 'id' | 'createdAt'>>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  getAlarm: (id: string) => Alarm | undefined;
  getActiveAlarms: () => Alarm[];
}

export const useAlarmStore = create<AlarmState>()(
  persist(
    (set, get) => ({
      alarms: [],

      addAlarm: (alarmData) => {
        const id = Crypto.randomUUID();
        const now = Date.now();
        const newAlarm: Alarm = {
          ...alarmData,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          alarms: [...state.alarms, newAlarm],
        }));

        return id;
      },

      updateAlarm: (id, updates) => {
        set((state) => ({
          alarms: state.alarms.map((alarm) =>
            alarm.id === id
              ? { ...alarm, ...updates, updatedAt: Date.now() }
              : alarm
          ),
        }));
      },

      deleteAlarm: (id) => {
        set((state) => ({
          alarms: state.alarms.filter((alarm) => alarm.id !== id),
        }));
      },

      toggleAlarm: (id) => {
        set((state) => ({
          alarms: state.alarms.map((alarm) =>
            alarm.id === id
              ? { ...alarm, isEnabled: !alarm.isEnabled, updatedAt: Date.now() }
              : alarm
          ),
        }));
      },

      getAlarm: (id) => {
        return get().alarms.find((alarm) => alarm.id === id);
      },

      getActiveAlarms: () => {
        return get().alarms.filter((alarm) => alarm.isEnabled);
      },
    }),
    {
      name: 'alarm-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
