import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useHaptics } from './useHaptics';
import { logger } from '../utils/logger';
import { analytics } from '../utils/analytics';

export function useAutoCashout(
  currentMultiplier,
  onCashout,
  isPlaying = false
) {
  const { settings } = useSettings();
  const haptics = useHaptics();
  const [isEnabled, setIsEnabled] = useState(settings.autoCashoutEnabled);
  const [targetMultiplier, setTargetMultiplier] = useState(settings.autoCashoutMultiplier);
  const lastCashoutAttempt = useRef(null);
  const cashoutTimeout = useRef(null);

  useEffect(() => {
    if (isPlaying && isEnabled && currentMultiplier >= targetMultiplier) {
      executeCashout();
    }
    
    return () => {
      if (cashoutTimeout.current) {
        clearTimeout(cashoutTimeout.current);
      }
    };
  }, [currentMultiplier, isPlaying, isEnabled, targetMultiplier]);

  const executeCashout = useCallback(async () => {
    // Prevent multiple cashout attempts in quick succession
    if (
      lastCashoutAttempt.current &&
      Date.now() - lastCashoutAttempt.current < 1000
    ) {
      return;
    }

    lastCashoutAttempt.current = Date.now();

    try {
      haptics.onCashout();
      await onCashout();

      analytics.trackEvent('auto_cashout_success', {
        multiplier: currentMultiplier,
        targetMultiplier,
      });

      logger.info('Auto cashout executed', {
        multiplier: currentMultiplier,
        targetMultiplier,
      });
    } catch (error) {
      logger.error('Auto cashout failed:', error);
      
      analytics.trackEvent('auto_cashout_failed', {
        multiplier: currentMultiplier,
        targetMultiplier,
        error: error.message,
      });

      // Retry cashout once after a short delay
      cashoutTimeout.current = setTimeout(() => {
        onCashout().catch(retryError => {
          logger.error('Auto cashout retry failed:', retryError);
        });
      }, 100);
    }
  }, [currentMultiplier, targetMultiplier, onCashout, haptics]);

  const setAutoCashout = useCallback((enabled, multiplier = targetMultiplier) => {
    setIsEnabled(enabled);
    setTargetMultiplier(multiplier);

    analytics.trackEvent('auto_cashout_settings_changed', {
      enabled,
      multiplier,
    });
  }, [targetMultiplier]);

  const updateTargetMultiplier = useCallback((multiplier) => {
    setTargetMultiplier(multiplier);
    
    analytics.trackEvent('auto_cashout_multiplier_changed', {
      multiplier,
    });
  }, []);

  return {
    isEnabled,
    targetMultiplier,
    setAutoCashout,
    updateTargetMultiplier,
  };
}