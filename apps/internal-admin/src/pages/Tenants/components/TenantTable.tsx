import React from "react";
import { Eye, Edit, Sparkles, Lock, Unlock, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateVN } from "@salon/shared-utils";
import { TenantData } from "../types";

interface TenantTableProps {
  loading: boolean;
  paginatedTenants: TenantData[];
  currentPage: number;
  setCurrentPage: (val: number | ((prev: number) => number)) => void;
  pageSize: number;
  setPageSize: (val: number) => void;
  totalPages: number;
  filteredTenantsLength: number;
  getPlanDetails: (planCode: string) => { name: string; bgColor: string; color: string; price: number };
  onSelectTenant: (tenant: TenantData) => void;
  onOpenEditModal: (tenant: TenantData) => void;
  onTriggerImpersonate: (name: string) => void;
  onToggleStatus: (id: string) => void;
  onConfirmDelete: (tenant: TenantData) => void;
}

export const TenantTable: React.FC<TenantTableProps> = ({
  loading,
  paginatedTenants,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalPages,
  filteredTenantsLength,
  getPlanDetails,
  onSelectTenant,
  onOpenEditModal,
  onTriggerImpersonate,
  onToggleStatus,
  onConfirmDelete,
}) => {
  return (
    <>
      <div className="data-table-container">
        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px",
              gap: "12px",
              color: "var(--text-secondary)",
            }}
          >
            <div
              className="animate-spin"
              style={{
                width: "32px",
                height: "32px",
                border: "3px solid var(--border-color)",
                borderTopColor: "var(--color-primary)",
                borderRadius: "50%",
              }}
            />
            <span style={{ fontWeight: 500 }}>Đang tải danh sách Salon...</span>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "100px" }}>ID Tenant</th>
                <th>Tên Salon</th>
                <th>Chủ Sở Hữu</th>
                <th>Thông Tin Liên Hệ</th>
                <th>Gói Cước</th>
                <th style={{ textAlign: "center", width: "110px" }}>
                  Chi Nhánh
                </th>
                <th>Ngày Đăng Ký</th>
                <th>Trạng Thái</th>
                <th style={{ textAlign: "right", width: "200px" }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTenants.length > 0 ? (
                paginatedTenants.map((tenant) => {
                  const planInfo = getPlanDetails(tenant.plan);
                  return (
                    <tr
                      key={tenant.id}
                      style={{
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                      }}
                      onClick={() => onSelectTenant(tenant)}
                    >
                      <td
                        style={{
                          fontFamily: "monospace",
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {tenant.id.substring(0, 8)}...
                      </td>
                      <td>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "var(--text-primary)",
                          }}
                        >
                          {tenant.name}
                        </div>
                        {tenant.address && (
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--text-muted)",
                              marginTop: "2px",
                              maxWidth: "250px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={tenant.address}
                          >
                            {tenant.address}
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 500 }}>{tenant.owner}</td>
                      <td>
                        <div style={{ fontSize: "13px", fontWeight: 500 }}>
                          {tenant.phone}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                          }}
                        >
                          {tenant.email}
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: planInfo.bgColor,
                            color: planInfo.color,
                            fontWeight: 600,
                            padding: "4px 10px",
                          }}
                        >
                          {planInfo.name}
                        </span>
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          fontWeight: 600,
                          color: "var(--color-primary)",
                        }}
                      >
                        {tenant.branchesCount}
                      </td>
                      <td style={{ fontSize: "13px" }}>
                        {formatDateVN(tenant.createdAt, false)}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            tenant.status === "ACTIVE"
                              ? "badge-success"
                              : tenant.status === "SUSPENDED"
                                ? "badge-danger"
                                : "badge-warning"
                          }`}
                          style={{ padding: "4px 10px" }}
                        >
                          {tenant.status === "ACTIVE"
                            ? "Hoạt động"
                            : tenant.status === "SUSPENDED"
                              ? "Đang khóa"
                              : "Chờ kích hoạt"}
                        </span>
                      </td>
                      <td
                        style={{ textAlign: "right" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "6px",
                          }}
                        >
                          {/* View Detail Button */}
                          <button
                            className="btn btn-secondary"
                            style={{
                              padding: "8px",
                              borderRadius: "var(--radius-sm)",
                            }}
                            title="Xem Chi Tiết"
                            onClick={() => onSelectTenant(tenant)}
                          >
                            <Eye size={14} />
                          </button>

                          {/* Edit Details Button */}
                          <button
                            className="btn btn-secondary"
                            style={{
                              padding: "8px",
                              borderRadius: "var(--radius-sm)",
                            }}
                            title="Chỉnh Sửa Thông Tin"
                            onClick={() => onOpenEditModal(tenant)}
                          >
                            <Edit size={14} color="var(--text-secondary)" />
                          </button>

                          {/* Impersonate Button */}
                          <button
                            className="btn btn-secondary"
                            style={{
                              padding: "8px",
                              borderRadius: "var(--radius-sm)",
                            }}
                            title="Giả Lập Quyền Admin"
                            onClick={() => onTriggerImpersonate(tenant.name)}
                          >
                            <Sparkles size={14} color="var(--color-primary)" />
                          </button>

                          {/* Lock / Unlock Toggle Button */}
                          <button
                            className="btn btn-secondary"
                            style={{
                              padding: "8px",
                              borderRadius: "var(--radius-sm)",
                              borderColor:
                                tenant.status === "ACTIVE"
                                  ? "var(--color-danger-light)"
                                  : "var(--color-success-light)",
                            }}
                            title={
                              tenant.status === "ACTIVE"
                                ? "Khóa Salon"
                                : "Mở Khóa"
                            }
                            onClick={() => onToggleStatus(tenant.id)}
                          >
                            {tenant.status === "ACTIVE" ? (
                              <Lock size={14} color="var(--color-danger)" />
                            ) : (
                              <Unlock size={14} color="var(--color-success)" />
                            )}
                          </button>

                          {/* Soft Delete Button */}
                          <button
                            className="btn btn-secondary"
                            style={{
                              padding: "8px",
                              borderRadius: "var(--radius-sm)",
                              borderColor: "var(--color-danger-light)",
                            }}
                            title="Xóa Salon"
                            onClick={() => onConfirmDelete(tenant)}
                          >
                            <Trash2 size={14} color="var(--color-danger)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      textAlign: "center",
                      padding: "48px",
                      color: "var(--text-muted)",
                    }}
                  >
                    Không tìm thấy dữ liệu phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination & Display controls footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          padding: "4px 8px",
        }}
      >
        {/* Left Side: Items Per Page & Display Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "13px",
            color: "var(--text-secondary)",
          }}
        >
          <span>
            Hiển thị{" "}
            <strong>
              {filteredTenantsLength > 0
                ? (currentPage - 1) * pageSize + 1
                : 0}
            </strong>{" "}
            -{" "}
            <strong>
              {Math.min(currentPage * pageSize, filteredTenantsLength)}
            </strong>{" "}
            trong tổng số <strong>{filteredTenantsLength}</strong> kết quả
          </span>
          <span style={{ color: "var(--border-color)" }}>|</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>Số dòng mỗi trang:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="form-input"
              style={{ width: "70px", padding: "4px 8px", fontSize: "13px" }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Right Side: Page navigation controls */}
        {totalPages > 1 && (
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <button
              className="btn btn-secondary"
              style={{ padding: "6px 10px", minWidth: "36px" }}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  className={`btn ${currentPage === pageNum ? "btn-primary" : "btn-secondary"}`}
                  style={{
                    padding: "6px 12px",
                    fontSize: "13px",
                    fontWeight: 600,
                    minWidth: "36px",
                    backgroundColor:
                      currentPage === pageNum
                        ? "var(--color-primary)"
                        : "white",
                    color:
                      currentPage === pageNum
                        ? "white"
                        : "var(--text-secondary)",
                  }}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ),
            )}

            <button
              className="btn btn-secondary"
              style={{ padding: "6px 10px", minWidth: "36px" }}
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};
