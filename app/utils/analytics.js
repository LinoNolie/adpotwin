import AsyncStorage from '@react-native-async-storage/async-storage';

class AnalyticsManager {
  constructor() {
    this.events = [];
    this.batchSize = 10;
    this.flushInterval = 30000; // 30 seconds
    this.initializeFlushInterval();
  }

  initializeFlushInterval() {
    setInterval(() => this.flush(), this.flushInterval);
  }

  async trackEvent(eventName, data = {}) {
    const event = {
      eventName,
      timestamp: Date.now(),
      data,
      userId: await this.getUserId(),
      sessionId: await this.getSessionId(),
    };

    this.events.push(event);
    if (this.events.length >= this.batchSize) {
      await this.flush();
    }
  }

  async getUserId() {
    return await AsyncStorage.getItem('userId');
  }

  async getSessionId() {
    let sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = Date.now().toString();
      await AsyncStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  async flush() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      await fetch('https://adpot.win/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventsToSend),
      });
    } catch (error) {
      console.error('Analytics flush error:', error);
      // Return events to queue
      this.events = [...eventsToSend, ...this.events];
    }
  }

  // Predefined event trackers
  async trackGameStart(potId, betAmount) {
    await this.trackEvent('game_start', { potId, betAmount });
  }

  async trackGameEnd(potId, result, multiplier) {
    await this.trackEvent('game_end', { potId, result, multiplier });
  }

  async trackCashout(potId, amount, multiplier) {
    await this.trackEvent('cashout', { potId, amount, multiplier });
  }

  async trackError(errorType, errorMessage, metadata = {}) {
    await this.trackEvent('error', { 
      type: errorType, 
      message: errorMessage,
      ...metadata
    });
  }

  async trackNavigation(screenName, params = {}) {
    await this.trackEvent('navigation', { screenName, params });
  }
}

export const analytics = new AnalyticsManager();