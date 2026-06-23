import React, { useState, useEffect } from "react";
import { Search, Lock, Unlock, Eye, Sparkles, User, Calendar, MapPin, X, Plus, UserPlus, Layers } from "lucide-react";
import { formatDateVN } from "@salon/shared-utils";

interface TenantData {
  id: string;
  name: string;
  owner: string;
  phone: string;
  email: string;
  plan: "Free" | "Basic" | "Premium";
  branchesCount: number;
  createdAt: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  address: string;
}

const Tenants: React.FC = () => {
  // Database States
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTenant, setSelectedTenant] = useState<TenantData | null>(null);
  const [filterPlan, setFilterPlan] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals visibility toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);
  const [targetImpersonateName, setTargetImpersonateName] = useState("");

  // Form State for creating a new Salon
  const [newSalon, setNewSalon] = useState({
    name: "",
    owner: "",
    phone: "",
    email: "",
    plan: "Free" as "Free" | "Basic" | "Premium",
    address: ""
  });

  // Form State for plan updating
  const [tempPlan, setTempPlan] = useState<"Free" | "Basic" | "Premium">("Free");

  const mapPlanCode = (code: string): "Free" | "Basic" | "Premium" => {
    if (!code) return "Free";
    const c = code.toUpperCase();
    if (c === "PREMIUM") return "Premium";
    if (c === "BASIC") return "Basic";
    return "Free";
  };

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/super-admin/tenants");
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((t: any) => ({
          id: t.id,
          name: t.name,
          owner: t.owner,
          phone: t.phone,
          email: t.email,
          plan: mapPlanCode(t.plan),
          branchesCount: t.branchesCount,
          createdAt: t.createdAt,
          status: t.status,
          address: t.address
        }));
        setTenants(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const toggleTenantStatus = async (id: string) => {
    const tenant = tenants.find(t => t.id === id);
    if (!tenant) return;
    const newStatus = tenant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch(`http://localhost:3000/api/super-admin/tenants/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setTenants(prev =>
          prev.map(t => {
            if (t.id === id) {
              const updatedObj = { ...t, status: updated.status };
              if (selectedTenant && selectedTenant.id === id) {
                setSelectedTenant(updatedObj);
              }
              return updatedObj;
            }
            return t;
          })
        );
      }
    } catch (error) {
      console.error("Failed to toggle tenant status:", error);
    }
  };

  const handleCreateSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSalon.name || !newSalon.owner || !newSalon.phone) {
      alert("Vui lòng nhập tên salon, tên chủ sở hữu và số điện thoại!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/super-admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSalon.name,
          owner: newSalon.owner,
          phone: newSalon.phone,
          email: newSalon.email,
          plan: newSalon.plan,
          address: newSalon.address
        })
      });
      if (res.ok) {
        const created = await res.json();
        const mappedCreated: TenantData = {
          id: created.id,
          name: created.name,
          owner: created.owner,
          phone: created.phone,
          email: created.email,
          plan: mapPlanCode(created.plan),
          branchesCount: created.branchesCount,
          createdAt: created.createdAt,
          status: created.status,
          address: created.address
        };
        setTenants(prev => [mappedCreated, ...prev]);
        setShowAddModal(false);
        setNewSalon({ name: "", owner: "", phone: "", email: "", plan: "Free", address: "" });
      }
    } catch (error) {
      console.error("Failed to create tenant:", error);
    }
  };

  const handleUpdatePlan = async () => {
    if (!selectedTenant) return;
    try {
      const res = await fetch(`http://localhost:3000/api/super-admin/tenants/${selectedTenant.id}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode: tempPlan.toUpperCase() })
      });
      if (res.ok) {
        const updated = await res.json();
        const mappedUpdated = {
          ...selectedTenant,
          plan: mapPlanCode(updated.plan)
        };
        setTenants(prev => prev.map(t => t.id === selectedTenant.id ? mappedUpdated : t));
        setSelectedTenant(mappedUpdated);
        setShowPlanModal(false);
      }
    } catch (error) {
      console.error("Failed to update tenant plan:", error);
    }
  };

  const triggerImpersonate = (name: string) => {
    setTargetImpersonateName(name);
    setShowImpersonateModal(true);
    setTimeout(() => {
      setShowImpersonateModal(false);
    }, 2500);
  };

  // Filter salons logic
  const filteredTenants = tenants.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery) ||
      t.id.includes(searchQuery);

    const matchesPlan = filterPlan === "ALL" || t.plan.toUpperCase() === filterPlan;
    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px", height: "100%" }}>
      
      {/* Search and control filter action bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ position: "relative", width: "280px" }}>
            <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Tìm theo tên, ID, sđt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", fontSize: "13px" }}
            />
          </div>
          
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="form-input"
            style={{ width: "130px", fontSize: "13px", padding: "8px 12px" }}
          >
            <option value="ALL">Mọi gói cước</option>
            <option value="FREE">Gói dùng thử</option>
            <option value="BASIC">Gói Basic</option>
            <option value="PREMIUM">Gói Premium</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input"
            style={{ width: "150px", fontSize: "13px", padding: "8px 12px" }}
          >
            <option value="ALL">Mọi trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="SUSPENDED">Đang tạm khóa</option>
            <option value="PENDING">Chờ kích hoạt</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          Thêm Salon Mới
        </button>
      </div>

      {/* Main Table view */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "100px" }}>ID Tenant</th>
              <th>Tên Salon</th>
              <th>Chủ Sở Hữu</th>
              <th>Liên Hệ</th>
              <th>Gói</th>
              <th style={{ textAlign: "center" }}>Số Chi Nhánh</th>
              <th>Ngày Đăng Ký</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: "right" }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.length > 0 ? (
              filteredTenants.map((tenant) => (
                <tr key={tenant.id} style={{ cursor: "pointer" }} onClick={() => setSelectedTenant(tenant)}>
                  <td style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-secondary)" }}>
                    {tenant.id.substring(0, 8)}...
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{tenant.name}</div>
                  </td>
                  <td>{tenant.owner}</td>
                  <td>
                    <div style={{ fontSize: "13px" }}>{tenant.phone}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{tenant.email}</div>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: tenant.plan === "Premium" ? "var(--color-primary-light)" : tenant.plan === "Basic" ? "var(--color-warning-light)" : "var(--border-color)",
                        color: tenant.plan === "Premium" ? "var(--color-primary)" : tenant.plan === "Basic" ? "var(--color-warning)" : "var(--text-secondary)",
                        fontWeight: 600
                      }}
                    >
                      {tenant.plan}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 500 }}>{tenant.branchesCount}</td>
                  <td>{formatDateVN(tenant.createdAt, false)}</td>
                  <td>
                    <span
                      className={`badge ${
                        tenant.status === "ACTIVE"
                          ? "badge-success"
                          : tenant.status === "SUSPENDED"
                          ? "badge-danger"
                          : "badge-warning"
                      }`}
                    >
                      {tenant.status === "ACTIVE"
                        ? "Hoạt động"
                        : tenant.status === "SUSPENDED"
                        ? "Tạm khóa"
                        : "Chờ kích hoạt"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "6px 10px", borderRadius: "var(--radius-sm)" }}
                        title="Xem Chi Tiết"
                        onClick={() => setSelectedTenant(tenant)}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "6px 10px", borderRadius: "var(--radius-sm)" }}
                        title="Giả Lập Quyền Admin"
                        onClick={() => triggerImpersonate(tenant.name)}
                      >
                        <Sparkles size={14} color="var(--color-primary)" />
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{
                          padding: "6px 10px",
                          borderRadius: "var(--radius-sm)",
                          borderColor: tenant.status === "ACTIVE" ? "var(--color-danger-light)" : "var(--color-success-light)"
                        }}
                        title={tenant.status === "ACTIVE" ? "Khóa Salon" : "Mở Khóa"}
                        onClick={() => toggleTenantStatus(tenant.id)}
                      >
                        {tenant.status === "ACTIVE" ? (
                          <Lock size={14} color="var(--color-danger)" />
                        ) : (
                          <Unlock size={14} color="var(--color-success)" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  Không tìm thấy dữ liệu phù hợp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", color: "var(--text-secondary)" }}>
        <span>Hiển thị {filteredTenants.length}/{tenants.length} bản ghi</span>
        <div style={{ display: "flex", gap: "4px" }}>
          <button className="btn btn-secondary" style={{ padding: "4px 8px" }} disabled>Trước</button>
          <button className="btn btn-primary" style={{ padding: "4px 12px" }}>1</button>
          <button className="btn btn-secondary" style={{ padding: "4px 8px" }} disabled>Sau</button>
        </div>
      </div>

      {/* Detail Drawer overlay */}
      {selectedTenant && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "480px",
            height: "100vh",
            backgroundColor: "white",
            borderLeft: "1px solid var(--border-color)",
            boxShadow: "-10px 0 20px -5px rgba(0, 0, 0, 0.05)",
            zIndex: 100,
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            animation: "fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px", marginBottom: "20px" }}>
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Chi tiết Tenant</span>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", margin: "4px 0 0 0" }}>{selectedTenant.name}</h2>
            </div>
            <button
              onClick={() => setSelectedTenant(null)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", color: "var(--text-secondary)" }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                <User size={16} color="var(--text-muted)" />
                <strong>Chủ sở hữu:</strong> {selectedTenant.owner}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                <Calendar size={16} color="var(--text-muted)" />
                <strong>Ngày tạo:</strong> {formatDateVN(selectedTenant.createdAt)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                <MapPin size={16} color="var(--text-muted)" />
                <strong>Địa chỉ:</strong> {selectedTenant.address}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                <span style={{ fontWeight: 500, fontSize: "13px" }}>UUID hệ thống:</span>
                <span style={{ fontFamily: "monospace", fontSize: "11px", backgroundColor: "hsl(210, 40%, 95%)", padding: "2px 6px", borderRadius: "var(--radius-sm)" }}>
                  {selectedTenant.id}
                </span>
              </div>
            </div>

            <div className="card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>Thông Tin Đăng Ký Gói</h4>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                <span>Gói dịch vụ:</span>
                <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>{selectedTenant.plan} Plan</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                <span>Số lượng chi nhánh:</span>
                <span style={{ fontWeight: 600 }}>{selectedTenant.branchesCount} / Không giới hạn</span>
              </div>
            </div>

            <div className="card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>Hoạt động & Trạng thái</h4>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                <span>Trạng thái:</span>
                <span
                  className={`badge ${
                    selectedTenant.status === "ACTIVE"
                      ? "badge-success"
                      : selectedTenant.status === "SUSPENDED"
                      ? "badge-danger"
                      : "badge-warning"
                  }`}
                >
                  {selectedTenant.status === "ACTIVE" ? "Đang chạy" : selectedTenant.status === "SUSPENDED" ? "Tạm khóa" : "Chờ duyệt"}
                </span>
              </div>
            </div>
          </div>

          {/* Drawer Actions Footer */}
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px", marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <button className="btn btn-primary" onClick={() => triggerImpersonate(selectedTenant.name)} style={{ width: "100%" }}>
              <Sparkles size={16} />
              Đăng Nhập Giả Lập Quyền Admin
            </button>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn btn-secondary"
                onClick={() => toggleTenantStatus(selectedTenant.id)}
                style={{ flexGrow: 1, borderColor: selectedTenant.status === "ACTIVE" ? "var(--color-danger)" : "var(--color-success)" }}
              >
                {selectedTenant.status === "ACTIVE" ? (
                  <>
                    <Lock size={16} color="var(--color-danger)" />
                    <span style={{ color: "var(--color-danger)" }}>Khóa Salon</span>
                  </>
                ) : (
                  <>
                    <Unlock size={16} color="var(--color-success)" />
                    <span style={{ color: "var(--color-success)" }}>Mở Khóa Salon</span>
                  </>
                )}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setTempPlan(selectedTenant.plan);
                  setShowPlanModal(true);
                }}
                style={{ flexGrow: 1 }}
              >
                <Layers size={16} />
                Đổi Gói Cước
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal: Add New Salon */}
      {showAddModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110 }}>
          <div className="card animate-fade-in" style={{ width: "500px", padding: "24px", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                <UserPlus size={18} color="var(--color-primary)" />
                Thêm Salon Đăng Ký Mới
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateSalon} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Tên Salon tóc / Spa</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: Beauty Queen Spa"
                  value={newSalon.name}
                  onChange={(e) => setNewSalon({ ...newSalon, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Tên Chủ Sở Hữu</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nguyễn Văn A"
                    value={newSalon.owner}
                    onChange={(e) => setNewSalon({ ...newSalon, owner: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Số Điện Thoại</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="090..."
                    value={newSalon.phone}
                    onChange={(e) => setNewSalon({ ...newSalon, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Email Liên Hệ</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="mail@salon.com"
                    value={newSalon.email}
                    onChange={(e) => setNewSalon({ ...newSalon, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gói Đăng Ký</label>
                  <select
                    className="form-input"
                    value={newSalon.plan}
                    onChange={(e) => setNewSalon({ ...newSalon, plan: e.target.value as any })}
                  >
                    <option value="Free">Free Trial</option>
                    <option value="Basic">Basic Plan</option>
                    <option value="Premium">Premium Plan</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Địa Chỉ Trụ Sở</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Số nhà, Tên đường, Quận, TP"
                  value={newSalon.address}
                  onChange={(e) => setNewSalon({ ...newSalon, address: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "16px", marginTop: "8px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Hủy bỏ</button>
                <button type="submit" className="btn btn-primary">Xác Nhận Tạo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Modal: Change Plan */}
      {showPlanModal && selectedTenant && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 120 }}>
          <div className="card animate-fade-in" style={{ width: "400px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Nâng Cấp / Thay Đổi Gói Cước</h3>
              <button onClick={() => setShowPlanModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ marginBottom: "16px", fontSize: "13px" }}>
              Đang thay đổi gói cước cho salon: <strong>{selectedTenant.name}</strong>. Gói hiện tại: <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>{selectedTenant.plan}</span>
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label">Chọn Gói Cước Mới</label>
              <select
                className="form-input"
                value={tempPlan}
                onChange={(e) => setTempPlan(e.target.value as any)}
              >
                <option value="Free">Gói dùng thử (Free Trial)</option>
                <option value="Basic">Gói Cơ Bản (Basic Plan)</option>
                <option value="Premium">Gói Cao Cấp (Premium Plan)</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
              <button className="btn btn-secondary" onClick={() => setShowPlanModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleUpdatePlan}>Cập Nhật Gói</button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Impersonate Modal Backdrop Overlay */}
      {showImpersonateModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 200, color: "white" }}>
          <Sparkles size={48} className="animate-pulse" style={{ color: "var(--color-primary)", marginBottom: "16px", animation: "pulse 1.5s infinite" }} />
          <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Đang kết nối giả lập hệ thống...</h3>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Truy cập quản trị viên salon: "{targetImpersonateName}"</p>
        </div>
      )}

    </div>
  );
};

export default Tenants;
