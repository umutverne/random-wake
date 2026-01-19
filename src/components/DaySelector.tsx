import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { AppTheme } from '../theme';

interface DaySelectorProps {
  selectedDays: number[];
  onDaysChange: (days: number[]) => void;
}

const DAYS = [
  { key: 'mon', value: 1 },
  { key: 'tue', value: 2 },
  { key: 'wed', value: 3 },
  { key: 'thu', value: 4 },
  { key: 'fri', value: 5 },
  { key: 'sat', value: 6 },
  { key: 'sun', value: 0 },
] as const;

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDays,
  onDaysChange,
}) => {
  const { t } = useTranslation();
  const theme = useTheme<AppTheme>();

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      onDaysChange(selectedDays.filter((d) => d !== day));
    } else {
      onDaysChange([...selectedDays, day]);
    }
  };

  const selectWeekdays = () => {
    onDaysChange([1, 2, 3, 4, 5]);
  };

  const selectWeekend = () => {
    onDaysChange([0, 6]);
  };

  const selectEveryday = () => {
    onDaysChange([0, 1, 2, 3, 4, 5, 6]);
  };

  const clearAll = () => {
    onDaysChange([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.daysRow}>
        {DAYS.map((day) => {
          const isSelected = selectedDays.includes(day.value);
          return (
            <Pressable
              key={day.key}
              onPress={() => toggleDay(day.value)}
              style={[
                styles.dayButton,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.surfaceVariant,
                  borderColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.outline,
                },
              ]}
            >
              <Text
                variant="labelMedium"
                style={{
                  color: isSelected
                    ? theme.colors.onPrimary
                    : theme.colors.onSurfaceVariant,
                  fontWeight: isSelected ? '600' : '400',
                }}
              >
                {t(`days.${day.key}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.presetsRow}>
        <Pressable
          onPress={selectWeekdays}
          style={[styles.presetButton, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('days.weekdays')}
          </Text>
        </Pressable>

        <Pressable
          onPress={selectWeekend}
          style={[styles.presetButton, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('days.weekend')}
          </Text>
        </Pressable>

        <Pressable
          onPress={selectEveryday}
          style={[styles.presetButton, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('days.everyday')}
          </Text>
        </Pressable>

        <Pressable
          onPress={clearAll}
          style={[styles.presetButton, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Tek sefer
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
