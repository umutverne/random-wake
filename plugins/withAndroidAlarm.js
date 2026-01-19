const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidAlarm(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults.manifest;

    // Add uses-permission for alarm-related permissions
    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    const permissions = [
      'android.permission.USE_FULL_SCREEN_INTENT',
      'android.permission.WAKE_LOCK',
      'android.permission.DISABLE_KEYGUARD',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
      'android.permission.SYSTEM_ALERT_WINDOW',
    ];

    permissions.forEach((permission) => {
      if (!manifest['uses-permission'].find(p => p.$?.['android:name'] === permission)) {
        manifest['uses-permission'].push({
          $: { 'android:name': permission },
        });
      }
    });

    // Find MainActivity and add flags for showing over lock screen
    const application = manifest.application?.[0];
    if (application?.activity) {
      const mainActivity = application.activity.find(
        (activity) => activity.$?.['android:name'] === '.MainActivity'
      );

      if (mainActivity) {
        // Add attributes for showing over lock screen
        mainActivity.$['android:showWhenLocked'] = 'true';
        mainActivity.$['android:turnScreenOn'] = 'true';
        mainActivity.$['android:showOnLockScreen'] = 'true';
        mainActivity.$['android:launchMode'] = 'singleTask';
      }
    }

    return config;
  });
};
