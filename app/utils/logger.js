import { crashReporter } from './crashReporting';
import { analytics } from './analytics';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const LOG_STORAGE_KEY = '@app_logs';
const MAX_LOGS = 1000;

class Logger {
  constructor() {
    this.logs = [];
    this.listeners = new Set();
    this.currentLevel = __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;
  }

  async initialize() {
    try {
      const storedLogs = await AsyncStorage.getItem(LOG_STORAGE_KEY);
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  }

  setLogLevel(level) {
    this.currentLevel = LOG_LEVELS[level] || LOG_LEVELS.INFO;
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(log) {
    this.listeners.forEach(listener => listener(log));
  }

  async persistLogs() {
    try {
      await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to persist logs:', error);
    }
  }

  createLog(level, message, data) {
    const log = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      platform: Platform.OS,
      version: Platform.Version,
      isDev: __DEV__
    };

    this.logs.unshift(log);
    if (this.logs.length > MAX_LOGS) {
      this.logs.pop();
    }

    this.notifyListeners(log);
    this.persistLogs();

    return log;
  }

  debug(message, data) {
    if (this.currentLevel <= LOG_LEVELS.DEBUG) {
      const log = this.createLog('DEBUG', message, data);
      if (__DEV__) {
        console.log('[DEBUG]', message, data);
      }
      return log;
    }
  }

  info(message, data) {
    if (this.currentLevel <= LOG_LEVELS.INFO) {
      const log = this.createLog('INFO', message, data);
      if (__DEV__) {
        console.info('[INFO]', message, data);
      }
      return log;
    }
  }

  warn(message, data) {
    if (this.currentLevel <= LOG_LEVELS.WARN) {
      const log = this.createLog('WARN', message, data);
      if (__DEV__) {
        console.warn('[WARN]', message, data);
      }
      return log;
    }
  }

  error(message, error, extraData = {}) {
    if (this.currentLevel <= LOG_LEVELS.ERROR) {
      const errorData = {
        message: error?.message,
        stack: error?.stack,
        ...extraData
      };

      const log = this.createLog('ERROR', message, errorData);
      if (__DEV__) {
        console.error('[ERROR]', message, errorData);
      }
      return log;
    }
  }

  getLogs(level) {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return this.logs;
  }

  async clearLogs() {
    this.logs = [];
    try {
      await AsyncStorage.removeItem(LOG_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  async exportLogs() {
    return {
      logs: this.logs,
      exportTime: new Date().toISOString(),
      platform: Platform.OS,
      version: Platform.Version,
      isDev: __DEV__
    };
  }
}

export const logger = new Logger();