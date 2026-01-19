import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, useTheme, ProgressBar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStatsStore } from '../../src/stores/statsStore';
import { BannerAd } from '../../src/components/BannerAd';
import type { AppTheme } from '../../src/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color }) => {
  const theme = useTheme<AppTheme>();

  return (
    <Surface style={[styles.statCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon as any} size={24} color={color} />
      </View>
      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {title}
      </Text>
      <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.onSurface }]}>
        {value}
      </Text>
      {subtitle && (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {subtitle}
        </Text>
      )}
    </Surface>
  );
};

export default function StatsScreen() {
  const { t } = useTranslation();
  const theme = useTheme<AppTheme>();
  const insets = useSafeAreaInsets();

  const getWeeklyStats = useStatsStore((state) => state.getWeeklyStats);
  const getMonthlyStats = useStatsStore((state) => state.getMonthlyStats);
  const currentStreak = useStatsStore((state) => state.currentStreak);
  const bestStreak = useStatsStore((state) => state.bestStreak);
  const currentDifficulty = useStatsStore((state) => state.currentDifficulty);

  const weeklyStats = getWeeklyStats();
  const monthlyStats = getMonthlyStats();

  const getDifficultyLabel = () => {
    switch (currentDifficulty) {
      case 1:
        return t('difficulty.easy');
      case 2:
        return t('difficulty.medium');
      case 3:
        return t('difficulty.hard');
      default:
        return t('difficulty.easy');
    }
  };

  const hasData = weeklyStats.totalAlarms > 0 || monthlyStats.totalAlarms > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text variant="headlineLarge" style={{ color: theme.colors.onBackground }}>
          {t('stats.title')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!hasData ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="chart-line"
              size={80}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="headlineSmall"
              style={[styles.emptyTitle, { color: theme.colors.onSurface }]}
            >
              {t('stats.noData')}
            </Text>
          </View>
        ) : (
          <>
            {/* Weekly Stats */}
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              {t('stats.thisWeek')}
            </Text>

            <View style={styles.statsRow}>
              <StatCard
                title={t('stats.wakeUpSuccess')}
                value={`${Math.round(weeklyStats.successRate)}%`}
                icon="check-circle"
                color={theme.colors.primary}
              />
              <StatCard
                title={t('stats.averageSnooze')}
                value={weeklyStats.averageSnoozeCount.toFixed(1)}
                icon="alarm-snooze"
                color={theme.colors.secondary}
              />
            </View>

            <View style={styles.statsRow}>
              <StatCard
                title={t('stats.totalAlarms')}
                value={weeklyStats.totalAlarms}
                icon="alarm-multiple"
                color={theme.colors.primary}
              />
              <StatCard
                title={t('stats.completedAlarms')}
                value={weeklyStats.completedAlarms}
                icon="alarm-check"
                color="#4CAF50"
              />
            </View>

            {/* Progress Bar */}
            <Surface style={[styles.progressCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
              <View style={styles.progressHeader}>
                <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                  {t('stats.wakeUpSuccess')}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                  {Math.round(weeklyStats.successRate)}%
                </Text>
              </View>
              <ProgressBar
                progress={weeklyStats.successRate / 100}
                color={theme.colors.primary}
                style={styles.progressBar}
              />
            </Surface>

            {/* Streak */}
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              {t('stats.streaks')}
            </Text>

            <View style={styles.statsRow}>
              <StatCard
                title={t('stats.currentStreak')}
                value={currentStreak}
                subtitle={t('stats.days')}
                icon="fire"
                color="#FF6B6B"
              />
              <StatCard
                title={t('stats.bestStreak')}
                value={bestStreak}
                subtitle={t('stats.days')}
                icon="trophy"
                color="#FFD93D"
              />
            </View>

            {/* Current Difficulty */}
            <Surface style={[styles.difficultyCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
              <View style={styles.difficultyContent}>
                <MaterialCommunityIcons
                  name="speedometer"
                  size={32}
                  color={theme.colors.primary}
                />
                <View style={styles.difficultyText}>
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {t('stats.currentDifficulty')}
                  </Text>
                  <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                    {getDifficultyLabel()}
                  </Text>
                </View>
              </View>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                {t('stats.difficultyAuto')}
              </Text>
            </Surface>

            {/* Monthly Stats */}
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              {t('stats.thisMonth')}
            </Text>

            <View style={styles.statsRow}>
              <StatCard
                title={t('stats.totalAlarms')}
                value={monthlyStats.totalAlarms}
                icon="calendar-month"
                color={theme.colors.primary}
              />
              <StatCard
                title={t('stats.wakeUpSuccess')}
                value={`${Math.round(monthlyStats.successRate)}%`}
                icon="percent"
                color="#4CAF50"
              />
            </View>
          </>
        )}
      </ScrollView>

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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontWeight: '600',
    marginTop: 4,
  },
  progressCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  difficultyCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  difficultyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyText: {
    marginLeft: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
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
