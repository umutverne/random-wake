import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Settings, ThemeMode, Language, TaskType } from '../types';
import i18n from '../i18n';

interface SettingsState extends Settings {
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  setDefaultTaskType: (taskType: TaskType) => void;
  setDefaultSoundUri: (uri: string | null) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  setGradualVolumeEnabled: (enabled: boolean) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  theme: 'dark',
  language: 'en',
  defaultTaskType: 'math',
  defaultSoundUri: null,
  vibrationEnabled: true,
  gradualVolumeEnabled: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setTheme: (theme) => set({ theme }),

      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },

      setDefaultTaskType: (defaultTaskType) => set({ defaultTaskType }),

      setDefaultSoundUri: (defaultSoundUri) => set({ defaultSoundUri }),

      setVibrationEnabled: (vibrationEnabled) => set({ vibrationEnabled }),

      setGradualVolumeEnabled: (gradualVolumeEnabled) => set({ gradualVolumeEnabled }),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Sync i18n language on rehydration
        if (state?.language) {
          i18n.changeLanguage(state.language);
        }
      },
    }
  )
);
