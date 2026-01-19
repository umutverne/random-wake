import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Switch, useTheme, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { Alarm } from '../types';
import type { AppTheme } from '../theme';
import { formatTimeRange, getTimeRangeMinutes } from '../utils/randomTime';

interface AlarmCardProps {
  alarm: Alarm;
  onPress: () => void;
  onToggle: () => void;
}

const DAYS_SHORT = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export const AlarmCard: React.FC<AlarmCardProps> = ({ alarm, onPress, onToggle }) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme<AppTheme>();

  const rangeMinutes = getTimeRangeMinutes(alarm.startTime, alarm.endTime);

  const getRepeatDaysText = (): string => {
    if (alarm.repeatDays.length === 0) {
      return t('alarms.noRepeat');
    }
    if (alarm.repeatDays.length === 7) {
      return t('days.everyday');
    }
    if (
      alarm.repeatDays.length === 5 &&
      [1, 2, 3, 4, 5].every((d) => alarm.repeatDays.includes(d))
    ) {
      return t('days.weekdays');
    }
    if (
      alarm.repeatDays.length === 2 &&
      alarm.repeatDays.includes(0) &&
      alarm.repeatDays.includes(6)
    ) {
      return t('days.weekend');
    }

    // Use translation keys for individual days
    const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return alarm.repeatDays
      .sort((a, b) => a - b)
      .map((d) => t(`days.${dayKeys[d]}`))
      .join(', ');
  };

  const getTaskTypeIcon = () => {
    switch (alarm.taskType) {
      case 'math':
        return 'calculator';
      case 'typing':
        return 'keyboard';
      case 'sequence':
        return 'numeric';
      case 'shake':
        return 'vibrate';
      default:
        return 'alarm';
    }
  };

  const getTaskTypeName = (): string => {
    return t(`tasks.${alarm.taskType}`);
  };

  return (
    <Pressable onPress={onPress}>
      <Surface
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surfaceVariant,
            opacity: alarm.isEnabled ? 1 : 0.6,
          },
        ]}
        elevation={1}
      >
        <View style={styles.timeContainer}>
          <Text
            variant="headlineMedium"
            style={[
              styles.timeText,
              { color: theme.colors.primary },
            ]}
          >
            {alarm.startTime}
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={theme.colors.onSurfaceVariant}
            style={styles.arrow}
          />
          <Text
            variant="headlineMedium"
            style={[
              styles.timeText,
              { color: theme.colors.primary },
            ]}
          >
            {alarm.endTime}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          {alarm.label ? (
            <Text
              variant="titleSmall"
              style={{ color: theme.colors.onSurface }}
              numberOfLines={1}
            >
              {alarm.label}
            </Text>
          ) : null}

          <View style={styles.detailsRow}>
            <MaterialCommunityIcons
              name="calendar-repeat"
              size={14}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="bodySmall"
              style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}
            >
              {getRepeatDaysText()}
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <MaterialCommunityIcons
              name={getTaskTypeIcon()}
              size={14}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="bodySmall"
              style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}
            >
              {getTaskTypeName()}
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.rangeText, { color: theme.colors.secondary }]}
            >
              ~{rangeMinutes} {t('settings.minutes')}
            </Text>
          </View>
        </View>

        <Switch
          value={alarm.isEnabled}
          onValueChange={onToggle}
          color={theme.colors.primary}
        />
      </Surface>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  timeText: {
    fontWeight: '600',
  },
  arrow: {
    marginHorizontal: 4,
  },
  infoContainer: {
    flex: 1,
    marginRight: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailText: {
    marginLeft: 4,
  },
  rangeText: {
    marginLeft: 8,
  },
});
