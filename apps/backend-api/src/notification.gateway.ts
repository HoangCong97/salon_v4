import { WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from "@nestjs/websockets";
import { Server, WebSocket } from "ws";
import { IncomingMessage } from "http";

@WebSocketGateway({ cors: true })
export class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // Map of tenantId -> Set of WebSockets
  private tenantClients: Map<string, Set<WebSocket>> = new Map();
  // Map of WebSocket -> tenantId (for quick lookup during disconnect)
  private clientTenants: Map<WebSocket, string> = new Map();

  afterInit(server: Server) {
    console.log("🚀 Notification WebSocket Gateway initialized.");
  }

  handleConnection(client: WebSocket, request: IncomingMessage) {
    let tenantId: string | null = null;
    if (request && request.url) {
      try {
        const url = new URL(request.url, "http://localhost");
        tenantId = url.searchParams.get("tenantId");
      } catch (err) {
        console.error("Failed to parse request URL in handleConnection:", err);
      }
    }

    if (tenantId) {
      if (!this.tenantClients.has(tenantId)) {
        this.tenantClients.set(tenantId, new Set());
      }
      this.tenantClients.get(tenantId)!.add(client);
      this.clientTenants.set(client, tenantId);
      console.log(`🔌 Client connected to tenant: ${tenantId}. Total tenant clients: ${this.tenantClients.get(tenantId)!.size}`);
    } else {
      console.log(`🔌 Client connected without tenantId.`);
    }
    
    // Gửi phản hồi chào mừng
    client.send(
      JSON.stringify({
        event: "system.welcome",
        data: { message: "Connected to Admin Notification System", time: new Date().toISOString() }
      })
    );
  }

  handleDisconnect(client: WebSocket) {
    const tenantId = this.clientTenants.get(client);
    if (tenantId) {
      const clients = this.tenantClients.get(tenantId);
      if (clients) {
        clients.delete(client);
        if (clients.size === 0) {
          this.tenantClients.delete(tenantId);
        }
      }
      this.clientTenants.delete(client);
      console.log(`❌ Client disconnected from tenant: ${tenantId}.`);
    } else {
      console.log(`❌ Client disconnected (no tenantId).`);
    }
  }

  /**
   * Phát đi thông báo tới tất cả các client thuộc 1 tenant cụ thể
   */
  broadcastToTenant(tenantId: string, event: string, data: any) {
    console.log(`📢 Broadcasting event "${event}" to tenant "${tenantId}":`, data);
    const clients = this.tenantClients.get(tenantId);
    if (!clients) return;

    const payload = JSON.stringify({ event, data });
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(payload);
        } catch (error) {
          console.error(`Failed to send message to client in tenant ${tenantId}:`, error);
        }
      }
    }
  }

  /**
   * Phát đi thông báo tới tất cả các client đang kết nối (ví dụ: các trang Dashboard, Subscriptions của internal-admin)
   */
  broadcast(event: string, data: any) {
    console.log(`📢 Broadcasting system-wide event: ${event}`, data);
    const payload = JSON.stringify({ event, data });
    
    for (const client of this.clientTenants.keys()) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(payload);
        } catch (error) {
          console.error("Failed to send message to client:", error);
        }
      }
    }
  }
}
