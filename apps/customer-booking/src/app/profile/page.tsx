"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = "http://localhost:3000/api/customer-portal";

interface ActivePackage {
  id: string;
  packageName: string;
  quantity: number;
  usedQuantity: number;
  remainingQuantity: number;
  expiryDate: string;
}

interface BookingHistoryItem {
  id: string;
  branchName: string;
  startTime: string;
  date: string;
  time: string;
  serviceName: string;
  staffName: string;
  status: string;
  hasReview: boolean;
  reviewRating: number | null;
}

interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  credibilityScore: number;
  totalPoints: number;
  membershipTier: string;
  activePackages: ActivePackage[];
  bookingHistory: BookingHistoryItem[];
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State
  const [phoneInput, setPhoneInput] = useState("");
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [tenantId, setTenantId] = useState("");

  // Load default tenant ID
  useEffect(() => {
    fetch(`${API_BASE}/tenants`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTenantId(data[0].id);
        }
      })
      .catch((err) => console.error("Error setting tenant ID:", err));
  }, []);

  // Sync state with URL params or localStorage
  useEffect(() => {
    if (!tenantId) return;

    const phoneParam = searchParams.get("phone");
    const savedPhone = localStorage.getItem("customer_phone");
    const phoneToLoad = phoneParam || savedPhone;

    if (phoneToLoad) {
      setPhoneInput(phoneToLoad);
      loadProfile(phoneToLoad);
    }
  }, [searchParams, tenantId]);

  const loadProfile = async (phoneNum: string) => {
    if (!phoneNum || !tenantId) return;
    
    setLoading(true);
    setErrorMsg("");
    setProfile(null);

    try {
      const response = await fetch(`${API_BASE}/customers/profile?phone=${phoneNum}&tenantId=${tenantId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        // Persist phone
        localStorage.setItem("customer_phone", phoneNum);
      } else {
        const errData = await response.json();
        setErrorMsg(errData.message || "Không tìm thấy khách hàng. Vui lòng kiểm tra lại số điện thoại.");
        localStorage.removeItem("customer_phone");
      }
    } catch (err) {
      console.error("Profile load error:", err);
      setErrorMsg("Lỗi kết nối mạng.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput) return;
    
    // Update URL to make it bookmarkable
    router.replace(`/profile?phone=${phoneInput}`);
    loadProfile(phoneInput);
  };

  const handleLogout = () => {
    localStorage.removeItem("customer_phone");
    setProfile(null);
    setPhoneInput("");
    router.replace("/profile");
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING": return "badge badge-pending";
      case "CONFIRMED": return "badge badge-confirmed";
      case "COMPLETED": return "badge badge-completed";
      case "CANCELLED":
      case "NO_SHOW":
        return "badge badge-cancelled";
      default: return "badge";
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "PENDING": return "Chờ duyệt";
      case "CONFIRMED": return "Đã xác nhận";
      case "COMPLETED": return "Đã hoàn thành";
      case "CANCELLED": return "Đã hủy";
      case "NO_SHOW": return "Khách không đến";
      default: return status;
    }
  };

  return (
    <div className="container animate-slide-up" style={{ minHeight: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--text-main)", textAlign: "center" }}>
        Hồ Sơ Khách Hàng
      </h1>

      {/* Login / Enter phone step */}
      {!profile && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div className="card" style={{ padding: "24px 20px" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "12px", textAlign: "center", color: "var(--primary)" }}>
              Tra cứu thông tin
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "20px", lineHeight: "1.4" }}>
              Nhập số điện thoại đặt lịch để xem lịch sử hẹn, tích lũy điểm thưởng và các gói liệu trình của bạn.
            </p>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Số điện thoại của bạn *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0901234567"
                  className="input-field"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                />
              </div>
              
              {errorMsg && (
                <div style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "16px", textAlign: "center" }}>
                  {errorMsg}
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Đang tra cứu..." : "Tra cứu ngay"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Details step */}
      {profile && (
        <div style={{ flex: 1, paddingBottom: "30px" }}>
          {/* Member Card Header */}
          <div
            className="card animate-slide-up"
            style={{
              background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", background: "rgba(245,158,11,0.06)", borderRadius: "50%", filter: "blur(20px)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "4px" }}>{profile.name}</h2>
                <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>SĐT: {profile.phone}</p>
              </div>
              <span className="badge badge-pending" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}>
                {profile.membershipTier}
              </span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "12px" }}>
              <div>
                <span style={{ fontSize: "0.75rem", opacity: 0.7, display: "block" }}>Tích lũy</span>
                <span style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--primary)" }}>{profile.totalPoints} <span style={{ fontSize: "0.85rem", fontWeight: "500" }}>điểm</span></span>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", opacity: 0.7, display: "block" }}>Độ uy tín</span>
                <span style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--success)" }}>{profile.credibilityScore}%</span>
              </div>
            </div>
          </div>

          {/* Service Packages Section */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "1rem", color: "var(--text-main)", marginBottom: "10px" }}>Gói liệu trình sở hữu</h3>
            {profile.activePackages.length > 0 ? (
              profile.activePackages.map((pkg) => (
                <div key={pkg.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ fontSize: "0.9rem", color: "var(--text-main)", fontWeight: "600" }}>{pkg.packageName}</h4>
                    <span className="badge badge-pending" style={{ background: "rgba(245,158,11,0.1)", color: "var(--primary)" }}>
                      Còn {pkg.remainingQuantity} buổi
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    <span>Đã dùng: {pkg.usedQuantity} / Tổng: {pkg.quantity}</span>
                    <span>Hạn dùng: {pkg.expiryDate}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="card" style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                Bạn chưa sở hữu gói liệu trình trả trước nào.
              </div>
            )}
          </div>

          {/* Booking History Section */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1rem", color: "var(--text-main)", marginBottom: "10px" }}>Lịch sử đặt lịch</h3>
            {profile.bookingHistory.length > 0 ? (
              profile.bookingHistory.map((item) => (
                <div key={item.id} className="card" style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className={getStatusBadgeClass(item.status)}>
                      {translateStatus(item.status)}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Ngày: {item.date} lúc {item.time}
                    </span>
                  </div>

                  <div>
                    <h4 style={{ fontSize: "0.9rem", color: "var(--text-main)", fontWeight: "600", marginBottom: "4px" }}>
                      {item.serviceName}
                    </h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Chi nhánh: {item.branchName} • KTV: {item.staffName}
                    </p>
                  </div>

                  {/* Actions (Leave Review) */}
                  {item.status === "COMPLETED" && (
                    <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "10px", marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {item.hasReview ? `Bạn đã đánh giá: ${"★".repeat(item.reviewRating || 5)}` : "Chưa có đánh giá"}
                      </span>
                      {!item.hasReview && (
                        <Link href={`/reviews/${item.id}?phone=${profile.phone}`} style={{ textDecoration: "none" }}>
                          <button
                            className="btn btn-primary"
                            style={{
                              padding: "6px 12px",
                              fontSize: "0.75rem",
                              width: "auto",
                              borderRadius: "8px"
                            }}
                          >
                            Đánh giá chất lượng
                          </button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="card" style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                Chưa có lịch hẹn nào được ghi nhận.
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="btn btn-secondary" style={{ marginTop: "16px" }}>
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="container" style={{ color: "var(--text-muted)", padding: "40px", textAlign: "center" }}>Đang tải hồ sơ...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
