import React, { useState } from "react";
import { Terminal, Shield, CheckCircle, AlertTriangle, Info, Calendar, Search } from "lucide-react";
import { formatDateVN } from "@salon/shared-utils";

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  ip: string;
  status: "SUCCESS" | "FAILED" | "WARN";
  path: string;
  payload: string;
}

const Logs: React.FC = () => {
  // Mock Logs
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [searchLog, setSearchLog] = useState("");

  const logs: AuditLog[] = [
    { id: "LOG-001", timestamp: "2026-06-23T10:30:15Z", actor: "Hoàng Admin", role: "Super Admin", action: "Duyệt thanh toán hóa đơn INV-2026-001", ip: "14.226.15.98", status: "SUCCESS", path: "POST /v1/billing/invoices/INV-2026-001/approve", payload: '{"invoiceId": "INV-2026-001", "approvedBy": "Hoàng Admin", "mrrAmount": 4794000}' },
    { id: "LOG-002", timestamp: "2026-06-23T10:15:22Z", actor: "Hệ thống", role: "Cron Job", action: "Đồng bộ hóa doanh thu ngày chi nhánh (sal_daily_branch_revenue)", ip: "127.0.0.1", status: "SUCCESS", path: "INTERNAL /jobs/sync-daily-revenue", payload: '{"syncedDate": "2026-06-22", "branchesProcessed": 5}' },
    { id: "LOG-003", timestamp: "2026-06-23T09:44:01Z", actor: "Thế Anh (Manager)", role: "Manager", action: "Thay đổi cấu hình SMS OTP API Twilio", ip: "27.72.105.14", status: "WARN", path: "PATCH /v1/settings/sms", payload: '{"updatedFields": ["sender"], "oldSender": "+1200000000", "newSender": "+1234567890"}' },
    { id: "LOG-004", timestamp: "2026-06-23T08:12:45Z", actor: "Khách vãng lai", role: "Guest", action: "Đăng nhập sai mật khẩu quá 5 lần (Tài khoản: tocviet@gmail.com)", ip: "113.161.45.19", status: "FAILED", path: "POST /v1/auth/login", payload: '{"email": "tocviet@gmail.com", "reason": "Wrong Password", "attempts": 5}' }
  ];

  const filteredLogs = logs.filter(l =>
    l.actor.toLowerCase().includes(searchLog.toLowerCase()) ||
    l.action.toLowerCase().includes(searchLog.toLowerCase()) ||
    l.path.toLowerCase().includes(searchLog.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Search and control filter console */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "10px", width: "100%" }}>
          <div style={{ position: "relative", width: "320px" }}>
            <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Tìm kiếm log theo hành động, đường dẫn..."
              value={searchLog}
              onChange={(e) => setSearchLog(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", fontSize: "13px" }}
            />
          </div>
          <button className="btn btn-secondary" onClick={() => setSelectedLog(null)} style={{ padding: "8px 16px" }}>
            Xóa Lọc
          </button>
        </div>
      </div>

      {/* Grid: 2 columns if log is selected, otherwise 1 column */}
      <div style={{ display: "grid", gridTemplateColumns: selectedLog ? "2fr 1.2fr" : "1fr", gap: "20px", transition: "all 0.2s ease" }}>
        
        {/* Audit logs table */}
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: "12px", overflow: "hidden" }}>
          <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", margin: 0 }}>
            <Terminal size={18} color="var(--color-primary)" />
            Nhật Ký Hành Động Hệ Thống
          </h3>
          
          <div className="data-table-container" style={{ border: "none", boxShadow: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Thời Gian</th>
                  <th>Tác Nhân</th>
                  <th>Đường Dẫn API</th>
                  <th>Hành Động</th>
                  <th>Địa Chỉ IP</th>
                  <th>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: selectedLog?.id === log.id ? "hsl(210, 40%, 95%)" : "transparent"
                    }}
                  >
                    <td style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                      {formatDateVN(log.timestamp)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{log.actor}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{log.role}</div>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {log.path}
                    </td>
                    <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {log.action}
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{log.ip}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: log.status === "SUCCESS" ? "var(--color-success-light)" : log.status === "FAILED" ? "var(--color-danger-light)" : "var(--color-warning-light)",
                          color: log.status === "SUCCESS" ? "var(--color-success)" : log.status === "FAILED" ? "var(--color-danger)" : "var(--color-warning)"
                        }}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Log JSON detail view card panel */}
        {selectedLog && (
          <div className="card animate-fade-in" style={{ display: "flex", flexDirection: "column", height: "fit-content" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Shield size={18} color="var(--color-primary)" />
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>Chi Tiết Giao Dịch API</h4>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  fontWeight: 500
                }}
              >
                Đóng
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div>
                <strong style={{ color: "var(--text-secondary)" }}>ID Log:</strong>
                <span style={{ fontFamily: "monospace", marginLeft: "8px" }}>{selectedLog.id}</span>
              </div>
              <div>
                <strong style={{ color: "var(--text-secondary)" }}>Tác nhân:</strong>
                <span style={{ marginLeft: "8px" }}>{selectedLog.actor} ({selectedLog.role})</span>
              </div>
              <div>
                <strong style={{ color: "var(--text-secondary)" }}>IP & Giao thức:</strong>
                <span style={{ fontFamily: "monospace", marginLeft: "8px" }}>{selectedLog.ip} - {selectedLog.path}</span>
              </div>
              
              {/* Code JSON box block */}
              <div style={{ marginTop: "10px" }}>
                <strong style={{ color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Payload dữ liệu gửi lên (Request JSON):</strong>
                <pre
                  style={{
                    backgroundColor: "hsl(215, 25%, 12%)",
                    color: "hsl(142, 71%, 75%)",
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    fontFamily: "monospace",
                    fontSize: "11px",
                    overflowX: "auto",
                    margin: 0
                  }}
                >
                  {JSON.stringify(JSON.parse(selectedLog.payload), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default Logs;
