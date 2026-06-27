import React from "react";
import { createPortal } from "react-dom";
import { UserPlus, X, Edit, Layers, Trash2, CheckCircle, Sparkles } from "lucide-react";
import { TenantData, PlanData } from "../types";

interface TenantModalsProps {
  showAddModal: boolean;
  setShowAddModal: (val: boolean) => void;
  newSalon: {
    name: string;
    owner: string;
    phone: string;
    email: string;
    plan: string;
    address: string;
  };
  setNewSalon: React.Dispatch<React.SetStateAction<{
    name: string;
    owner: string;
    phone: string;
    email: string;
    plan: string;
    address: string;
  }>>;
  plans: PlanData[];
  handleCreateSalon: (e: React.FormEvent) => void;
  showEditModal: boolean;
  setShowEditModal: (val: boolean) => void;
  editingTenant: TenantData | null;
  editForm: {
    name: string;
    owner: string;
    phone: string;
    email: string;
    address: string;
  };
  setEditForm: React.Dispatch<React.SetStateAction<{
    name: string;
    owner: string;
    phone: string;
    email: string;
    address: string;
  }>>;
  handleUpdateTenant: (e: React.FormEvent) => void;
  showPlanModal: boolean;
  setShowPlanModal: (val: boolean) => void;
  selectedTenant: TenantData | null;
  tempPlan: string;
  setTempPlan: (val: string) => void;
  getPlanDetails: (planCode: string) => { name: string; bgColor: string; color: string; price: number };
  handleUpdatePlan: () => void;
  showDeleteConfirmModal: boolean;
  setShowDeleteConfirmModal: (val: boolean) => void;
  tenantToDelete: TenantData | null;
  handleDeleteTenant: () => void;
  showImpersonateModal: boolean;
  impersonateStep: number;
  targetImpersonateName: string;
}

export const TenantModals: React.FC<TenantModalsProps> = ({
  showAddModal,
  setShowAddModal,
  newSalon,
  setNewSalon,
  plans,
  handleCreateSalon,
  showEditModal,
  setShowEditModal,
  editingTenant,
  editForm,
  setEditForm,
  handleUpdateTenant,
  showPlanModal,
  setShowPlanModal,
  selectedTenant,
  tempPlan,
  setTempPlan,
  getPlanDetails,
  handleUpdatePlan,
  showDeleteConfirmModal,
  setShowDeleteConfirmModal,
  tenantToDelete,
  handleDeleteTenant,
  showImpersonateModal,
  impersonateStep,
  targetImpersonateName,
}) => {
  return (
    <>
      {/* Interactive Modal: Add New Salon via React Portal */}
      {showAddModal &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 110,
            }}
          >
            <div
              className="card animate-fade-in"
              style={{
                width: "520px",
                padding: "28px",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid var(--border-color)",
                  paddingBottom: "14px",
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "17px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "var(--text-primary)",
                  }}
                >
                  <UserPlus size={20} color="var(--color-primary)" />
                  Đăng Ký Salon Mới
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    display: "flex",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleCreateSalon}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    Tên Salon Tóc / Spa / Thẩm Mỹ Viện{" "}
                    <span style={{ color: "var(--color-danger)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Beauty Star Salon"
                    value={newSalon.name}
                    onChange={(e) =>
                      setNewSalon({ ...newSalon, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                  }}
                >
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      Tên Chủ Sở Hữu{" "}
                      <span style={{ color: "var(--color-danger)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={newSalon.owner}
                      onChange={(e) =>
                        setNewSalon({ ...newSalon, owner: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      Số Điện Thoại Liên Hệ{" "}
                      <span style={{ color: "var(--color-danger)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ví dụ: 090xxxxxxx"
                      value={newSalon.phone}
                      onChange={(e) =>
                        setNewSalon({ ...newSalon, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 0.8fr",
                    gap: "14px",
                  }}
                >
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="email@salon.vn"
                      value={newSalon.email}
                      onChange={(e) =>
                        setNewSalon({ ...newSalon, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Gói Cước Đăng Ký</label>
                    <select
                      className="form-input"
                      value={newSalon.plan}
                      onChange={(e) =>
                        setNewSalon({ ...newSalon, plan: e.target.value })
                      }
                      style={{ textTransform: "capitalize" }}
                    >
                      <option value="FREE">Dùng thử (Free)</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Địa Chỉ Trụ Sở</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Số nhà, tên đường, Phường, Quận, Thành phố"
                    value={newSalon.address}
                    onChange={(e) =>
                      setNewSalon({ ...newSalon, address: e.target.value })
                    }
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    borderTop: "1px solid var(--border-color)",
                    paddingTop: "18px",
                    marginTop: "8px",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ fontWeight: 600 }}
                  >
                    Xác Nhận Tạo
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* Interactive Modal: Edit Salon Details via React Portal */}
      {showEditModal &&
        editingTenant &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 110,
            }}
          >
            <div
              className="card animate-fade-in"
              style={{
                width: "520px",
                padding: "28px",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid var(--border-color)",
                  paddingBottom: "14px",
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "17px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "var(--text-primary)",
                  }}
                >
                  <Edit size={20} color="var(--color-primary)" />
                  Chỉnh Sửa Thông Tin Salon
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    display: "flex",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleUpdateTenant}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    Tên Salon Tóc / Spa / Thẩm Mỹ Viện{" "}
                    <span style={{ color: "var(--color-danger)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                  }}
                >
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      Tên Chủ Sở Hữu{" "}
                      <span style={{ color: "var(--color-danger)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.owner}
                      onChange={(e) =>
                        setEditForm({ ...editForm, owner: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      Số Điện Thoại Liên Hệ{" "}
                      <span style={{ color: "var(--color-danger)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email Liên Hệ</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Địa Chỉ Trụ Sở</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.address}
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    borderTop: "1px solid var(--border-color)",
                    paddingTop: "18px",
                    marginTop: "8px",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ fontWeight: 600 }}
                  >
                    Cập Nhật
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* Interactive Modal: Change Plan via React Portal */}
      {showPlanModal &&
        selectedTenant &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 120,
            }}
          >
            <div
              className="card animate-fade-in"
              style={{
                width: "420px",
                padding: "26px",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid var(--border-color)",
                  paddingBottom: "12px",
                  marginBottom: "16px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "var(--text-primary)",
                  }}
                >
                  <Layers size={18} color="var(--color-primary)" />
                  Thay Đổi Gói Cước SaaS
                </h3>
                <button
                  onClick={() => setShowPlanModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    display: "flex",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div
                style={{
                  marginBottom: "20px",
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  lineHeight: "1.5",
                }}
              >
                Đang thay đổi gói dịch vụ cho Salon:{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  {selectedTenant.name}
                </strong>
                .
                <div style={{ marginTop: "6px" }}>
                  Gói hiện tại:{" "}
                  <span
                    style={{ fontWeight: 700, color: "var(--color-primary)" }}
                  >
                    {getPlanDetails(selectedTenant.plan).name}
                  </span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "24px" }}>
                <label className="form-label">Chọn Gói Cước Mới</label>
                <select
                  className="form-input"
                  value={tempPlan}
                  onChange={(e) => setTempPlan(e.target.value)}
                >
                  <option value="FREE">Dùng thử (Free Trial)</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "16px",
                }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowPlanModal(false)}
                >
                  Hủy Bỏ
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleUpdatePlan}
                  style={{ fontWeight: 600 }}
                >
                  Cập Nhật Gói
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Interactive Modal: Delete Tenant Confirmation via React Portal */}
      {showDeleteConfirmModal &&
        tenantToDelete &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 130,
            }}
          >
            <div
              className="card animate-fade-in"
              style={{
                width: "420px",
                padding: "26px",
                border: "1px solid var(--color-danger-light)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid var(--border-color)",
                  paddingBottom: "12px",
                  marginBottom: "16px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--color-danger)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Trash2 size={18} />
                  Xác Nhận Xóa Salon
                </h3>
                <button
                  onClick={() => setShowDeleteConfirmModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    display: "flex",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  lineHeight: "1.5",
                  marginBottom: "20px",
                }}
              >
                Hành động này sẽ xóa Salon{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  "{tenantToDelete.name}"
                </strong>{" "}
                khỏi trang quản trị. Dữ liệu của Salon sẽ được lưu trữ dưới dạng
                soft-delete trong cơ sở dữ liệu và có thể khôi phục lại khi cần.
                <div
                  style={{
                    marginTop: "10px",
                    color: "var(--color-danger)",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  ⚠️ Bạn có chắc chắn muốn tiếp tục hành động xóa này?
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "16px",
                }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirmModal(false)}
                >
                  Hủy Bỏ
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteTenant}
                  style={{ fontWeight: 600 }}
                >
                  Xác Nhận Xóa
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Simulated Premium Impersonate Backdrop Overlay via React Portal */}
      {showImpersonateModal &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              backdropFilter: "blur(8px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
              color: "white",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                maxWidth: "400px",
                textAlign: "center",
                gap: "20px",
              }}
            >
              {/* Pulsing secure icon wrapper */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  border: "2px solid var(--color-primary)",
                  boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
                  animation: "pulse 1.5s infinite",
                }}
              >
                {impersonateStep === 3 ? (
                  <CheckCircle
                    size={36}
                    color="var(--color-success)"
                    style={{ animation: "secureScale 0.3s ease forwards" }}
                  />
                ) : (
                  <Sparkles
                    size={36}
                    color="var(--color-primary)"
                    style={{ animation: "secureSpin 2.5s linear infinite" }}
                  />
                )}
              </div>

              <div>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    marginBottom: "8px",
                    letterSpacing: "0.5px",
                  }}
                >
                  {impersonateStep === 0 && "Xác thực tài khoản..."}
                  {impersonateStep === 1 && "Khởi tạo mã bảo mật..."}
                  {impersonateStep === 2 && "Đang kết nối tới cổng quản trị..."}
                  {impersonateStep === 3 && "Kết nối thành công!"}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255, 255, 255, 0.6)",
                    lineHeight: "1.4",
                  }}
                >
                  Thiết lập quyền truy cập Super Admin cho Salon:{" "}
                  <strong style={{ color: "white" }}>
                    "{targetImpersonateName}"
                  </strong>
                </p>
              </div>

              {/* Stepper visualization */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  width: "100%",
                  justifyContent: "center",
                  marginTop: "10px",
                }}
              >
                {[0, 1, 2].map((stepIndex) => (
                  <div
                    key={stepIndex}
                    style={{
                      height: "4px",
                      width: "40px",
                      borderRadius: "2px",
                      backgroundColor:
                        impersonateStep >= stepIndex
                          ? "var(--color-primary)"
                          : "rgba(255, 255, 255, 0.2)",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
