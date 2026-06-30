import React from "react";
import { useAuthStore, UserRole } from "../../store/useAuthStore";
import { useConfirm } from "../../components/desktop/ConfirmDialog";

export default function Profile() {
  const { user, setRole, logout } = useAuthStore();
  const confirm = useConfirm();

  const handleLogout = async () => {
    const ok = await confirm({
      title: "Đăng xuất tài khoản",
      message: "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?",
      type: "warning",
      confirmText: "Đăng xuất",
      cancelText: "Hủy bỏ"
    });
    if (ok) {
      logout();
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as UserRole);
  };

  if (!user) return null;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Profile Header */}
      <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}>
        <img
          src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
          alt={user.name}
          style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "3px solid var(--color-primary-light)" }}
        />
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{user.name}</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{user.email}</p>
          <span className="badge badge-primary" style={{ marginTop: "6px" }}>{user.role}</span>
        </div>
      </div>

      {/* Real-time Earnings Widget */}
      <div className="card">
        <h3 className="card-title">Hoa hồng tạm tính hôm nay</h3>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "var(--color-primary)", marginBottom: "4px" }}>680,000đ</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Từ 3 dịch vụ đã hoàn thành.</p>
        
        <div style={{ marginTop: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "12px", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "var(--text-secondary)", fontSize: "12px" }}>Thực hiện dịch vụ</div>
            <div style={{ fontWeight: "600", fontSize: "15px" }}>580,000đ</div>
          </div>
          <div>
            <div style={{ color: "var(--text-secondary)", fontSize: "12px" }}>Bán sản phẩm</div>
            <div style={{ fontWeight: "600", fontSize: "15px" }}>100,000đ</div>
          </div>
        </div>
      </div>

      {/* Quick Mock Switcher & Controls */}
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 className="card-title">Thiết lập & Giả lập</h3>

        <div className="form-group" style={{ margin: "0" }}>
          <label className="form-label">Giả lập Vai trò (Test Roles):</label>
          <select className="form-input" value={user.role} onChange={handleRoleChange}>
            <option value="EMPLOYEE">Employee (Nhân viên - Mobile)</option>
            <option value="ADMIN">Admin (Quản trị viên - PC)</option>
            <option value="MANAGER">Manager (Quản lý - PC)</option>
            <option value="CASHIER">Cashier (Thu ngân - PC)</option>
          </select>
        </div>

        <button className="btn btn-secondary" style={{ width: "100%" }} onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
