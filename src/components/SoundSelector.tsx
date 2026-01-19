import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Text, useTheme, Portal, Modal, Button, RadioButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Audio } from 'expo-av';
import { ALARM_SOUNDS, getAlarmSoundUrl, configureAudio } from '../services/soundService';
import type { AlarmSoundId } from '../types';
import type { AppTheme } from '../theme';

interface SoundSelectorProps {
  selectedSoundId: AlarmSoundId;
  onSoundChange: (soundId: AlarmSoundId) => void;
}

export const SoundSelector: React.FC<SoundSelectorProps> = ({
  selectedSoundId,
  onSoundChange,
}) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme<AppTheme>();
  const [showModal, setShowModal] = useState(false);
  const [previewSound, setPreviewSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const getSoundName = (soundId: AlarmSoundId): string => {
    if (soundId === 'random') {
      return t('sounds.random');
    }
    const sound = ALARM_SOUNDS.find(s => s.id === soundId);
    return sound ? (i18n.language === 'tr' ? sound.name : sound.nameEn) : soundId;
  };

  const handlePreview = async (soundId: string) => {
    try {
      // Stop any playing sound
      if (previewSound) {
        await previewSound.stopAsync();
        await previewSound.unloadAsync();
        setPreviewSound(null);
      }

      if (playingId === soundId) {
        setPlayingId(null);
        return;
      }

      setLoadingId(soundId);

      // Configure audio mode before playing
      await configureAudio();

      const soundUrl = getAlarmSoundUrl(soundId as AlarmSoundId);
      const { sound } = await Audio.Sound.createAsync(
        { uri: soundUrl },
        { shouldPlay: true }
      );

      setPreviewSound(sound);
      setPlayingId(soundId);
      setLoadingId(null);

      // Auto stop after 3 seconds
      setTimeout(async () => {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
          setPlayingId(null);
          setPreviewSound(null);
        } catch {}
      }, 3000);
    } catch (error) {
      console.error('Error previewing sound:', error);
      setLoadingId(null);
      setPlayingId(null);
    }
  };

  const handleClose = async () => {
    if (previewSound) {
      try {
        await previewSound.stopAsync();
        await previewSound.unloadAsync();
      } catch {}
      setPreviewSound(null);
      setPlayingId(null);
    }
    setShowModal(false);
  };

  const handleSelect = (soundId: AlarmSoundId) => {
    onSoundChange(soundId);
  };

  return (
    <>
      <Pressable onPress={() => setShowModal(true)}>
        <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View style={styles.row}>
            <MaterialCommunityIcons
              name={selectedSoundId === 'random' ? 'shuffle-variant' : 'music-note'}
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.textContainer}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {t('sounds.alarmSound')}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {getSoundName(selectedSoundId)}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
        </View>
      </Pressable>

      <Portal>
        <Modal
          visible={showModal}
          onDismiss={handleClose}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            {t('sounds.selectAlarmSound')}
          </Text>

          <ScrollView style={styles.soundList} showsVerticalScrollIndicator={false}>
            {/* Random option */}
            <Pressable
              onPress={() => handleSelect('random')}
              style={[
                styles.soundItem,
                selectedSoundId === 'random' && { backgroundColor: theme.colors.primaryContainer },
              ]}
            >
              <RadioButton
                value="random"
                status={selectedSoundId === 'random' ? 'checked' : 'unchecked'}
                onPress={() => handleSelect('random')}
                color={theme.colors.primary}
              />
              <MaterialCommunityIcons
                name="shuffle-variant"
                size={20}
                color={theme.colors.primary}
                style={styles.soundIcon}
              />
              <Text style={[styles.soundName, { color: theme.colors.onSurface }]}>
                {t('sounds.random')}
              </Text>
              <Text style={[styles.soundDesc, { color: theme.colors.onSurfaceVariant }]}>
                {t('sounds.randomDesc')}
              </Text>
            </Pressable>

            {/* Sound options */}
            {ALARM_SOUNDS.map((sound) => (
              <Pressable
                key={sound.id}
                onPress={() => handleSelect(sound.id as AlarmSoundId)}
                style={[
                  styles.soundItem,
                  selectedSoundId === sound.id && { backgroundColor: theme.colors.primaryContainer },
                ]}
              >
                <RadioButton
                  value={sound.id}
                  status={selectedSoundId === sound.id ? 'checked' : 'unchecked'}
                  onPress={() => handleSelect(sound.id as AlarmSoundId)}
                  color={theme.colors.primary}
                />
                <Text style={[styles.soundName, { color: theme.colors.onSurface, flex: 1 }]}>
                  {i18n.language === 'tr' ? sound.name : sound.nameEn}
                </Text>
                <Pressable
                  onPress={() => handlePreview(sound.id)}
                  style={[styles.playButton, { backgroundColor: theme.colors.surfaceVariant }]}
                  disabled={loadingId === sound.id}
                >
                  {loadingId === sound.id ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <MaterialCommunityIcons
                      name={playingId === sound.id ? 'stop' : 'play'}
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </Pressable>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.modalButtons}>
            <Button onPress={handleClose} mode="contained">
              {t('common.ok')}
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  soundList: {
    maxHeight: 400,
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  soundIcon: {
    marginLeft: 8,
  },
  soundName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  soundDesc: {
    fontSize: 12,
    marginLeft: 8,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  modalButtons: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
});
