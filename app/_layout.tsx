import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useAlarmStore } from '../src/stores/alarmStore';
import { getTheme } from '../src/theme';
import { requestPermissions, addNotificationResponseListener, addNotificationReceivedListener } from '../src/services/notificationService';
import { configureAudio, playAlarmSound, getAlarmSoundUrl } from '../src/services/soundService';
import { loadInterstitialAd } from '../src/services/adService';
import '../src/i18n';

export default function RootLayout() {
  const theme = useSettingsStore((state) => state.theme);
  const vibrationEnabled = useSettingsStore((state) => state.vibrationEnabled);
  const gradualVolumeEnabled = useSettingsStore((state) => state.gradualVolumeEnabled);
  const alarms = useAlarmStore((state) => state.alarms);
  const appTheme = getTheme(theme);
  const router = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  // Helper function to start alarm sound immediately
  const startAlarmSound = async (alarmId: string) => {
    const alarm = alarms.find(a => a.id === alarmId);
    const soundUrl = alarm?.soundId ? getAlarmSoundUrl(alarm.soundId) : getAlarmSoundUrl('random');

    await playAlarmSound(soundUrl, {
      loop: true,
      vibrate: vibrationEnabled,
      gradualVolume: gradualVolumeEnabled,
    });
  };

  useEffect(() => {
    // Request notification permissions on app start
    requestPermissions();

    // Configure audio for alarm playback
    configureAudio();

    // Load interstitial ad
    loadInterstitialAd();

    // Handle notifications received while app is in foreground
    notificationListener.current = addNotificationReceivedListener(async (notification) => {
      const data = notification.request.content.data;
      if (data?.type === 'alarm' && data?.alarmId) {
        // Start alarm sound immediately
        await startAlarmSound(data.alarmId as string);

        // Navigate to alarm ring screen
        router.push({
          pathname: '/alarm/ring',
          params: { alarmId: data.alarmId as string },
        });
      }
    });

    // Handle notification tap (when user taps on notification)
    responseListener.current = addNotificationResponseListener(async (response) => {
      const data = response.notification.request.content.data;
      if (data?.type === 'alarm' && data?.alarmId) {
        // Start alarm sound immediately
        await startAlarmSound(data.alarmId as string);

        // Navigate to alarm ring screen
        router.push({
          pathname: '/alarm/ring',
          params: { alarmId: data.alarmId as string },
        });
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router, alarms, vibrationEnabled, gradualVolumeEnabled]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={appTheme}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: appTheme.colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="alarm/create"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="alarm/[id]"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="alarm/ring"
            options={{
              presentation: 'fullScreenModal',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="task/math"
            options={{
              presentation: 'fullScreenModal',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="task/typing"
            options={{
              presentation: 'fullScreenModal',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="task/sequence"
            options={{
              presentation: 'fullScreenModal',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="task/shake"
            options={{
              presentation: 'fullScreenModal',
              gestureEnabled: false,
            }}
          />
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
