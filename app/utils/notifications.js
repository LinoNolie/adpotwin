import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationManager {
  constructor() {
    this.notificationListeners = new Set();
    this.queue = [];
    this.isProcessing = false;
  }

  async init() {
    try {
      const hasPermission = await this.requestPermissions();
      if (hasPermission) {
        await this.setupNotifications();
      }
    } catch (error) {
      console.error('Notification initialization error:', error);
    }
  }

  async requestPermissions() {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
    }
    return true;
  }

  async setupNotifications() {
    this.deviceToken = await AsyncStorage.getItem('deviceToken');
    if (!this.deviceToken) {
      this.deviceToken = await this.registerDevice();
      await AsyncStorage.setItem('deviceToken', this.deviceToken);
    }
  }

  addListener(callback) {
    this.notificationListeners.add(callback);
    return () => this.notificationListeners.delete(callback);
  }

  showAlert(title, message, buttons = []) {
    return new Promise((resolve) => {
      Alert.alert(
        title,
        message,
        buttons.length > 0 ? buttons : [{ text: 'OK', onPress: () => resolve() }]
      );
    });
  }

  async showGameNotification(data) {
    const { title, message, gameId } = data;
    this.queue.push({
      type: 'game',
      title,
      message,
      gameId,
      timestamp: Date.now()
    });
    await this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    const notification = this.queue.shift();
    
    try {
      this.notificationListeners.forEach(listener => listener(notification));
      
      if (notification.type === 'game') {
        await this.showAlert(notification.title, notification.message);
      }
    } catch (error) {
      console.error('Error processing notification:', error);
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) {
        await this.processQueue();
      }
    }
  }
}

export const notifications = new NotificationManager();