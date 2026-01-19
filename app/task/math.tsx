import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, useTheme, TextInput } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStatsStore } from '../../src/stores/statsStore';
import { generateMathTask, getDifficultyForSnooze } from '../../src/services/taskService';
import { playSuccessFeedback, playErrorFeedback, stopAlarmSound } from '../../src/services/soundService';
import { scheduleAlarmNotification } from '../../src/services/notificationService';
import { useAlarmStore } from '../../src/stores/alarmStore';
import { showInterstitialAd } from '../../src/services/adService';
import type { MathTask } from '../../src/types';
import type { AppTheme } from '../../src/theme';

export default function MathTaskScreen() {
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

  const [task, setTask] = useState<MathTask | null>(null);
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const difficulty = getDifficultyForSnooze(currentDifficulty, snoozeCount);
    setTask(generateMathTask(difficulty));
  }, [currentDifficulty, snoozeCount]);

  const handleSubmit = async () => {
    if (!task) return;

    const userAnswer = parseInt(answer, 10);
    setAttempts((prev) => prev + 1);

    if (userAnswer === task.answer) {
      // Correct answer
      setShowSuccess(true);
      await playSuccessFeedback();
      await stopAlarmSound();

      // Record completion
      if (statsId) {
        recordAlarmComplete(statsId, snoozeCount, attempts + 1);
      }

      // Reschedule alarm for next occurrence
      const alarm = getAlarm(alarmId || '');
      if (alarm && alarm.repeatDays.length > 0) {
        await scheduleAlarmNotification(alarm);
      }

      // Show interstitial ad and navigate back
      setTimeout(async () => {
        await showInterstitialAd();
        router.dismissAll();
      }, 1500);
    } else {
      // Wrong answer
      setShowError(true);
      await playErrorFeedback();
      setAnswer('');

      setTimeout(() => {
        setShowError(false);
      }, 1500);
    }
  };

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons
              name="calculator"
              size={40}
              color={theme.colors.primary}
            />
          </View>
          <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
            {t('tasks.math')}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('tasks.solveToStop')}
          </Text>
        </View>

        {/* Question */}
        <View style={[styles.questionContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="displayMedium" style={[styles.question, { color: theme.colors.onSurface }]}>
            {task.question}
          </Text>
        </View>

        {/* Answer Input */}
        <TextInput
          value={answer}
          onChangeText={setAnswer}
          keyboardType="numeric"
          mode="outlined"
          placeholder="?"
          style={styles.input}
          contentStyle={styles.inputContent}
          outlineColor={showError ? theme.colors.error : theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
          autoFocus
        />

        {/* Feedback */}
        {showError && (
          <View style={[styles.feedback, { backgroundColor: theme.colors.errorContainer }]}>
            <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.error} />
            <Text variant="bodyMedium" style={{ color: theme.colors.error, marginLeft: 8 }}>
              {t('tasks.incorrect')}
            </Text>
          </View>
        )}

        {showSuccess && (
          <View style={[styles.feedback, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ color: theme.colors.primary, marginLeft: 8 }}>
              {t('tasks.correct')}
            </Text>
          </View>
        )}

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          contentStyle={styles.submitContent}
          disabled={!answer || showSuccess}
        >
          {t('tasks.submit')}
        </Button>

        {/* Attempts Counter */}
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Deneme: {attempts}
        </Text>
      </View>
    </KeyboardAvoidingView>
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
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionContainer: {
    width: '100%',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  question: {
    fontWeight: '600',
  },
  input: {
    width: '100%',
    marginBottom: 16,
  },
  inputContent: {
    fontSize: 32,
    textAlign: 'center',
  },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  submitButton: {
    width: '100%',
    borderRadius: 28,
    marginBottom: 16,
  },
  submitContent: {
    paddingVertical: 8,
  },
});
