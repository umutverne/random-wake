import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, useTheme, TextInput, Surface, IconButton } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAlarmStore } from '../../src/stores/alarmStore';
import { TimePickerButton } from '../../src/components/TimePickerButton';
import { DaySelector } from '../../src/components/DaySelector';
import { TaskTypeSelector } from '../../src/components/TaskTypeSelector';
import { SoundSelector } from '../../src/components/SoundSelector';
import { scheduleAlarmNotification, cancelAlarmNotification } from '../../src/services/notificationService';
import { isTimeRangeExceeded, getTimeRangeMinutes } from '../../src/utils/randomTime';
import type { TaskType, AlarmSoundId } from '../../src/types';
import type { AppTheme } from '../../src/theme';

export default function EditAlarmScreen() {
  const { t } = useTranslation();
  const theme = useTheme<AppTheme>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const getAlarm = useAlarmStore((state) => state.getAlarm);
  const updateAlarm = useAlarmStore((state) => state.updateAlarm);
  const deleteAlarm = useAlarmStore((state) => state.deleteAlarm);

  const alarm = getAlarm(id || '');

  const [startTime, setStartTime] = useState(alarm?.startTime || '07:00');
  const [endTime, setEndTime] = useState(alarm?.endTime || '07:30');
  const [repeatDays, setRepeatDays] = useState<number[]>(alarm?.repeatDays || []);
  const [taskType, setTaskType] = useState<TaskType>(alarm?.taskType || 'math');
  const [soundId, setSoundId] = useState<AlarmSoundId>(alarm?.soundId || 'random');
  const [label, setLabel] = useState(alarm?.label || '');

  useEffect(() => {
    if (alarm) {
      setStartTime(alarm.startTime);
      setEndTime(alarm.endTime);
      setRepeatDays(alarm.repeatDays);
      setTaskType(alarm.taskType);
      setSoundId(alarm.soundId || 'random');
      setLabel(alarm.label);
    }
  }, [alarm]);

  const rangeMinutes = getTimeRangeMinutes(startTime, endTime);
  const showRangeWarning = isTimeRangeExceeded(startTime, endTime, 30);

  const handleSave = async () => {
    if (!id || !alarm) return;

    if (rangeMinutes <= 0) {
      Alert.alert(t('common.error'), t('alarms.invalidRange'));
      return;
    }

    updateAlarm(id, {
      startTime,
      endTime,
      repeatDays,
      taskType,
      soundId,
      label: label.trim(),
    });

    // Reschedule the notification if alarm is enabled
    if (alarm.isEnabled) {
      await scheduleAlarmNotification({
        ...alarm,
        startTime,
        endTime,
        repeatDays,
        taskType,
        soundId,
        label: label.trim(),
      });
    }

    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      t('alarms.deleteAlarm'),
      t('alarms.deleteConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            if (id) {
              await cancelAlarmNotification(id);
              deleteAlarm(id);
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    router.back();
  };

  if (!alarm) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <IconButton
            icon="close"
            iconColor={theme.colors.onBackground}
            onPress={handleClose}
          />
        </View>
        <View style={styles.notFound}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
            {t('alarms.alarmNotFound')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <IconButton
          icon="close"
          iconColor={theme.colors.onBackground}
          onPress={handleClose}
        />
        <Text variant="titleLarge" style={{ color: theme.colors.onBackground, flex: 1 }}>
          {t('alarms.editAlarm')}
        </Text>
        <Button mode="contained" onPress={handleSave}>
          {t('common.save')}
        </Button>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Time Range */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          {t('alarms.timeRange')}
        </Text>

        <View style={styles.timeRow}>
          <TimePickerButton
            label={t('alarms.startTime')}
            value={startTime}
            onChange={setStartTime}
          />
          <View style={styles.timeSeparator}>
            <MaterialCommunityIcons
              name="arrow-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
          <TimePickerButton
            label={t('alarms.endTime')}
            value={endTime}
            onChange={setEndTime}
          />
        </View>

        {/* Range Info */}
        <Surface
          style={[
            styles.rangeInfo,
            {
              backgroundColor: showRangeWarning
                ? theme.colors.errorContainer
                : theme.colors.surfaceVariant,
            },
          ]}
          elevation={0}
        >
          <MaterialCommunityIcons
            name={showRangeWarning ? 'alert-circle' : 'information'}
            size={20}
            color={showRangeWarning ? theme.colors.error : theme.colors.primary}
          />
          <Text
            variant="bodySmall"
            style={{
              flex: 1,
              marginLeft: 8,
              color: showRangeWarning ? theme.colors.error : theme.colors.onSurfaceVariant,
            }}
          >
            {showRangeWarning
              ? t('alarms.rangeWarning')
              : t('alarms.rangeInfo', { minutes: rangeMinutes })}
          </Text>
        </Surface>

        {/* Repeat Days */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          {t('alarms.repeatDays')}
        </Text>

        <DaySelector selectedDays={repeatDays} onDaysChange={setRepeatDays} />

        {/* Task Type */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          {t('alarms.taskType')}
        </Text>

        <TaskTypeSelector selectedType={taskType} onTypeChange={setTaskType} />

        <Text
          variant="bodySmall"
          style={[styles.taskDescription, { color: theme.colors.onSurfaceVariant }]}
        >
          {t(`tasks.${taskType}Desc`)}
        </Text>

        {/* Sound */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          {t('alarms.sound')}
        </Text>

        <SoundSelector selectedSoundId={soundId} onSoundChange={setSoundId} />

        {/* Label */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          {t('alarms.label')}
        </Text>

        <TextInput
          value={label}
          onChangeText={setLabel}
          placeholder={t('alarms.labelPlaceholder')}
          mode="outlined"
          style={styles.labelInput}
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
        />

        {/* Delete Button */}
        <Button
          mode="outlined"
          onPress={handleDelete}
          textColor={theme.colors.error}
          style={[styles.deleteButton, { borderColor: theme.colors.error }]}
          icon="delete"
        >
          {t('alarms.deleteAlarm')}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeSeparator: {
    paddingTop: 16,
  },
  rangeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  taskDescription: {
    marginTop: 8,
  },
  labelInput: {
    backgroundColor: 'transparent',
  },
  deleteButton: {
    marginTop: 32,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
