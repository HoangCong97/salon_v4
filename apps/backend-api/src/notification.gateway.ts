import { WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from "@nestjs/websockets";
import { Server, WebSocket } from "ws";

@WebSocketGateway({ cors: true })
export class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private clients: Set<WebSocket> = new Set();

  afterInit(server: Server) {
    console.log("🚀 Notification WebSocket Gateway initialized.");
  }

  handleConnection(client: WebSocket) {
    this.clients.add(client);
    console.log(`🔌 Client connected. Total clients: ${this.clients.size}`);
    
    // Gửi phản hồi chào mừng
    client.send(
      JSON.stringify({
        event: "system.welcome",
        data: { message: "Connected to Admin Notification System", time: new Date().toISOString() }
      })
    );
  }

  handleDisconnect(client: WebSocket) {
    this.clients.delete(client);
    console.log(`❌ Client disconnected. Total clients: ${this.clients.size}`);
  }

  /**
   * Phát đi thông báo tới tất cả các client đang kết nối (ví dụ: các trang Dashboard, Subscriptions của internal-admin)
   */
  broadcast(event: string, data: any) {
    console.log(`📢 Broadcasting event: ${event}`, data);
    const payload = JSON.stringify({ event, data });
    
    for (const client of this.clients) {
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
