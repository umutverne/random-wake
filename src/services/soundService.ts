import { Audio, AVPlaybackSource } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Vibration, Platform } from 'react-native';

let currentSound: Audio.Sound | null = null;
let isPlaying = false;
let vibrationInterval: NodeJS.Timeout | null = null;

// Alarm sound pool - royalty-free sounds from mixkit.co
export const ALARM_SOUNDS = [
  {
    id: 'classic',
    name: 'Klasik',
    nameEn: 'Classic',
    url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  },
  {
    id: 'digital',
    name: 'Dijital',
    nameEn: 'Digital',
    url: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3',
  },
  {
    id: 'gentle',
    name: 'Nazik',
    nameEn: 'Gentle',
    url: 'https://assets.mixkit.co/active_storage/sfx/2871/2871-preview.mp3',
  },
  {
    id: 'morning',
    name: 'Sabah',
    nameEn: 'Morning',
    url: 'https://assets.mixkit.co/active_storage/sfx/2872/2872-preview.mp3',
  },
  {
    id: 'bell',
    name: 'Zil',
    nameEn: 'Bell',
    url: 'https://assets.mixkit.co/active_storage/sfx/2873/2873-preview.mp3',
  },
  {
    id: 'beep',
    name: 'Bip',
    nameEn: 'Beep',
    url: 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3',
  },
  {
    id: 'chime',
    name: 'Çan',
    nameEn: 'Chime',
    url: 'https://assets.mixkit.co/active_storage/sfx/2875/2875-preview.mp3',
  },
  {
    id: 'rooster',
    name: 'Horoz',
    nameEn: 'Rooster',
    url: 'https://assets.mixkit.co/active_storage/sfx/2876/2876-preview.mp3',
  },
] as const;

export type AlarmSoundId = typeof ALARM_SOUNDS[number]['id'] | 'random';

/**
 * Get a random alarm sound URL
 */
export const getRandomAlarmSound = (): string => {
  const randomIndex = Math.floor(Math.random() * ALARM_SOUNDS.length);
  return ALARM_SOUNDS[randomIndex].url;
};

/**
 * Get alarm sound URL by ID
 */
export const getAlarmSoundUrl = (soundId: AlarmSoundId | null | undefined): string => {
  if (!soundId || soundId === 'random') {
    return getRandomAlarmSound();
  }
  const sound = ALARM_SOUNDS.find(s => s.id === soundId);
  return sound?.url || getRandomAlarmSound();
};

// Default alarm sound - will be loaded if available
let DEFAULT_ALARM_SOUND: AVPlaybackSource | null = null;
try {
  DEFAULT_ALARM_SOUND = require('../../assets/sounds/alarm.mp3');
} catch {
  console.log('No local alarm sound found, will use remote sound');
}

/**
 * Configure audio for alarm playback
 */
export const configureAudio = async (): Promise<void> => {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: false,
    playThroughEarpieceAndroid: false,
  });
};

/**
 * Start strong vibration pattern for alarm
 */
const startStrongVibration = () => {
  // Use React Native Vibration for stronger pattern
  if (Platform.OS === 'android') {
    // Pattern: vibrate 500ms, pause 300ms, repeat
    const pattern = [0, 500, 300, 500, 300, 500, 300];
    Vibration.vibrate(pattern, true); // true = repeat
  } else {
    // iOS uses Haptics
    vibrationInterval = setInterval(async () => {
      if (isPlaying) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    }, 500);
  }
};

/**
 * Play alarm sound
 */
export const playAlarmSound = async (
  soundIdOrUri?: string | null,
  options?: {
    loop?: boolean;
    volume?: number;
    gradualVolume?: boolean;
    vibrate?: boolean;
  }
): Promise<void> => {
  try {
    // Stop any currently playing sound
    await stopAlarmSound();

    await configureAudio();

    isPlaying = true;

    // Start strong vibration if enabled
    if (options?.vibrate !== false) {
      startStrongVibration();
    }

    // Determine sound source
    let soundSource: AVPlaybackSource | null = null;

    // Check if it's a URL or a sound ID
    if (soundIdOrUri && soundIdOrUri.startsWith('http')) {
      soundSource = { uri: soundIdOrUri };
    } else if (soundIdOrUri) {
      // It's a sound ID - get URL from sound pool
      const soundUrl = getAlarmSoundUrl(soundIdOrUri as AlarmSoundId);
      soundSource = { uri: soundUrl };
    } else if (DEFAULT_ALARM_SOUND) {
      soundSource = DEFAULT_ALARM_SOUND;
    } else {
      // Use random sound from pool
      soundSource = { uri: getRandomAlarmSound() };
    }

    try {
      const { sound } = await Audio.Sound.createAsync(soundSource, {
        shouldPlay: true,
        isLooping: options?.loop ?? true,
        volume: options?.gradualVolume ? 0.1 : (options?.volume ?? 1.0),
      });

      currentSound = sound;

      // Gradual volume increase
      if (options?.gradualVolume) {
        const targetVolume = options?.volume ?? 1.0;
        const steps = 10;
        const stepDuration = 3000; // 3 seconds per step
        const volumeStep = targetVolume / steps;

        for (let i = 1; i <= steps && isPlaying; i++) {
          await new Promise((resolve) => setTimeout(resolve, stepDuration));
          if (currentSound && isPlaying) {
            await currentSound.setVolumeAsync(Math.min(volumeStep * i, targetVolume));
          }
        }
      }
    } catch (soundError) {
      console.log('Could not load sound, continuing with vibration only:', soundError);
    }
  } catch (error) {
    console.error('Error playing alarm:', error);
    // Ensure vibration is running
    if (options?.vibrate !== false) {
      isPlaying = true;
      startStrongVibration();
    }
  }
};

/**
 * Stop alarm sound
 */
export const stopAlarmSound = async (): Promise<void> => {
  try {
    isPlaying = false;

    // Stop vibration - both patterns
    Vibration.cancel();
    if (vibrationInterval) {
      clearInterval(vibrationInterval);
      vibrationInterval = null;
    }

    // Stop sound
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }
  } catch (error) {
    console.error('Error stopping alarm sound:', error);
  }
};

/**
 * Pause alarm sound
 */
export const pauseAlarmSound = async (): Promise<void> => {
  try {
    if (currentSound) {
      await currentSound.pauseAsync();
    }
  } catch (error) {
    console.error('Error pausing alarm sound:', error);
  }
};

/**
 * Resume alarm sound
 */
export const resumeAlarmSound = async (): Promise<void> => {
  try {
    if (currentSound) {
      await currentSound.playAsync();
    }
  } catch (error) {
    console.error('Error resuming alarm sound:', error);
  }
};

/**
 * Set alarm volume
 */
export const setAlarmVolume = async (volume: number): Promise<void> => {
  try {
    if (currentSound) {
      await currentSound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
    }
  } catch (error) {
    console.error('Error setting alarm volume:', error);
  }
};

/**
 * Trigger vibration
 */
export const triggerVibration = async (
  type: 'light' | 'medium' | 'heavy' = 'heavy'
): Promise<void> => {
  try {
    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
  } catch (error) {
    console.error('Error triggering vibration:', error);
  }
};

/**
 * Start continuous vibration pattern
 */
export const startVibrationPattern = async (
  intervalMs: number = 1000
): Promise<NodeJS.Timeout> => {
  const vibrate = async () => {
    await triggerVibration('heavy');
  };

  await vibrate();
  return setInterval(vibrate, intervalMs);
};

/**
 * Stop vibration pattern
 */
export const stopVibrationPattern = (intervalId: NodeJS.Timeout): void => {
  clearInterval(intervalId);
};

/**
 * Play success feedback
 */
export const playSuccessFeedback = async (): Promise<void> => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

/**
 * Play error feedback
 */
export const playErrorFeedback = async (): Promise<void> => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};
