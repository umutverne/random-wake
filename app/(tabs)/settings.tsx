import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, useTheme, Switch, List, Divider, Portal, Dialog, RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../../src/stores/settingsStore';
import type { AppTheme } from '../../src/theme';
import type { Language, TaskType } from '../../src/types';
import Constants from 'expo-constants';
import { BannerAd } from '../../src/components/BannerAd';

const TASK_TYPES: TaskType[] = ['math', 'typing', 'sequence', 'shake'];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme<AppTheme>();
  const insets = useSafeAreaInsets();

  const settings = useSettingsStore();

  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const [taskTypeDialogVisible, setTaskTypeDialogVisible] = useState(false);

  const handleThemeChange = () => {
    settings.setTheme(settings.theme === 'dark' ? 'light' : 'dark');
  };

  const handleLanguageSelect = (lang: Language) => {
    settings.setLanguage(lang);
    setLanguageDialogVisible(false);
  };

  const handleTaskTypeSelect = (type: TaskType) => {
    settings.setDefaultTaskType(type);
    setTaskTypeDialogVisible(false);
  };

  const handleVibrationToggle = () => {
    settings.setVibrationEnabled(!settings.vibrationEnabled);
  };

  const handleGradualVolumeToggle = () => {
    settings.setGradualVolumeEnabled(!settings.gradualVolumeEnabled);
  };

  const getTaskTypeLabel = (type: TaskType) => {
    return t(`tasks.${type}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text variant="headlineLarge" style={{ color: theme.colors.onBackground }}>
          {t('settings.title')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          {t('settings.appearance')}
        </Text>

        <Surface style={[styles.section, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
          <List.Item
            title={t('settings.theme')}
            description={settings.theme === 'dark' ? t('settings.darkTheme') : t('settings.lightTheme')}
            left={(props) => (
              <List.Icon
                {...props}
                icon={settings.theme === 'dark' ? 'weather-night' : 'weather-sunny'}
                color={theme.colors.primary}
              />
            )}
            right={() => (
              <Switch
                value={settings.theme === 'dark'}
                onValueChange={handleThemeChange}
                color={theme.colors.primary}
              />
            )}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />

          <Divider style={{ backgroundColor: theme.colors.outline }} />

          <List.Item
            title={t('settings.language')}
            description={settings.language === 'tr' ? t('settings.turkish') : t('settings.english')}
            left={(props) => (
              <List.Icon {...props} icon="translate" color={theme.colors.primary} />
            )}
            onPress={() => setLanguageDialogVisible(true)}
            right={() => (
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            )}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
        </Surface>

        {/* Alarm Settings Section */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          {t('settings.alarmSettings')}
        </Text>

        <Surface style={[styles.section, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
          <List.Item
            title={t('settings.vibration')}
            left={(props) => (
              <List.Icon {...props} icon="vibrate" color={theme.colors.primary} />
            )}
            right={() => (
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={handleVibrationToggle}
                color={theme.colors.primary}
              />
            )}
            titleStyle={{ color: theme.colors.onSurface }}
          />

          <Divider style={{ backgroundColor: theme.colors.outline }} />

          <List.Item
            title={t('settings.gradualVolume')}
            description={t('settings.gradualVolumeDesc')}
            left={(props) => (
              <List.Icon {...props} icon="volume-plus" color={theme.colors.primary} />
            )}
            right={() => (
              <Switch
                value={settings.gradualVolumeEnabled}
                onValueChange={handleGradualVolumeToggle}
                color={theme.colors.primary}
              />
            )}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
        </Surface>

        {/* Defaults Section */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          {t('settings.defaults')}
        </Text>

        <Surface style={[styles.section, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
          <List.Item
            title={t('settings.defaultTask')}
            description={getTaskTypeLabel(settings.defaultTaskType)}
            left={(props) => (
              <List.Icon {...props} icon="puzzle" color={theme.colors.primary} />
            )}
            onPress={() => setTaskTypeDialogVisible(true)}
            right={() => (
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            )}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
        </Surface>

        {/* About Section */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          {t('settings.about')}
        </Text>

        <Surface style={[styles.section, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
          <List.Item
            title="RandomWake"
            description={`${t('settings.version')} ${Constants.expoConfig?.version || '1.0.0'}`}
            left={(props) => (
              <List.Icon {...props} icon="information" color={theme.colors.primary} />
            )}
            titleStyle={{ color: theme.colors.onSurface }}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          />
        </Surface>
      </ScrollView>

      {/* Language Dialog */}
      <Portal>
        <Dialog visible={languageDialogVisible} onDismiss={() => setLanguageDialogVisible(false)}>
          <Dialog.Title>{t('settings.language')}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={(value) => handleLanguageSelect(value as Language)} value={settings.language}>
              <RadioButton.Item label={t('settings.turkish')} value="tr" />
              <RadioButton.Item label={t('settings.english')} value="en" />
            </RadioButton.Group>
          </Dialog.Content>
        </Dialog>
      </Portal>

      {/* Task Type Dialog */}
      <Portal>
        <Dialog visible={taskTypeDialogVisible} onDismiss={() => setTaskTypeDialogVisible(false)}>
          <Dialog.Title>{t('settings.defaultTask')}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={(value) => handleTaskTypeSelect(value as TaskType)} value={settings.defaultTaskType}>
              {TASK_TYPES.map((type) => (
                <RadioButton.Item
                  key={type}
                  label={getTaskTypeLabel(type)}
                  value={type}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
        </Dialog>
      </Portal>

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
  section: {
    borderRadius: 16,
    overflow: 'hidden',
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
