import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, useTheme, TextInput } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStatsStore } from '../../src/stores/statsStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { generateTypingTask, getDifficultyForSnooze } from '../../src/services/taskService';
import { playSuccessFeedback, playErrorFeedback, stopAlarmSound } from '../../src/services/soundService';
import { scheduleAlarmNotification } from '../../src/services/notificationService';
import { useAlarmStore } from '../../src/stores/alarmStore';
import { showInterstitialAd } from '../../src/services/adService';
import type { TypingTask } from '../../src/types';
import type { AppTheme } from '../../src/theme';

export default function TypingTaskScreen() {
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
  const language = useSettingsStore((state) => state.language);
  const getAlarm = useAlarmStore((state) => state.getAlarm);

  const [task, setTask] = useState<TypingTask | null>(null);
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const difficulty = getDifficultyForSnooze(currentDifficulty, snoozeCount);
    setTask(generateTypingTask(difficulty, language));
  }, [currentDifficulty, snoozeCount, language]);

  const isCorrect = () => {
    if (!task) return false;
    return answer.trim().toLowerCase() === task.text.toLowerCase();
  };

  const handleSubmit = async () => {
    if (!task) return;

    setAttempts((prev) => prev + 1);

    if (isCorrect()) {
      setShowSuccess(true);
      await playSuccessFeedback();
      await stopAlarmSound();

      if (statsId) {
        recordAlarmComplete(statsId, snoozeCount, attempts + 1);
      }

      const alarm = getAlarm(alarmId || '');
      if (alarm && alarm.repeatDays.length > 0) {
        await scheduleAlarmNotification(alarm);
      }

      setTimeout(async () => {
        await showInterstitialAd();
        router.dismissAll();
      }, 1500);
    } else {
      setShowError(true);
      await playErrorFeedback();
      setAnswer('');

      setTimeout(() => {
        setShowError(false);
      }, 1500);
    }
  };

  // Calculate match percentage for visual feedback
  const getMatchPercentage = () => {
    if (!task || !answer) return 0;
    const targetLower = task.text.toLowerCase();
    const answerLower = answer.toLowerCase();
    let matches = 0;
    for (let i = 0; i < answerLower.length && i < targetLower.length; i++) {
      if (answerLower[i] === targetLower[i]) matches++;
    }
    return Math.round((matches / targetLower.length) * 100);
  };

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const matchPercentage = getMatchPercentage();

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
              name="keyboard"
              size={40}
              color={theme.colors.primary}
            />
          </View>
          <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
            {t('tasks.typing')}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('tasks.solveToStop')}
          </Text>
        </View>

        {/* Text to Type */}
        <View style={[styles.textContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="headlineSmall" style={[styles.textToType, { color: theme.colors.onSurface }]}>
            "{task.text}"
          </Text>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.outline }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: matchPercentage === 100 ? '#4CAF50' : theme.colors.primary,
                  width: `${matchPercentage}%`,
                },
              ]}
            />
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {matchPercentage}%
          </Text>
        </View>

        {/* Answer Input */}
        <TextInput
          value={answer}
          onChangeText={setAnswer}
          mode="outlined"
          placeholder={t('tasks.typeHere')}
          style={styles.input}
          multiline
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
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  textContainer: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  textToType: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  input: {
    width: '100%',
    marginBottom: 16,
    minHeight: 80,
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
