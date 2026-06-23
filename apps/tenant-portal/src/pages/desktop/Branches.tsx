import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { MapPin, Phone, Mail, Plus, Edit2, Trash2, Loader2, X, Building2 } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export default function Branches() {
  const { currentTenantId, setTenant } = useAuthStore();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  
  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const fetchBranches = async () => {
    if (!currentTenantId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches`);
      if (!res.ok) throw new Error("Không thể tải danh sách chi nhánh");
      const data = await res.json();
      setBranches(data);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [currentTenantId]);

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (branch: Branch) => {
    setModalMode("edit");
    setSelectedBranchId(branch.id);
    setName(branch.name);
    setPhone(branch.phone || "");
    setEmail(branch.email || "");
    setAddress(branch.address || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = { name, phone, email, address };

    try {
      let res;
      if (modalMode === "create") {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${selectedBranchId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error("Lỗi khi lưu thông tin chi nhánh");
      
      setIsModalOpen(false);
      await fetchBranches();
      
      // Update global context so branch selector gets updated
      if (currentTenantId) {
        await setTenant(currentTenantId);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chi nhánh này?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tenants/${currentTenantId}/branches/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Lỗi khi xóa chi nhánh");

      await fetchBranches();
      
      // Update global context so branch selector gets updated
      if (currentTenantId) {
        await setTenant(currentTenantId);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "4px" }}>
              Cơ sở & Chi nhánh
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Quản lý mạng lưới chi nhánh, cửa hàng trực thuộc chuỗi salon.
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={18} /> Add New Branch
          </button>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)" }} />
          </div>
        ) : error ? (
          <div className="card" style={{ borderLeft: "4px solid var(--color-danger)", background: "var(--color-danger-light)" }}>
            <p style={{ color: "var(--color-danger)", fontWeight: "500" }}>{error}</p>
          </div>
        ) : branches.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <Building2 size={48} style={{ color: "var(--text-muted)", marginBottom: "16px", marginInline: "auto" }} />
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Chưa có chi nhánh nào</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>Hãy bắt đầu thêm chi nhánh đầu tiên của bạn.</p>
            <button className="btn btn-primary" onClick={handleOpenCreateModal}>
              <Plus size={18} /> Thêm chi nhánh
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {branches.map((branch) => (
              <div key={branch.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "between", position: "relative" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", paddingRight: "80px" }}>
                    {branch.name}
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", color: "var(--text-secondary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPin size={16} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: "13px" }}>{branch.address || "Chưa thiết lập"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Phone size={16} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: "13px" }}>{branch.phone || "Chưa thiết lập"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Mail size={16} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: "13px" }}>{branch.email || "Chưa thiết lập"}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "24px", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: "6px 12px", fontSize: "12px" }}
                    onClick={() => handleOpenEditModal(branch)}
                  >
                    <Edit2 size={14} /> Chỉnh sửa
                  </button>
                  <button 
                    className="btn btn-danger" 
                    style={{ padding: "6px 12px", fontSize: "12px" }}
                    onClick={() => handleDelete(branch.id)}
                  >
                    <Trash2 size={14} /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialog - Renders relative to viewport for perfect centering */}
      {isModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div className="card animate-fade-in" style={{ width: "100%", maxWidth: "480px", position: "relative" }}>
            <button 
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
              onClick={() => setIsModalOpen(false)}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>
              {modalMode === "create" ? "Thêm chi nhánh mới" : "Chỉnh sửa chi nhánh"}
            </h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Tên chi nhánh *</label>
                <input 
                  className="form-input" 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: HairStar - Chi nhánh Quận 1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input 
                  className="form-input" 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 02839998881"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email liên hệ</label>
                <input 
                  className="form-input" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ví dụ: branch1@hairstar.vn"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Địa chỉ</label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ví dụ: 15 Lê Thánh Tôn, Quận 1, TP.HCM"
                  style={{ resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
