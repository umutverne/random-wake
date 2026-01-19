import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, useTheme, TextInput } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStatsStore } from '../../src/stores/statsStore';
import { generateSequenceTask, getDifficultyForSnooze } from '../../src/services/taskService';
import { playSuccessFeedback, playErrorFeedback, stopAlarmSound } from '../../src/services/soundService';
import { scheduleAlarmNotification } from '../../src/services/notificationService';
import { useAlarmStore } from '../../src/stores/alarmStore';
import { showInterstitialAd } from '../../src/services/adService';
import type { SequenceTask } from '../../src/types';
import type { AppTheme } from '../../src/theme';

export default function SequenceTaskScreen() {
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

  const [task, setTask] = useState<SequenceTask | null>(null);
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const difficulty = getDifficultyForSnooze(currentDifficulty, snoozeCount);
    setTask(generateSequenceTask(difficulty));
  }, [currentDifficulty, snoozeCount]);

  const handleSubmit = async () => {
    if (!task) return;

    setAttempts((prev) => prev + 1);

    if (answer === task.sequence) {
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

      // Generate new sequence on wrong answer
      setTimeout(() => {
        setShowError(false);
        const difficulty = getDifficultyForSnooze(currentDifficulty, snoozeCount);
        setTask(generateSequenceTask(difficulty));
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

  // Render sequence with visual highlighting
  const renderSequence = () => {
    return task.sequence.split('').map((digit, index) => {
      const isMatched = answer[index] === digit;
      const isCurrentPosition = index === answer.length;

      return (
        <View
          key={index}
          style={[
            styles.digitBox,
            {
              backgroundColor: isMatched
                ? theme.colors.primaryContainer
                : theme.colors.surfaceVariant,
              borderColor: isCurrentPosition
                ? theme.colors.primary
                : isMatched
                ? theme.colors.primary
                : theme.colors.outline,
            },
          ]}
        >
          <Text
            variant="headlineMedium"
            style={{
              color: isMatched ? theme.colors.primary : theme.colors.onSurface,
              fontWeight: '600',
            }}
          >
            {digit}
          </Text>
        </View>
      );
    });
  };

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
              name="numeric"
              size={40}
              color={theme.colors.primary}
            />
          </View>
          <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
            {t('tasks.sequence')}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('tasks.solveToStop')}
          </Text>
        </View>

        {/* Sequence Display */}
        <View style={styles.sequenceContainer}>
          {renderSequence()}
        </View>

        {/* Answer Input */}
        <TextInput
          value={answer}
          onChangeText={(text) => setAnswer(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          mode="outlined"
          placeholder={t('tasks.sequencePlaceholder')}
          style={styles.input}
          contentStyle={styles.inputContent}
          maxLength={task.sequence.length}
          outlineColor={showError ? theme.colors.error : theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
          autoFocus
        />

        {/* Progress */}
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
          {answer.length} / {task.sequence.length}
        </Text>

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
          disabled={answer.length !== task.sequence.length || showSuccess}
        >
          {t('tasks.submit')}
        </Button>

        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {t('tasks.attempt')}: {attempts}
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
    paddingHorizontal: 24,
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
  sequenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  digitBox: {
    width: 44,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 8,
  },
  inputContent: {
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
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
