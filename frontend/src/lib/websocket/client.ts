/**
 * WebSocket client for real-time notifications.
 * Handles connection, reconnection, and message handling.
 */

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp: string;
}

export interface WebSocketConfig {
  url: string;
  userEmail: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isManualClose = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      ...config,
    };
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }

    this.isManualClose = false;
    const wsUrl = `${this.config.url}?user_email=${encodeURIComponent(this.config.userEmail)}`;

    console.log('[WebSocket] Connecting to:', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isManualClose = true;
    this.clearReconnectTimer();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    console.log('[WebSocket] Disconnected');
  }

  /**
   * Send message to server
   */
  send(message: string | object): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot send message - not connected');
      return;
    }

    const payload = typeof message === 'string' ? message : JSON.stringify(message);
    this.ws.send(payload);
  }

  /**
   * Send ping to keep connection alive
   */
  ping(): void {
    this.send('ping');
  }

  /**
   * Get connection state
   */
  getState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('[WebSocket] Connected');
      this.reconnectAttempts = 0;
      this.clearReconnectTimer();

      if (this.config.onConnect) {
        this.config.onConnect();
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('[WebSocket] Message received:', message);

        if (this.config.onMessage) {
          this.config.onMessage(message);
        }
      } catch (error) {
        // Handle non-JSON messages (like "pong")
        console.log('[WebSocket] Raw message:', event.data);
      }
    };

    this.ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);

      if (this.config.onError) {
        this.config.onError(error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('[WebSocket] Connection closed:', event.code, event.reason);

      if (this.config.onDisconnect) {
        this.config.onDisconnect();
      }

      // Attempt to reconnect if not manually closed
      if (!this.isManualClose) {
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 10)) {
      console.error('[WebSocket] Max reconnect attempts reached');
      return;
    }

    this.clearReconnectTimer();

    const delay = this.config.reconnectInterval || 5000;
    console.log(`[WebSocket] Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

/**
 * Create WebSocket client instance
 */
export function createWebSocketClient(config: WebSocketConfig): WebSocketClient {
  return new WebSocketClient(config);
}
