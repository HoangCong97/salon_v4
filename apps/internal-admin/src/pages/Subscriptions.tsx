import React, { useState, useEffect } from "react";
import { CreditCard, Check, ShieldAlert, Award, FileText, BadgeCheck, Clock, Eye, X, Edit, DollarSign } from "lucide-react";
import { formatCurrencyVND } from "@salon/shared-utils";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  maxBranches: number;
  maxStaff: number;
}

interface BillingInvoice {
  id: string;
  salonName: string;
  planName: string;
  amount: number;
  date: string;
  status: "PAID" | "PENDING" | "OVERDUE";
  paymentMethod: string;
}

const Subscriptions: React.FC = () => {
  // Database states
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals Visibility
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<BillingInvoice | null>(null);

  // Form State for editing plan
  const [editForm, setEditForm] = useState<{
    price: number;
    maxBranches: number;
    maxStaff: number;
    features: string[];
  }>({
    price: 0,
    maxBranches: -1,
    maxStaff: -1,
    features: []
  });

  const [branchSelectValue, setBranchSelectValue] = useState("-1");
  const [staffSelectValue, setStaffSelectValue] = useState("-1");

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch plans
      const plansRes = await fetch("http://localhost:3000/api/super-admin/plans");
      const plansData = await plansRes.json();
      const mappedPlans = plansData.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        maxBranches: p.maxBranches,
        maxStaff: p.maxStaff,
        features: p.features
      }));
      setPlans(mappedPlans);

      // Fetch invoices
      const invoicesRes = await fetch("http://localhost:3000/api/super-admin/invoices");
      const invoicesData = await invoicesRes.json();
      setInvoices(invoicesData);
    } catch (error) {
      console.error("Failed to load subscription data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const approveInvoice = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/super-admin/invoices/${id}/approve`, {
        method: "PUT"
      });
      if (res.ok) {
        setInvoices(prev =>
          prev.map(inv => (inv.id === id ? { ...inv, status: "PAID" as const } : inv))
        );
        if (viewingInvoice && viewingInvoice.id === id) {
          setViewingInvoice(prev => prev ? { ...prev, status: "PAID" as const } : null);
        }
      }
    } catch (error) {
      console.error("Failed to approve invoice:", error);
    }
  };

  const handleOpenEdit = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setEditForm({
      price: plan.price,
      maxBranches: plan.maxBranches,
      maxStaff: plan.maxStaff,
      features: [...plan.features]
    });

    const presetsBranches = [1, 2, 3, 5, 10];
    const initialBranchSelect = plan.maxBranches === -1
      ? "-1"
      : presetsBranches.includes(plan.maxBranches)
        ? String(plan.maxBranches)
        : "custom";
    setBranchSelectValue(initialBranchSelect);

    const presetsStaff = [5, 10, 20, 50, 100];
    const initialStaffSelect = plan.maxStaff === -1
      ? "-1"
      : presetsStaff.includes(plan.maxStaff)
        ? String(plan.maxStaff)
        : "custom";
    setStaffSelectValue(initialStaffSelect);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      const res = await fetch(`http://localhost:3000/api/super-admin/plans/${editingPlan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          price: editForm.price,
          maxBranches: editForm.maxBranches,
          maxStaff: editForm.maxStaff,
          features: editForm.features
        })
      });
      if (res.ok) {
        setPlans(prev =>
          prev.map(p =>
            p.id === editingPlan.id
              ? {
                ...p,
                price: editForm.price,
                maxBranches: editForm.maxBranches,
                maxStaff: editForm.maxStaff,
                features: editForm.features
              }
              : p
          )
        );
        setEditingPlan(null);
      }
    } catch (error) {
      console.error("Failed to save plan quotas:", error);
    }
  };

  return (
    <>
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* 1. Plans Configuration Grid */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <Award size={20} color="var(--color-primary)" />
          <h3 className="card-title" style={{ margin: 0 }}>Cấu Hình Gói Subscription (Quotas)</h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="card animate-fade-in"
              style={{
                display: "flex",
                flexDirection: "column",
                borderTop: plan.id === "premium" ? "4px solid var(--color-primary)" : "1px solid var(--border-color)",
                position: "relative",
                overflow: "hidden"
              }}
            >
              {plan.id === "premium" && (
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "-32px",
                    backgroundColor: "var(--color-primary)",
                    color: "white",
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "4px 32px",
                    transform: "rotate(45deg)",
                    textTransform: "uppercase"
                  }}
                >
                  Bán Chạy
                </div>
              )}

              <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>{plan.name}</h4>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", margin: "10px 0 20px 0" }}>
                <span style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {plan.price === 0 ? "Miễn phí" : formatCurrencyVND(plan.price).replace("đ", "")}
                </span>
                {plan.price > 0 && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>đ / tháng</span>}
              </div>

              {/* Limit Quotas Details */}
              <div
                style={{
                  backgroundColor: "var(--bg-app)",
                  padding: "12px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "13px",
                  marginBottom: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}
              >
                <div><strong>Chi nhánh tối đa:</strong> {plan.maxBranches === -1 ? "Không giới hạn" : `${plan.maxBranches} chi nhánh`}</div>
                <div><strong>Thợ làm tối đa:</strong> {plan.maxStaff === -1 ? "Không giới hạn" : `${plan.maxStaff} nhân viên`}</div>
              </div>

              {/* Feature list */}
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", flexGrow: 1, marginBottom: "24px" }}>
                {plan.features.map((feat, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "var(--text-secondary)" }}>
                    <Check size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                className="btn btn-secondary"
                onClick={() => handleOpenEdit(plan)}
                style={{ width: "100%" }}
              >
                <Edit size={14} />
                Thay Đổi Quotas & Giá Gói
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Billing / Invoices management */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <FileText size={20} color="var(--color-primary)" />
          <h3 className="card-title" style={{ margin: 0 }}>Hóa Đơn Thu Phí Gói Cước</h3>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã Hóa Đơn</th>
                <th>Salon Đăng Ký</th>
                <th>Gói Cước</th>
                <th>Số Tiền</th>
                <th>Cổng Thanh Toán</th>
                <th>Ngày Tạo</th>
                <th>Trạng Thái</th>
                <th style={{ textAlign: "right" }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600, fontFamily: "monospace" }}>{inv.id}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{inv.salonName}</div>
                  </td>
                  <td>{inv.planName} Plan</td>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{formatCurrencyVND(inv.amount)}</td>
                  <td>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{inv.paymentMethod}</div>
                  </td>
                  <td>{new Date(inv.date).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <span
                      className={`badge ${inv.status === "PAID"
                          ? "badge-success"
                          : inv.status === "PENDING"
                            ? "badge-warning"
                            : "badge-danger"
                        }`}
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      {inv.status === "PAID" ? (
                        <>
                          <BadgeCheck size={12} /> Đã đóng tiền
                        </>
                      ) : inv.status === "PENDING" ? (
                        <>
                          <Clock size={12} /> Chờ duyệt
                        </>
                      ) : (
                        <>
                          <ShieldAlert size={12} /> Quá hạn
                        </>
                      )}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                      {inv.status === "PENDING" ? (
                        <button
                          className="btn btn-primary"
                          style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "var(--radius-sm)" }}
                          onClick={() => approveInvoice(inv.id)}
                        >
                          Duyệt Thanh Toán
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "6px 10px", borderRadius: "var(--radius-sm)" }}
                          title="Xem Chi Tiết Hóa Đơn"
                          onClick={() => setViewingInvoice(inv)}
                        >
                          <Eye size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Close the animated container */}
      </div>

      {/* Interactive Modal: Edit Pricing Plans Quotas & Features */}
      {editingPlan && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110 }}>
          <div className="card animate-fade-in" style={{ width: "480px", padding: "24px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px", flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Cấu hình Quotas & Tính năng: {editingPlan.name}</h3>
              <button onClick={() => setEditingPlan(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePlan} style={{ display: "flex", flexDirection: "column", gap: "14px", overflowY: "auto", paddingRight: "4px", flexGrow: 1 }}>
              <div className="form-group">
                <label className="form-label">Giá Thuê Mỗi Tháng (VNĐ)</label>
                <input
                  type="number"
                  className="form-input"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Giới Hạn Chi Nhánh (Branches limit)</label>
                <select
                  className="form-input"
                  value={branchSelectValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBranchSelectValue(val);
                    if (val === "custom") {
                      const currentNum = editForm.maxBranches > 0 ? editForm.maxBranches : 1;
                      setEditForm(prev => ({ ...prev, maxBranches: currentNum }));
                    } else {
                      setEditForm(prev => ({ ...prev, maxBranches: parseInt(val) }));
                    }
                  }}
                >
                  <option value="-1">Không giới hạn</option>
                  <option value="1">1 chi nhánh</option>
                  <option value="2">2 chi nhánh</option>
                  <option value="3">3 chi nhánh</option>
                  <option value="5">5 chi nhánh</option>
                  <option value="10">10 chi nhánh</option>
                  <option value="custom">Nhập số lượng khác...</option>
                </select>
                {branchSelectValue === "custom" && (
                  <input
                    type="number"
                    className="form-input"
                    style={{ marginTop: "8px" }}
                    min="1"
                    value={editForm.maxBranches}
                    onChange={(e) => setEditForm(prev => ({ ...prev, maxBranches: Math.max(1, parseInt(e.target.value) || 1) }))}
                    placeholder="Nhập số lượng chi nhánh"
                    required
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Giới Hạn Nhân Sự (Staff limit)</label>
                <select
                  className="form-input"
                  value={staffSelectValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStaffSelectValue(val);
                    if (val === "custom") {
                      const currentNum = editForm.maxStaff > 0 ? editForm.maxStaff : 5;
                      setEditForm(prev => ({ ...prev, maxStaff: currentNum }));
                    } else {
                      setEditForm(prev => ({ ...prev, maxStaff: parseInt(val) }));
                    }
                  }}
                >
                  <option value="-1">Không giới hạn</option>
                  <option value="5">5 nhân viên</option>
                  <option value="10">10 nhân viên</option>
                  <option value="20">20 nhân viên</option>
                  <option value="50">50 nhân viên</option>
                  <option value="100">100 nhân viên</option>
                  <option value="custom">Nhập số lượng khác...</option>
                </select>
                {staffSelectValue === "custom" && (
                  <input
                    type="number"
                    className="form-input"
                    style={{ marginTop: "8px" }}
                    min="1"
                    value={editForm.maxStaff}
                    onChange={(e) => setEditForm(prev => ({ ...prev, maxStaff: Math.max(1, parseInt(e.target.value) || 1) }))}
                    placeholder="Nhập số lượng nhân viên"
                    required
                  />
                )}
              </div>

              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label className="form-label" style={{ margin: 0 }}>Các Dòng Lợi Ích / Tính Năng</label>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: "4px 8px", fontSize: "12px" }}
                    onClick={() => setEditForm(prev => ({ ...prev, features: [...prev.features, ""] }))}
                  >
                    + Thêm dòng
                  </button>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto", paddingRight: "4px" }}>
                  {editForm.features.map((feature, index) => (
                    <div key={index} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <input
                        type="text"
                        className="form-input"
                        value={feature}
                        placeholder={`Dòng lợi ích thứ ${index + 1}`}
                        onChange={(e) => {
                          const newFeatures = [...editForm.features];
                          newFeatures[index] = e.target.value;
                          setEditForm(prev => ({ ...prev, features: newFeatures }));
                        }}
                        required
                      />
                      <button
                        type="button"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--color-danger)",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center"
                        }}
                        onClick={() => {
                          const newFeatures = editForm.features.filter((_, i) => i !== index);
                          setEditForm(prev => ({ ...prev, features: newFeatures }));
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {editForm.features.length === 0 && (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
                      Chưa có dòng lợi ích nào. Click "+ Thêm dòng" để bắt đầu.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "16px", marginTop: "12px", flexShrink: 0 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingPlan(null)}>Hủy bỏ</button>
                <button type="submit" className="btn btn-primary">Lưu Thay Đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Modal: View Invoice Receipt breakdown */}
      {viewingInvoice && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 115 }}>
          <div className="card animate-fade-in" style={{ width: "460px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Chi Tiết Hóa Đơn Điện Tử</h3>
              <button onClick={() => setViewingInvoice(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Số hóa đơn:</span>
                <strong style={{ fontFamily: "monospace" }}>{viewingInvoice.id}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Salon sử dụng:</span>
                <strong>{viewingInvoice.salonName}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Gói đăng ký:</span>
                <span>Gói {viewingInvoice.planName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Ngày xuất:</span>
                <span>{new Date(viewingInvoice.date).toLocaleString("vi-VN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Cổng thanh toán:</span>
                <span>{viewingInvoice.paymentMethod}</span>
              </div>
              <div style={{ height: "1px", backgroundColor: "var(--border-color)", margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px" }}>
                <strong>Tổng thanh toán:</strong>
                <strong style={{ color: "var(--color-primary)", fontSize: "16px" }}>{formatCurrencyVND(viewingInvoice.amount)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                <span>Trạng thái thanh toán:</span>
                <span
                  className={`badge ${viewingInvoice.status === "PAID"
                      ? "badge-success"
                      : viewingInvoice.status === "PENDING"
                        ? "badge-warning"
                        : "badge-danger"
                    }`}
                >
                  {viewingInvoice.status === "PAID" ? "Đã đóng tiền" : viewingInvoice.status === "PENDING" ? "Chờ duyệt" : "Quá hạn"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "16px", marginTop: "20px" }}>
              <button className="btn btn-secondary" onClick={() => setViewingInvoice(null)}>Đóng cửa sổ</button>
              {viewingInvoice.status === "PENDING" && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    approveInvoice(viewingInvoice.id);
                  }}
                >
                  Phê Duyệt Thanh Toán
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Subscriptions;
