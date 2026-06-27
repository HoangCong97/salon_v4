import React from "react";
import { createPortal } from "react-dom";
import { X, Clock, User, Calendar, MapPin, Activity, Layers, Sparkles, Edit, Lock, Unlock, Trash2 } from "lucide-react";
import { formatDateVN, formatCurrencyVND } from "@salon/shared-utils";
import { TenantData } from "../types";

interface TenantDrawerProps {
  selectedTenant: TenantData | null;
  onClose: () => void;
  drawerTab: "general" | "invoices";
  setDrawerTab: (tab: "general" | "invoices") => void;
  tenantInvoices: any[];
  loadingInvoices: boolean;
  getPlanDetails: (planCode: string) => { name: string; bgColor: string; color: string; price: number };
  onTriggerImpersonate: (name: string) => void;
  onOpenEditModal: (tenant: TenantData) => void;
  onOpenPlanModal: (tenant: TenantData) => void;
  onToggleStatus: (id: string) => void;
  onConfirmDelete: (tenant: TenantData) => void;
}

export const TenantDrawer: React.FC<TenantDrawerProps> = ({
  selectedTenant,
  onClose,
  drawerTab,
  setDrawerTab,
  tenantInvoices,
  loadingInvoices,
  getPlanDetails,
  onTriggerImpersonate,
  onOpenEditModal,
  onOpenPlanModal,
  onToggleStatus,
  onConfirmDelete,
}) => {
  if (!selectedTenant) return null;

  return createPortal(
    <>
      {/* Backdrop Click Dismiss */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(15, 23, 42, 0.15)",
          backdropFilter: "blur(4px)",
          zIndex: 90,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "480px",
          maxWidth: "100%",
          height: "100vh",
          maxHeight: "100vh",
          boxSizing: "border-box",
          backgroundColor: "white",
          borderLeft: "1px solid var(--border-color)",
          boxShadow: "-10px 0 30px -5px rgba(0, 0, 0, 0.08)",
          zIndex: 100,
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          animation:
            "fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "1px solid var(--border-color)",
            paddingBottom: "16px",
            marginBottom: "16px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--color-primary)",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Thông Tin Chi Tiết
            </span>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginTop: "4px",
              }}
            >
              {selectedTenant.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--bg-app)",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "50%",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation System */}
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            borderBottom: "1px solid var(--border-color)",
            marginBottom: "18px",
          }}
        >
          <button
            onClick={() => setDrawerTab("general")}
            style={{
              flex: 1,
              padding: "8px 0 12px 0",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              color:
                drawerTab === "general"
                  ? "var(--color-primary)"
                  : "var(--text-secondary)",
              borderBottom:
                drawerTab === "general"
                  ? "2px solid var(--color-primary)"
                  : "2px solid transparent",
              transition: "all 0.15s ease",
            }}
          >
            Thông tin chung
          </button>
          <button
            onClick={() => setDrawerTab("invoices")}
            style={{
              flex: 1,
              padding: "8px 0 12px 0",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              color:
                drawerTab === "invoices"
                  ? "var(--color-primary)"
                  : "var(--text-secondary)",
              borderBottom:
                drawerTab === "invoices"
                  ? "2px solid var(--color-primary)"
                  : "2px solid transparent",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Clock size={14} />
            Lịch sử mua gói
          </button>
        </div>

        {/* Drawer Body Scrollable Content */}
        <div
          style={{
            flex: "1 1 auto",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            paddingRight: "4px",
          }}
        >
          {drawerTab === "general" ? (
            <>
              {/* Core Information Section */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <h3
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Thông tin liên lạc
                </h3>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "13px",
                  }}
                >
                  <User
                    size={15}
                    style={{ color: "var(--text-muted)" }}
                  />
                  <div>
                    <div
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "10px",
                      }}
                    >
                      Chủ sở hữu
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        fontSize: "13px",
                      }}
                    >
                      {selectedTenant.owner}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "13px",
                  }}
                >
                  <Calendar
                    size={15}
                    style={{ color: "var(--text-muted)" }}
                  />
                  <div>
                    <div
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "10px",
                      }}
                    >
                      Ngày tham gia hệ thống
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {formatDateVN(selectedTenant.createdAt)}
                    </div>
                  </div>
                </div>

                {selectedTenant.address && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      fontSize: "13px",
                    }}
                  >
                    <MapPin
                      size={15}
                      style={{
                        color: "var(--text-muted)",
                        marginTop: "2px",
                      }}
                    />
                    <div>
                      <div
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "10px",
                        }}
                      >
                        Địa chỉ trụ sở
                      </div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          lineHeight: "1.4",
                        }}
                      >
                        {selectedTenant.address}
                      </div>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "13px",
                  }}
                >
                  <Activity
                    size={15}
                    style={{ color: "var(--text-muted)" }}
                  />
                  <div>
                    <div
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "10px",
                      }}
                    >
                      Mã hệ thống (UUID)
                    </div>
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: "11px",
                        backgroundColor: "var(--bg-app)",
                        padding: "4px 8px",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--text-primary)",
                        marginTop: "2px",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      {selectedTenant.id}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Plan details Section */}
              <div
                className="card"
                style={{
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  backgroundColor: "var(--bg-app)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Layers size={15} color="var(--color-primary)" />
                  Gói Dịch Vụ Đăng Ký
                </h4>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "13px",
                  }}
                >
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontWeight: 500,
                    }}
                  >
                    Tên gói hiện tại:
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: "var(--color-primary)",
                      textTransform: "uppercase",
                    }}
                  >
                    {getPlanDetails(selectedTenant.plan).name}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "13px",
                  }}
                >
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontWeight: 500,
                    }}
                  >
                    Số lượng chi nhánh:
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {selectedTenant.branchesCount} chi nhánh
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "13px",
                  }}
                >
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontWeight: 500,
                    }}
                  >
                    Trạng thái hoạt động:
                  </span>
                  <span
                    className={`badge ${
                      selectedTenant.status === "ACTIVE"
                        ? "badge-success"
                        : selectedTenant.status === "SUSPENDED"
                          ? "badge-danger"
                          : "badge-warning"
                    }`}
                    style={{
                      padding: "2px 8px",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    {selectedTenant.status === "ACTIVE"
                      ? "Đang chạy"
                      : selectedTenant.status === "SUSPENDED"
                        ? "Tạm khóa"
                        : "Chờ duyệt"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Invoice history Tab content */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {loadingInvoices ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px 10px",
                    gap: "10px",
                    color: "var(--text-secondary)",
                  }}
                >
                  <div
                    className="animate-spin"
                    style={{
                      width: "24px",
                      height: "24px",
                      border: "2px solid var(--border-color)",
                      borderTopColor: "var(--color-primary)",
                      borderRadius: "50%",
                    }}
                  />
                  <span style={{ fontSize: "13px" }}>
                    Đang tải lịch sử giao dịch...
                  </span>
                </div>
              ) : tenantInvoices.length > 0 ? (
                tenantInvoices.map((inv: any) => (
                  <div
                    key={inv.id}
                    className="card"
                    style={{
                      padding: "12px 14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      fontSize: "12px",
                      borderLeft:
                        inv.status === "PAID"
                          ? "3px solid var(--color-success)"
                          : "3px solid var(--color-warning)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          fontFamily: "monospace",
                        }}
                      >
                        {inv.id}
                      </span>
                      <span
                        className={`badge ${
                          inv.status === "PAID"
                            ? "badge-success"
                            : inv.status === "PENDING"
                              ? "badge-warning"
                              : "badge-danger"
                        }`}
                        style={{
                          padding: "2px 6px",
                          fontSize: "10px",
                          fontWeight: 600,
                        }}
                      >
                        {inv.status === "PAID"
                          ? "Đã thanh toán"
                          : inv.status === "PENDING"
                            ? "Chờ xử lý"
                            : "Chưa trả"}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.2fr 1fr",
                        gap: "4px",
                      }}
                    >
                      <div style={{ color: "var(--text-secondary)" }}>
                        Gói cước:{" "}
                        <strong style={{ color: "var(--text-primary)" }}>
                          {inv.planName}
                        </strong>
                      </div>
                      <div
                        style={{
                          textAlign: "right",
                          color: "var(--color-primary)",
                          fontWeight: 700,
                        }}
                      >
                        {formatCurrencyVND(inv.amount)}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "var(--text-muted)",
                        fontSize: "11px",
                      }}
                    >
                      <span>Ngày: {formatDateVN(inv.date, false)}</span>
                      <span>{inv.paymentMethod}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 10px",
                    color: "var(--text-muted)",
                    fontSize: "13px",
                  }}
                >
                  Chưa có lịch sử giao dịch mua gói dịch vụ nào.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Actions Footer */}
        <div
          style={{
            flex: "0 0 auto",
            borderTop: "1px solid var(--border-color)",
            paddingTop: "16px",
            marginTop: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <button
            className="btn btn-primary"
            onClick={() => onTriggerImpersonate(selectedTenant.name)}
            style={{
              width: "100%",
              padding: "10px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <Sparkles size={15} />
            Giả Lập Quyền Quản Trị Viên (Admin)
          </button>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            <button
              className="btn btn-secondary"
              onClick={() => onOpenEditModal(selectedTenant)}
              style={{
                padding: "8px 12px",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <Edit size={14} />
              Sửa Chi Tiết
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => onOpenPlanModal(selectedTenant)}
              style={{
                padding: "8px 12px",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <Layers size={14} />
              Đổi Gói Cước
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: "8px",
            }}
          >
            <button
              className="btn btn-secondary"
              onClick={() => onToggleStatus(selectedTenant.id)}
              style={{
                padding: "8px 12px",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                borderColor:
                  selectedTenant.status === "ACTIVE"
                    ? "var(--color-danger)"
                    : "var(--color-success)",
                color:
                  selectedTenant.status === "ACTIVE"
                    ? "var(--color-danger)"
                    : "var(--color-success)",
              }}
            >
              {selectedTenant.status === "ACTIVE" ? (
                <>
                  <Lock size={14} />
                  Tạm Khóa Salon
                </>
              ) : (
                <>
                  <Unlock size={14} />
                  Kích Hoạt Lại
                </>
              )}
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => onConfirmDelete(selectedTenant)}
              style={{
                padding: "8px 12px",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                borderColor: "var(--color-danger-light)",
                color: "var(--color-danger)",
                backgroundColor: "var(--color-danger-light)",
              }}
            >
              <Trash2 size={14} />
              Xóa Salon
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};
