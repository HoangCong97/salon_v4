import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";

type MessageCallback = (event: string, data: any) => void;

class WebSocketService {
  private static instance: WebSocketService | null = null;
  private ws: WebSocket | null = null;
  private listeners: Set<MessageCallback> = new Set();
  private reconnectTimeout: any = null;
  private url: string = "ws://localhost:3000";

  private constructor() {
    this.connect();
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public updateTenant(tenantId: string | null) {
    const newUrl = tenantId ? `ws://localhost:3000?tenantId=${tenantId}` : `ws://localhost:3000`;
    if (this.url === newUrl && this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return; // No need to reconnect
    }

    this.url = newUrl;
    console.log("Updating WebSocket tenant URL and reconnecting:", this.url);

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.connect();
  }

  private connect() {
    if (this.ws) {
      try {
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.close();
      } catch (e) {}
    }

    console.log("Connecting to WebSocket:", this.url);
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("✅ WebSocket connection established successfully.");
    };

    this.ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload && payload.event) {
          this.listeners.forEach((callback) => {
            try {
              callback(payload.event, payload.data);
            } catch (err) {
              console.error("Error in WebSocket subscriber callback:", err);
            }
          });
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    this.ws.onclose = () => {
      console.log("WebSocket connection closed. Retrying in 5 seconds...");
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.ws?.close();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 5000);
  }

  public subscribe(callback: MessageCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

/**
 * Custom React hook to subscribe to real-time WebSocket events.
 * 
 * @param onMessage Optional callback function called when a message is received
 */
export const useWebSocket = (onMessage?: MessageCallback) => {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;
  const currentTenantId = useAuthStore((state) => state.currentTenantId);

  useEffect(() => {
    const wsService = WebSocketService.getInstance();
    wsService.updateTenant(currentTenantId);
  }, [currentTenantId]);

  useEffect(() => {
    if (!onMessageRef.current) return;
    
    const wsService = WebSocketService.getInstance();
    const unsubscribe = wsService.subscribe((event, data) => {
      if (onMessageRef.current) {
        onMessageRef.current(event, data);
      }
    });
    
    return unsubscribe;
  }, []);
};
