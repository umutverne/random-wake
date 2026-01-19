import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, useTheme, ProgressBar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import { useStatsStore } from '../../src/stores/statsStore';
import { generateShakeTask, getDifficultyForSnooze } from '../../src/services/taskService';
import { playSuccessFeedback, triggerVibration, stopAlarmSound } from '../../src/services/soundService';
import { scheduleAlarmNotification } from '../../src/services/notificationService';
import { useAlarmStore } from '../../src/stores/alarmStore';
import { showInterstitialAd } from '../../src/services/adService';
import type { ShakeTask } from '../../src/types';
import type { AppTheme } from '../../src/theme';

const SHAKE_THRESHOLD = 1.5;

export default function ShakeTaskScreen() {
  const { t } = useTranslation();
  const theme = useTheme<AppTheme>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { alarmId, snoozeCount: snoozeCountStr, statsId } = useLocalSearchParams<{
    alarmId: string;
    snoozeCount: string;
    statsId: string;
  }>();

  const snoozeCount = parseInt(snoozeCountStr || '0', 10);
  const currentDifficulty = useStatsStore((state) => state.currentDifficulty);
  const recordAlarmComplete = useStatsStore((state) => state.recordAlarmComplete);
  const getAlarm = useAlarmStore((state) => state.getAlarm);

  const [task, setTask] = useState<ShakeTask | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const lastShakeTime = useRef(0);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const difficulty = getDifficultyForSnooze(currentDifficulty, snoozeCount);
    setTask(generateShakeTask(difficulty));
  }, [currentDifficulty, snoozeCount]);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const startAccelerometer = async () => {
      await Accelerometer.setUpdateInterval(100);

      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();

        if (acceleration > SHAKE_THRESHOLD && now - lastShakeTime.current > 200) {
          lastShakeTime.current = now;

          setShakeCount((prev) => {
            const newCount = prev + 1;

            // Trigger animation
            Animated.sequence([
              Animated.timing(shakeAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(shakeAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
              }),
            ]).start();

            // Vibrate feedback
            triggerVibration('light');

            return newCount;
          });
        }
      });
    };

    startAccelerometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    const checkCompletion = async () => {
      if (task && shakeCount >= task.requiredShakes && !showSuccess) {
        setShowSuccess(true);
        await playSuccessFeedback();
        await stopAlarmSound();

        if (statsId) {
          recordAlarmComplete(statsId, snoozeCount, 1);
        }

        const alarm = getAlarm(alarmId || '');
        if (alarm && alarm.repeatDays.length > 0) {
          await scheduleAlarmNotification(alarm);
        }

        setTimeout(async () => {
          await showInterstitialAd();
          router.dismissAll();
        }, 1500);
      }
    };

    checkCompletion();
  }, [shakeCount, task, showSuccess]);

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const progress = Math.min(shakeCount / task.requiredShakes, 1);
  const remaining = Math.max(task.requiredShakes - shakeCount, 0);

  const shakeTransform = {
    transform: [
      {
        translateX: shakeAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 10, -10],
        }),
      },
      {
        scale: shakeAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.1, 1],
        }),
      },
    ],
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
            {t('tasks.shake')}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('tasks.solveToStop')}
          </Text>
        </View>

        {/* Shake Icon */}
        <Animated.View style={[styles.iconWrapper, shakeTransform]}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: showSuccess
                  ? theme.colors.primaryContainer
                  : theme.colors.surfaceVariant,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={showSuccess ? 'check-circle' : 'vibrate'}
              size={80}
              color={showSuccess ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
          </View>
        </Animated.View>

        {/* Counter */}
        <View style={styles.counterContainer}>
          <Text
            variant="displayLarge"
            style={[styles.counter, { color: theme.colors.primary }]}
          >
            {shakeCount}
          </Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            / {task.requiredShakes}
          </Text>
        </View>

        {/* Remaining */}
        {!showSuccess && (
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 24 }}>
            {t('tasks.shakesRemaining', { count: remaining })}
          </Text>
        )}

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progress}
            color={showSuccess ? '#4CAF50' : theme.colors.primary}
            style={styles.progressBar}
          />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
            {Math.round(progress * 100)}%
          </Text>
        </View>

        {/* Success Message */}
        {showSuccess && (
          <View style={[styles.successContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color={theme.colors.primary}
            />
            <Text variant="titleMedium" style={{ color: theme.colors.primary, marginLeft: 8 }}>
              {t('tasks.correct')}
            </Text>
          </View>
        )}

        {/* Instructions */}
        {!showSuccess && (
          <View style={[styles.instructionsContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <MaterialCommunityIcons
              name="information"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8, flex: 1 }}
            >
              Telefonunu yukarı aşağı veya sağa sola sallayarak sayacı doldur
            </Text>
          </View>
        )}
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
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconWrapper: {
    marginBottom: 32,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  counter: {
    fontWeight: '200',
    fontSize: 80,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 32,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 'auto',
  },
});
