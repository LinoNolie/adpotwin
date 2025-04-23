import { useCallback } from 'react';
import { Vibration } from 'react-native';
import Sound from 'react-native-sound';
import { useSettings } from '../contexts/SettingsContext';

Sound.setCategory('Playback');

const sounds = {
  bet: new Sound('bet.mp3', Sound.MAIN_BUNDLE),
  win: new Sound('win.mp3', Sound.MAIN_BUNDLE),
  lose: new Sound('lose.mp3', Sound.MAIN_BUNDLE),
  tick: new Sound('tick.mp3', Sound.MAIN_BUNDLE),
  cashout: new Sound('cashout.mp3', Sound.MAIN_BUNDLE),
};

export function useGameFeedback() {
  const { settings } = useSettings();

  const playSound = useCallback((soundName) => {
    if (!settings.soundEnabled) return;

    const sound = sounds[soundName];
    if (sound) {
      sound.play((success) => {
        if (!success) {
          console.error(`Failed to play sound: ${soundName}`);
        }
      });
    }
  }, [settings.soundEnabled]);

  const vibrate = useCallback((pattern) => {
    if (!settings.vibrationEnabled) return;

    if (typeof pattern === 'number') {
      Vibration.vibrate(pattern);
    } else {
      Vibration.vibrate(pattern || 100);
    }
  }, [settings.vibrationEnabled]);

  const onBetPlaced = useCallback(() => {
    playSound('bet');
    vibrate(200);
  }, [playSound, vibrate]);

  const onMultiplierTick = useCallback(() => {
    playSound('tick');
    vibrate(50);
  }, [playSound, vibrate]);

  const onCashout = useCallback(() => {
    playSound('cashout');
    vibrate([100, 50, 100]);
  }, [playSound, vibrate]);

  const onWin = useCallback(() => {
    playSound('win');
    vibrate([100, 200, 100, 200, 100]);
  }, [playSound, vibrate]);

  const onLose = useCallback(() => {
    playSound('lose');
    vibrate(500);
  }, [playSound, vibrate]);

  const cleanup = useCallback(() => {
    Object.values(sounds).forEach(sound => {
      sound.release();
    });
  }, []);

  return {
    onBetPlaced,
    onMultiplierTick,
    onCashout,
    onWin,
    onLose,
    cleanup
  };
}