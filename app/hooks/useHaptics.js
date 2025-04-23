import { useCallback } from 'react';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useSettings } from '../contexts/SettingsContext';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false
};

const hapticPatterns = {
  bet: 'impactMedium',
  win: 'success',
  lose: 'error',
  cashout: 'impactHeavy',
  warning: 'warning',
  selection: 'selection',
  notification: 'soft'
};

export function useHaptics() {
  const { settings } = useSettings();

  const trigger = useCallback((pattern) => {
    if (!settings.hapticsEnabled) return;

    try {
      ReactNativeHapticFeedback.trigger(
        hapticPatterns[pattern] || pattern,
        options
      );
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }, [settings.hapticsEnabled]);

  const onBet = useCallback(() => {
    trigger('bet');
  }, [trigger]);

  const onWin = useCallback(() => {
    trigger('win');
  }, [trigger]);

  const onLose = useCallback(() => {
    trigger('lose');
  }, [trigger]);

  const onCashout = useCallback(() => {
    trigger('cashout');
  }, [trigger]);

  const onWarning = useCallback(() => {
    trigger('warning');
  }, [trigger]);

  const onSelection = useCallback(() => {
    trigger('selection');
  }, [trigger]);

  const onNotification = useCallback(() => {
    trigger('notification');
  }, [trigger]);

  const vibrate = useCallback((pattern = 'default') => {
    if (!settings.hapticsEnabled) return;

    const patterns = {
      default: [100],
      double: [100, 100, 100],
      long: [500],
      warning: [100, 100, 100, 100, 100],
      success: [100, 50, 100, 50, 100],
      error: [500, 100, 500]
    };

    try {
      ReactNativeHapticFeedback.trigger('impactHeavy', {
        ...options,
        enableVibrateFallback: true,
        customVibratePattern: patterns[pattern] || patterns.default
      });
    } catch (error) {
      console.error('Vibration error:', error);
    }
  }, [settings.hapticsEnabled]);

  return {
    trigger,
    vibrate,
    onBet,
    onWin,
    onLose,
    onCashout,
    onWarning,
    onSelection,
    onNotification,
    enabled: settings.hapticsEnabled
  };
}