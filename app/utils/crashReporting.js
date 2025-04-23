import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { analytics } from './analytics';

class CrashReporter {
  constructor() {
    this.crashLogs = [];
    this.maxLogs = 50;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      const savedLogs = await AsyncStorage.getItem('crashLogs');
      if (savedLogs) {
        this.crashLogs = JSON.parse(savedLogs);
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize crash reporter:', error);
    }
  }

  async logError(error, context = {}) {
    if (!this.initialized) await this.init();

    const errorLog = {
      timestamp: Date.now(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      device: {
        platform: Platform.OS,
        version: Platform.Version,
        brand: await DeviceInfo.getBrand(),
        model: await DeviceInfo.getModel(),
        appVersion: await DeviceInfo.getVersion(),
        buildNumber: await DeviceInfo.getBuildNumber(),
      },
      context,
    };

    this.crashLogs.unshift(errorLog);
    if (this.crashLogs.length > this.maxLogs) {
      this.crashLogs = this.crashLogs.slice(0, this.maxLogs);
    }

    try {
      await AsyncStorage.setItem('crashLogs', JSON.stringify(this.crashLogs));
      await this.reportError(errorLog);
    } catch (e) {
      console.error('Failed to save crash log:', e);
    }
  }

  async reportError(errorLog) {
    try {
      const response = await fetch('https://adpot.win/api/crash-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog),
      });

      if (!response.ok) {
        throw new Error('Failed to send crash report');
      }

      analytics.trackError('crash_report', errorLog.error.message, {
        errorName: errorLog.error.name,
        platform: errorLog.device.platform,
      });
    } catch (error) {
      console.error('Failed to report crash:', error);
    }
  }

  async getCrashLogs() {
    if (!this.initialized) await this.init();
    return this.crashLogs;
  }

  async clearCrashLogs() {
    this.crashLogs = [];
    try {
      await AsyncStorage.removeItem('crashLogs');
    } catch (error) {
      console.error('Failed to clear crash logs:', error);
    }
  }
}

export const crashReporter = new CrashReporter();