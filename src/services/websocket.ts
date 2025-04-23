const BASE_WS_URL = process.env.NODE_ENV === 'production' 
  ? 'wss://api.adpot.win/ws'
  : 'ws://localhost:3001/ws';

const RECONNECT_DELAY = 3000;
const MAX_RETRIES = 5;
const BASE_DELAY = 1000; // Start with 1 second delay

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private messageQueue: any[] = [];
  private listeners: Map<string, Function[]> = new Map();
  private subscribers: Map<string, Function[]> = new Map();
  private isOffline = false;
  private mockMode = process.env.NODE_ENV === 'development';
  private subscriptions: Map<string, Function[]> = new Map();

  connect() {
    if (this.mockMode) {
      console.log('WebSocket running in mock mode');
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(BASE_WS_URL);
      this.setupListeners();
    } catch (error) {
      console.log('WebSocket connection failed, using mock mode');
      this.mockMode = true;
    }
  }

  send(type: string, payload: any) {
    const message = JSON.stringify({ type, payload });
    
    if (this.isOffline) {
      console.log('Message queued (offline):', type, payload);
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  subscribe(type: string, callback: Function) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)?.push(callback);

    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, []);
    }
    this.subscribers.get(type)?.push(callback);
  }

  unsubscribe(type: string, callback: Function) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      this.listeners.set(type, callbacks.filter(cb => cb !== callback));
    }
  }

  private processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.ws?.send(message);
    }
  }

  private notifyListeners(type: string, payload: any) {
    const callbacks = this.listeners.get(type);
    callbacks?.forEach(callback => callback(payload));
  }

  private calculateRetryDelay(): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return Math.min(BASE_DELAY * Math.pow(2, this.reconnectAttempts), 16000);
  }

  private handleDisconnect() {
    if (this.reconnectAttempts < MAX_RETRIES) {
      const delay = this.calculateRetryDelay();
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${MAX_RETRIES})`);
      
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    } else {
      this.emitConnectionStatus('failed');
    }
  }

  private emitConnectionStatus(status: 'connected' | 'disconnected' | 'failed') {
    this.notifyListeners('connection_status', status);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.emitConnectionStatus('disconnected');
    }
  }
}

export const wsService = new WebSocketService();
