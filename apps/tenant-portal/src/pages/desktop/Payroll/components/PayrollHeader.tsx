import React from "react";
import { Search, CheckCircle2, RefreshCw } from "lucide-react";

import { ExportButton } from "../../../../components/desktop/ExportButton";
import { ImportButton } from "../../../../components/desktop/ImportButton";

import { PayrollMember } from "../types";

interface PayrollHeaderProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedMonth: number;
  setSelectedMonth: (val: number) => void;
  selectedYear: number;
  setSelectedYear: (val: number) => void;
  selectedBranch: string;
  setSelectedBranch: (val: string) => void;
  branches: any[];
  canManage: boolean;
  onOpenImportModal: () => void;
  onMarkAllPaid: () => void;
  filteredPayrolls: PayrollMember[];
  periodStr: string;
  exportColumns: any[];
  onGeneratePayroll: () => void;
}

export const PayrollHeader: React.FC<PayrollHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  selectedBranch,
  setSelectedBranch,
  branches,
  canManage,
  onOpenImportModal,
  onMarkAllPaid,
  filteredPayrolls,
  periodStr,
  exportColumns,
  onGeneratePayroll,
}) => {
  return (
    <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", flexWrap: "wrap", gap: "16px" }}>
      {/* Filters (All flat on the same row: Employee, Branch, Year, Month) */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", flexGrow: 1, minWidth: 0 }}>
        {/* Lọc theo nhân viên */}
        <div style={{ position: "relative", width: "100%", maxWidth: "240px", flexShrink: 0 }}>
          <input
            className="form-input"
            type="text"
            placeholder="Tìm nhân viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "36px", height: "36px", fontSize: "13px" }}
          />
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        </div>

        {/* Lọc theo chi nhánh */}
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="form-input"
          style={{ width: "160px", height: "36px", cursor: "pointer", fontSize: "13px" }}
        >
          <option value="">Chi nhánh (Tất cả)</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Lọc theo năm */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="form-input"
          style={{ width: "120px", height: "36px", cursor: "pointer", fontSize: "13px" }}
        >
          {Array.from({ length: 5 }).map((_, idx) => {
            const yr = new Date().getFullYear() - 2 + idx;
            return <option key={yr} value={yr}>Năm {yr}</option>;
          })}
        </select>

        {/* Lọc theo tháng */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="form-input"
          style={{ width: "120px", height: "36px", cursor: "pointer", fontSize: "13px" }}
        >
          {Array.from({ length: 12 }).map((_, idx) => (
            <option key={idx + 1} value={idx + 1}>Tháng {idx + 1}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        {canManage && (
          <button
            className="btn btn-secondary"
            onClick={onMarkAllPaid}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} /> Thanh toán hết
          </button>
        )}

        {canManage && (
          <ImportButton onClick={onOpenImportModal} buttonText="Nhập từ Excel" />
        )}

        <ExportButton
          data={filteredPayrolls}
          fileName={`bang_luong_thang_${periodStr}`}
          columns={exportColumns}
        />

        {canManage && (
          <button className="btn btn-primary" onClick={onGeneratePayroll} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <RefreshCw size={16} /> Lập bảng lương
          </button>
        )}
      </div>
    </div>
  );
};
