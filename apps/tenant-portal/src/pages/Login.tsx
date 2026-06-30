import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useToast } from "../components/desktop/ToastProvider";
import { KeyRound, AlertCircle, Loader2, Eye, EyeOff, Store, User } from "lucide-react";

export default function Login() {
  const { login } = useAuthStore();
  const toast = useToast();
  const [brandName, setBrandName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !loginId.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ Tên gian hàng, Tên đăng nhập và Mật khẩu.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const success = await login(brandName.trim(), loginId.trim(), password, rememberMe);
      if (success) {
        toast.success("Đăng nhập thành công!");
      }
    } catch (err: any) {
      setError(err.message || "Tài khoản hoặc mật khẩu không chính xác");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (quickBrand: string, quickLoginId: string) => {
    setBrandName(quickBrand);
    setLoginId(quickLoginId);
    setPassword("123456");
    setError(null);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "var(--font-family)",
        padding: "24px",
        position: "relative"
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}
      >
        {/* Branding Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                backgroundColor: "#0070f3",
                borderRadius: "8px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0, 112, 243, 0.3)"
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
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
            <span style={{ fontSize: "26px", fontWeight: "800", color: "#1e293b", letterSpacing: "-0.5px" }}>
              SALON<span style={{ color: "#0070f3" }}>SaaS</span>
            </span>
          </div>

          <div
            style={{
              backgroundColor: "#e0f2fe",
              color: "#0284c7",
              padding: "6px 16px",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "0.2px",
              display: "inline-block"
            }}
          >
            Hair Salon, Nails, Massage & Spa
          </div>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fee2e2",
              borderRadius: "8px",
              padding: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#b91c1c",
              fontSize: "13px"
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Tên gian hàng */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px", display: "block" }}>
              Tên gian hàng *
            </label>
            <div style={{ position: "relative" }}>
              <Store size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                required
                placeholder="Nhập tên gian hàng hoặc SĐT..."
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                autoComplete="off"
                style={{
                  width: "100%",
                  padding: "11px 14px 11px 42px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#1e293b",
                  borderRadius: "8px",
                  outline: "none",
                  fontSize: "14px",
                  transition: "all 0.15s ease"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#0070f3";
                  e.target.style.boxShadow = "0 0 0 3px rgba(0, 112, 243, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#cbd5e1";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Tên đăng nhập */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px", display: "block" }}>
              Tên đăng nhập *
            </label>
            <div style={{ position: "relative" }}>
              <User size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                required
                placeholder="Nhập ID nhân viên hoặc SĐT..."
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                autoComplete="new-password"
                style={{
                  width: "100%",
                  padding: "11px 14px 11px 42px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#1e293b",
                  borderRadius: "8px",
                  outline: "none",
                  fontSize: "14px",
                  transition: "all 0.15s ease"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#0070f3";
                  e.target.style.boxShadow = "0 0 0 3px rgba(0, 112, 243, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#cbd5e1";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px", display: "block" }}>
              Nhập mật khẩu *
            </label>
            <div style={{ position: "relative" }}>
              <KeyRound size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                required
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                style={{
                  width: "100%",
                  padding: "11px 40px 11px 42px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#1e293b",
                  borderRadius: "8px",
                  outline: "none",
                  fontSize: "14px",
                  transition: "all 0.15s ease",
                  WebkitTextSecurity: showPassword ? "none" : "disc",
                } as any}
                onFocus={(e) => {
                  e.target.style.borderColor = "#0070f3";
                  e.target.style.boxShadow = "0 0 0 3px rgba(0, 112, 243, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#cbd5e1";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Duy trì đăng nhập & Quên mật khẩu */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", marginTop: "-4px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "#475569", cursor: "pointer", fontWeight: "500" }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e1",
                  accentColor: "#0070f3",
                  cursor: "pointer"
                }}
              />
              Duy trì đăng nhập
            </label>
            <a
              href="#/forgot-password"
              onClick={(e) => {
                e.preventDefault();
                toast.info("Vui lòng liên hệ Hotline hỗ trợ 1900 6522 để khôi phục mật khẩu.");
              }}
              style={{
                color: "#64748b",
                textDecoration: "none",
                fontWeight: "500",
                transition: "color 0.15s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#0070f3"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"}
            >
              Quên mật khẩu
            </a>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 16px",
              fontWeight: "700",
              fontSize: "15px",
              borderRadius: "10px",
              backgroundColor: "#0070f3",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              boxShadow: "0 4px 12px rgba(0, 112, 243, 0.2)",
              transition: "all 0.2s ease",
              width: "100%",
              marginTop: "10px"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0061d5"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#0070f3"}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        {/* Register Account */}
        <div style={{ textAlign: "center", fontSize: "14px", color: "#475569", marginTop: "10px" }}>
          Bạn chưa có tài khoản?{" "}
          <a
            href="#/register"
            onClick={(e) => {
              e.preventDefault();
              toast.info("Vui lòng đăng ký dịch vụ qua Hotline hỗ trợ 1900 6522.");
            }}
            style={{
              color: "#0070f3",
              fontWeight: "600",
              textDecoration: "none"
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
          >
            Đăng ký ngay
          </a>
        </div>
      </div>

      {/* Quick testing helper */}
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          marginTop: "16px",
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "12px",
          padding: "16px",
          color: "#ffffff",
          fontSize: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}
      >
        <div style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
          🔑 Tài khoản dùng thử (Seeded):
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <button
            onClick={() => handleQuickFill("0971218625", "0971218625")}
            style={{
              padding: "6px 8px",
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "4px",
              color: "white",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "11px",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
          >
            <strong>Chủ Salon (Admin)</strong><br />
            CH: 0971218625 / TK: 0971218625
          </button>

          <button
            onClick={() => handleQuickFill("0971218625", "tien.le")}
            style={{
              padding: "6px 8px",
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "4px",
              color: "white",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "11px",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
          >
            <strong>Nhân viên (Mobile)</strong><br />
            CH: 0971218625 / TK: tien.le
          </button>
        </div>
      </div>

      {/* Footer Support Info */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          color: "rgba(255, 255, 255, 0.8)",
          fontSize: "13px",
          fontWeight: "500"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>📞 Hỗ trợ:</span>
          <strong style={{ color: "white" }}>1900 6522</strong>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
          <span style={{ fontSize: "16px" }}>🇻🇳</span>
          <span>Tiếng Việt ∨</span>
        </div>
      </div>
    </div>
  );
}
