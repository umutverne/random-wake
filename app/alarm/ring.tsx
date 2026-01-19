import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { useAlarmStore } from '../../src/stores/alarmStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useStatsStore } from '../../src/stores/statsStore';
import { playAlarmSound, stopAlarmSound } from '../../src/services/soundService';
import { dismissAllNotifications } from '../../src/services/notificationService';
import type { AppTheme } from '../../src/theme';

export default function AlarmRingScreen() {
  // Keep the screen awake while alarm is ringing
  useKeepAwake();

  const { t, i18n } = useTranslation();
  const theme = useTheme<AppTheme>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { alarmId } = useLocalSearchParams<{ alarmId: string }>();

  const getAlarm = useAlarmStore((state) => state.getAlarm);
  const settings = useSettingsStore();
  const recordAlarmStart = useStatsStore((state) => state.recordAlarmStart);

  const alarm = getAlarm(alarmId || '');
  const statsIdRef = useRef<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start alarm sound
    const soundIdOrUri = alarm?.soundId || alarm?.soundUri || 'random';
    playAlarmSound(soundIdOrUri, {
      loop: true,
      gradualVolume: settings.gradualVolumeEnabled,
      vibrate: settings.vibrationEnabled,
    });

    // Record alarm start in stats
    if (alarm && !statsIdRef.current) {
      statsIdRef.current = recordAlarmStart(alarmId || '', alarm.taskType);
    }

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      stopAlarmSound();
      dismissAllNotifications();
      pulseAnimation.stop();
    };
  }, []);

  const handleWakeNow = () => {
    // Navigate to task screen based on alarm task type
    const taskType = alarm?.taskType || 'math';
    router.replace({
      pathname: `/task/${taskType}`,
      params: { alarmId: alarmId || '', statsId: statsIdRef.current || '' },
    });
  };

  const currentTime = new Date().toLocaleTimeString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
        {/* Time Display */}
        <Animated.View style={[styles.timeContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Text variant="displayLarge" style={[styles.time, { color: theme.colors.primary }]}>
            {currentTime}
          </Text>
        </Animated.View>

        {/* Alarm Icon */}
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
          <MaterialCommunityIcons
            name="alarm"
            size={64}
            color={theme.colors.primary}
          />
        </View>

        {/* Label */}
        <Text variant="headlineSmall" style={[styles.label, { color: theme.colors.onBackground }]}>
          {alarm?.label || t('ring.alarmRinging')}
        </Text>

        {/* Wake Now Button */}
        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            onPress={handleWakeNow}
            style={styles.wakeButton}
            contentStyle={styles.buttonContent}
            buttonColor={theme.colors.primary}
            icon="alarm-off"
          >
            {t('ring.wakeNow')}
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  timeContainer: {
    marginBottom: 32,
  },
  time: {
    fontSize: 72,
    fontWeight: '200',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    textAlign: 'center',
    marginBottom: 8,
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 48,
  },
  wakeButton: {
    borderRadius: 28,
  },
  buttonContent: {
    paddingVertical: 12,
  },
});
