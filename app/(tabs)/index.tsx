import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, FAB, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAlarmStore } from '../../src/stores/alarmStore';
import { AlarmCard } from '../../src/components/AlarmCard';
import { BannerAd } from '../../src/components/BannerAd';
import { scheduleAlarmNotification, cancelAlarmNotification } from '../../src/services/notificationService';
import type { Alarm } from '../../src/types';
import type { AppTheme } from '../../src/theme';

export default function AlarmsScreen() {
  const { t } = useTranslation();
  const theme = useTheme<AppTheme>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const alarms = useAlarmStore((state) => state.alarms);
  const toggleAlarm = useAlarmStore((state) => state.toggleAlarm);

  const handleAddAlarm = () => {
    router.push('/alarm/create');
  };

  const handleAlarmPress = (alarm: Alarm) => {
    router.push(`/alarm/${alarm.id}`);
  };

  const handleToggleAlarm = useCallback(async (alarm: Alarm) => {
    toggleAlarm(alarm.id);

    // Schedule or cancel notification
    if (!alarm.isEnabled) {
      // Was disabled, now enabling
      await scheduleAlarmNotification({ ...alarm, isEnabled: true });
    } else {
      // Was enabled, now disabling
      await cancelAlarmNotification(alarm.id);
    }
  }, [toggleAlarm]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="alarm-off"
        size={80}
        color={theme.colors.onSurfaceVariant}
      />
      <Text
        variant="headlineSmall"
        style={[styles.emptyTitle, { color: theme.colors.onSurface }]}
      >
        {t('alarms.noAlarms')}
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        {t('alarms.addAlarm')}
      </Text>
    </View>
  );

  const renderAlarm = ({ item }: { item: Alarm }) => (
    <AlarmCard
      alarm={item}
      onPress={() => handleAlarmPress(item)}
      onToggle={() => handleToggleAlarm(item)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text variant="headlineLarge" style={{ color: theme.colors.onBackground }}>
          {t('alarms.title')}
        </Text>
      </View>

      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        renderItem={renderAlarm}
        contentContainerStyle={[
          styles.listContent,
          alarms.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={[
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            bottom: insets.bottom + 80,
          },
        ]}
        color={theme.colors.onPrimary}
        onPress={handleAddAlarm}
      />

      <View style={[styles.bannerContainer, { paddingBottom: insets.bottom }]}>
        <BannerAd />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyListContent: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
  },
  bannerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
