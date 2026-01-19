import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { TaskType } from '../types';
import type { AppTheme } from '../theme';

interface TaskTypeSelectorProps {
  selectedType: TaskType;
  onTypeChange: (type: TaskType) => void;
}

const TASK_TYPES: { type: TaskType; icon: string }[] = [
  { type: 'math', icon: 'calculator' },
  { type: 'typing', icon: 'keyboard' },
  { type: 'sequence', icon: 'numeric' },
  { type: 'shake', icon: 'vibrate' },
];

export const TaskTypeSelector: React.FC<TaskTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
}) => {
  const { t } = useTranslation();
  const theme = useTheme<AppTheme>();

  return (
    <View style={styles.container}>
      {TASK_TYPES.map((task) => {
        const isSelected = selectedType === task.type;
        return (
          <Pressable
            key={task.type}
            onPress={() => onTypeChange(task.type)}
            style={styles.itemWrapper}
          >
            <Surface
              style={[
                styles.item,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primaryContainer
                    : theme.colors.surfaceVariant,
                  borderColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.outline,
                },
              ]}
              elevation={isSelected ? 2 : 0}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.surface,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={task.icon as any}
                  size={28}
                  color={isSelected ? theme.colors.onPrimary : theme.colors.primary}
                />
              </View>
              <Text
                variant="labelMedium"
                style={{
                  color: isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant,
                  fontWeight: isSelected ? '600' : '400',
                  textAlign: 'center',
                }}
                numberOfLines={1}
              >
                {t(`tasks.${task.type}`)}
              </Text>
            </Surface>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  itemWrapper: {
    flex: 1,
  },
  item: {
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    gap: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
