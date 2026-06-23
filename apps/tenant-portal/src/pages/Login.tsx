import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { KeyRound, Mail, AlertCircle, Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err.message || "Tài khoản hoặc mật khẩu không chính xác");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword("hashedpassword123");
    setError(null);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "radial-gradient(circle at 10% 20%, hsl(220, 45%, 12%) 0%, hsl(224, 50%, 8%) 90%)",
        fontFamily: "var(--font-family)",
        padding: "24px"
      }}
    >
      <div 
        className="animate-fade-in" 
        style={{ 
          width: "100%", 
          maxWidth: "460px",
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}
      >
        {/* Branding Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
          <div
            style={{
              backgroundColor: "var(--color-primary)",
              borderRadius: "var(--radius-md)",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)"
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: "rotate(90deg)" }}
            >
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" />
              <line x1="14.47" y1="14.48" x2="20" y2="20" />
              <line x1="8.12" y1="8.12" x2="12" y2="12" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: "22px", letterSpacing: "1px", color: "white" }}>
            SALON<span style={{ color: "var(--color-primary)" }}>Portal</span>
          </span>
          <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "13px" }}>
            Hệ thống quản trị & vận hành salon đa chi nhánh
          </p>
        </div>

        {/* Login Form Card */}
        <div 
          style={{ 
            background: "rgba(30, 41, 59, 0.45)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "var(--radius-lg)",
            padding: "32px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
          }}
        >
          {error && (
            <div 
              style={{ 
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "var(--radius-sm)",
                padding: "12px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "hsl(346, 84%, 65%)",
                fontSize: "13px"
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: "rgba(255, 255, 255, 0.6)" }}>Địa chỉ Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255, 255, 255, 0.35)" }} />
                <input
                  type="email"
                  required
                  placeholder="admin@hairstar.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 42px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backgroundColor: "rgba(15, 23, 42, 0.4)",
                    color: "white",
                    borderRadius: "var(--radius-sm)",
                    outline: "none",
                    transition: "all 0.15s ease"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--color-primary)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: "rgba(255, 255, 255, 0.6)" }}>Mật khẩu</label>
              <div style={{ position: "relative" }}>
                <KeyRound size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255, 255, 255, 0.35)" }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 42px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backgroundColor: "rgba(15, 23, 42, 0.4)",
                    color: "white",
                    borderRadius: "var(--radius-sm)",
                    outline: "none",
                    transition: "all 0.15s ease"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--color-primary)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                fontWeight: "600",
                fontSize: "15px",
                borderRadius: "var(--radius-sm)",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
                marginTop: "10px",
                display: "flex",
                gap: "8px",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Đang xác thực...
                </>
              ) : (
                "Đăng nhập hệ thống"
              )}
            </button>
          </form>
        </div>

        {/* Quick Testing Credentials */}
        <div
          style={{
            background: "rgba(30, 41, 59, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "var(--radius-md)",
            padding: "20px",
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}
        >
          <div style={{ fontWeight: "600", color: "rgba(255, 255, 255, 0.7)", display: "flex", alignItems: "center", gap: "6px" }}>
            🔑 Tài khoản dùng thử (Seeded):
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <button
              onClick={() => handleQuickFill("admin@hairstar.vn")}
              style={{
                padding: "6px 8px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "none",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "11px",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
            >
              <strong>Quản trị viên (PC)</strong><br />
              admin@hairstar.vn
            </button>
            <button
              onClick={() => handleQuickFill("stylist@hairstar.vn")}
              style={{
                padding: "6px 8px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "none",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "11px",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
            >
              <strong>Nhân viên (Mobile)</strong><br />
              stylist@hairstar.vn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
