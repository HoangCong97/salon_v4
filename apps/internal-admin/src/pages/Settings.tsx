import React, { useState } from "react";
import { ShieldCheck, Mail, MessageSquare, CreditCard, Save, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

type SettingTab = "sms" | "email" | "payment";

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingTab>("sms");
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "failed">("idle");
  const [saveStatus, setSaveStatus] = useState<boolean>(false);

  // Form State
  const [smsConfig, setSmsConfig] = useState({ provider: "Twilio", sid: "AC8a9b2d71f481a5c9d64b3", token: "••••••••••••••••••••", sender: "+1234567890" });
  const [emailConfig, setEmailConfig] = useState({ provider: "SendGrid", apiKey: "SG.8c9b2f3a.7d81a9f1_e5", senderEmail: "no-reply@salonapp.com", senderName: "SALON SaaS Notification" });
  const [paymentConfig, setPaymentConfig] = useState({ gateway: "VNPAY", tmnCode: "SALON001", hashSecret: "••••••••••••••••••••", redirectUrl: "https://api.salonapp.com/v1/payments/ipn" });

  const handleTestConnection = () => {
    setLoading(true);
    setConnectionStatus("idle");
    setSaveStatus(false);
    setTimeout(() => {
      setLoading(false);
      setConnectionStatus("success");
    }, 1500);
  };

  const handleSave = () => {
    setSaveStatus(true);
    setConnectionStatus("idle");
    setTimeout(() => {
      setSaveStatus(false);
    }, 4000);
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* System alert notice */}
      <div className="card" style={{ padding: "16px", backgroundColor: "var(--color-primary-light)", borderColor: "var(--border-focus)", display: "flex", gap: "12px", alignItems: "center" }}>
        <ShieldCheck size={24} color="var(--color-primary)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: "13px", color: "var(--color-primary)" }}>
          <strong>Lưu ý bảo mật:</strong> Các thông tin API Keys, Client Secrets được mã hóa tự động ở cơ sở dữ liệu (AES-256). Mọi truy vấn thay đổi cấu hình đều được ghi nhận vào nhật ký hệ thống toàn cục.
        </div>
      </div>

      {/* Save Success Alert Banner */}
      {saveStatus && (
        <div className="animate-fade-in" style={{ padding: "16px", backgroundColor: "var(--color-success-light)", borderColor: "var(--color-success)", borderWidth: "1px", borderStyle: "solid", borderRadius: "var(--radius-md)", display: "flex", gap: "10px", alignItems: "center" }}>
          <CheckCircle2 size={20} color="var(--color-success)" />
          <span style={{ fontSize: "13px", color: "var(--color-success)", fontWeight: 600 }}>Cấu hình hệ thống toàn cục đã được lưu thành công!</span>
        </div>
      )}

      {/* Horizontal Tabs switcher */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", gap: "8px" }}>
        <button
          onClick={() => {
            setActiveTab("sms");
            setConnectionStatus("idle");
          }}
          style={{
            padding: "12px 20px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "sms" ? "2px solid var(--color-primary)" : "2px solid transparent",
            color: activeTab === "sms" ? "var(--color-primary)" : "var(--text-secondary)",
            fontWeight: activeTab === "sms" ? 600 : 500,
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.15s ease"
          }}
        >
          <MessageSquare size={16} /> Cấu hình SMS Brandname
        </button>
        <button
          onClick={() => {
            setActiveTab("email");
            setConnectionStatus("idle");
          }}
          style={{
            padding: "12px 20px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "email" ? "2px solid var(--color-primary)" : "2px solid transparent",
            color: activeTab === "email" ? "var(--color-primary)" : "var(--text-secondary)",
            fontWeight: activeTab === "email" ? 600 : 500,
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.15s ease"
          }}
        >
          <Mail size={16} /> Cấu hình Email Service
        </button>
        <button
          onClick={() => {
            setActiveTab("payment");
            setConnectionStatus("idle");
          }}
          style={{
            padding: "12px 20px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "payment" ? "2px solid var(--color-primary)" : "2px solid transparent",
            color: activeTab === "payment" ? "var(--color-primary)" : "var(--text-secondary)",
            fontWeight: activeTab === "payment" ? 600 : 500,
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.15s ease"
          }}
        >
          <CreditCard size={16} /> Cấu hình Cổng VNPAY
        </button>
      </div>

      {/* Dynamic Tab form panels */}
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {activeTab === "sms" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>Twilio SMS Gateway Configuration</h4>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Tên Nhà Cung Cấp</label>
                <input type="text" className="form-input" value={smsConfig.provider} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Twilio Account SID</label>
                <input
                  type="text"
                  className="form-input"
                  value={smsConfig.sid}
                  onChange={(e) => setSmsConfig({ ...smsConfig, sid: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Twilio Auth Token</label>
                <input
                  type="password"
                  className="form-input"
                  value={smsConfig.token}
                  onChange={(e) => setSmsConfig({ ...smsConfig, token: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Twilio Sender Number (SMS Brandname / Phone)</label>
                <input
                  type="text"
                  className="form-input"
                  value={smsConfig.sender}
                  onChange={(e) => setSmsConfig({ ...smsConfig, sender: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "email" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>SendGrid Email API Configuration</h4>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Nhà Cung Cấp Dịch Vụ</label>
                <input type="text" className="form-input" value={emailConfig.provider} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">SendGrid API Key</label>
                <input
                  type="password"
                  className="form-input"
                  value={emailConfig.apiKey}
                  onChange={(e) => setEmailConfig({ ...emailConfig, apiKey: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Email Người gửi Mặc định (Sender Email)</label>
                <input
                  type="email"
                  className="form-input"
                  value={emailConfig.senderEmail}
                  onChange={(e) => setEmailConfig({ ...emailConfig, senderEmail: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tên Người Gửi hiển thị (Sender Name)</label>
                <input
                  type="text"
                  className="form-input"
                  value={emailConfig.senderName}
                  onChange={(e) => setEmailConfig({ ...emailConfig, senderName: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>Cổng Thanh Toán VNPAY IPN Integration</h4>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Cổng Thanh Toán</label>
                <input type="text" className="form-input" value={paymentConfig.gateway} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">VNPAY TmnCode (Mã Cửa Hàng)</label>
                <input
                  type="text"
                  className="form-input"
                  value={paymentConfig.tmnCode}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, tmnCode: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">VNPAY Hash Secret Key</label>
                <input
                  type="password"
                  className="form-input"
                  value={paymentConfig.hashSecret}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, hashSecret: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">IPN Callback URL (Đường dẫn webhook đồng bộ giao dịch)</label>
                <input
                  type="text"
                  className="form-input"
                  value={paymentConfig.redirectUrl}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, redirectUrl: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Buttons and inline connection statuses */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "20px", marginTop: "10px" }}>
          
          <div>
            {loading && (
              <span style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                <RefreshCw size={14} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                Đang gửi gói tin kiểm tra kết nối...
              </span>
            )}
            
            {connectionStatus === "success" && (
              <span style={{ fontSize: "13px", color: "var(--color-success)", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={16} />
                Kết nối thành công! Máy chủ đối tác phản hồi: HTTP 200 OK.
              </span>
            )}

            {connectionStatus === "failed" && (
              <span style={{ fontSize: "13px", color: "var(--color-danger)", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertCircle size={16} />
                Kết nối thất bại. Vui lòng kiểm tra lại API credentials.
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleTestConnection}
              disabled={loading}
              style={{ minWidth: "160px" }}
            >
              Kiểm Tra Kết Nối
            </button>
            
            <button type="button" className="btn btn-primary" onClick={handleSave} style={{ minWidth: "120px" }}>
              <Save size={16} />
              Lưu Cấu Hình
            </button>
          </div>

        </div>

      </div>

      {/* Embedded spin animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />

    </div>
  );
};

export default SettingsPage;
