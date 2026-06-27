import React from "react";
import { Search, Plus } from "lucide-react";
import { PlanData } from "../types";

interface TenantFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterPlan: string;
  setFilterPlan: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  plans: PlanData[];
  onOpenAddModal: () => void;
}

export const TenantFilters: React.FC<TenantFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  filterPlan,
  setFilterPlan,
  filterStatus,
  setFilterStatus,
  plans,
  onOpenAddModal,
}) => {
  return (
    <div
      className="card"
      style={{
        padding: "16px",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          flexGrow: 1,
        }}
      >
        {/* Search Box */}
        <div
          style={{
            position: "relative",
            minWidth: "280px",
            flexGrow: 1,
            maxWidth: "400px",
          }}
        >
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Tìm theo tên Salon, tên chủ, SĐT hoặc ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "36px", fontSize: "13px" }}
          />
        </div>

        {/* Plan Filter */}
        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className="form-input"
          style={{ width: "160px", fontSize: "13px" }}
        >
          <option value="ALL">Mọi gói cước</option>
          <option value="FREE">Gói dùng thử</option>
          {plans.map((p) => (
            <option key={p.id} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="form-input"
          style={{ width: "160px", fontSize: "13px" }}
        >
          <option value="ALL">Mọi trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="SUSPENDED">Đang khóa</option>
          <option value="PENDING">Chờ kích hoạt</option>
        </select>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <button
            className="btn btn-primary"
            onClick={onOpenAddModal}
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <Plus size={16} />
            Đăng Ký Salon Mới
          </button>
        </div>
      </div>

      {/* Clear Filters Button if any active */}
      {(searchQuery || filterPlan !== "ALL" || filterStatus !== "ALL") && (
        <button
          className="btn btn-secondary"
          onClick={() => {
            setSearchQuery("");
            setFilterPlan("ALL");
            setFilterStatus("ALL");
          }}
          style={{ padding: "8px 14px", fontSize: "13px" }}
        >
          Xóa Bộ Lọc
        </button>
      )}
    </div>
  );
};
