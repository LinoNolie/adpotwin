import { notifications } from './notifications';

class WebSocketManager {
  constructor() {
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(token) {
    this.token = token;
    this.createConnection();
  }

  createConnection() {
    this.ws = new WebSocket(`wss://adpot.win/ws?token=${this.token}`);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.emit('connection', { status: 'connected' });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    this.ws.onclose = () => {
      this.emit('connection', { status: 'disconnected' });
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      notifications.showAlert(
        'Connection Error',
        'Unable to connect to game server. Please try again later.'
      );
      return;
    }

    setTimeout(() => {
      this.reconnectAttempts++;
      this.createConnection();
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
  }

  handleMessage(data) {
    switch (data.type) {
      case 'pot_update':
        this.emit('pot_update', data.payload);
        break;
      case 'game_start':
        this.emit('game_start', data.payload);
        break;
      case 'game_end':
        this.emit('game_end', data.payload);
        break;
      case 'multiplier_update':
        this.emit('multiplier_update', data.payload);
        break;
      case 'player_cashout':
        this.emit('player_cashout', data.payload);
        break;
      default:
        console.warn('Unknown message type:', data.type);
    }
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }

  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  sendMessage(type, payload) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.listeners.clear();
    }
  }
}

export const websocket = new WebSocketManager();