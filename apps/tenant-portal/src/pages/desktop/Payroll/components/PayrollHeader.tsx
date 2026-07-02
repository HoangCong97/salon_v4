import React from "react";
import { CalendarDays, Download, CheckCircle2, RefreshCw } from "lucide-react";

import { ExportButton } from "../../../../components/desktop/ExportButton";

import { PayrollMember } from "../types";

interface PayrollHeaderProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedMonth: number;
  setSelectedMonth: (val: number) => void;
  selectedYear: number;
  setSelectedYear: (val: number) => void;
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
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: "240px" }}>
          <input
            className="form-input"
            type="text"
            placeholder="Tìm nhân viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "36px" }}
          />
          <CalendarDays size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginRight: "2px" }}>
            Chu kỳ:
          </span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="form-input excel-select"
            style={{ width: "90px", padding: "6px 12px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}
          >
            {Array.from({ length: 12 }).map((_, idx) => (
              <option key={idx + 1} value={idx + 1}>Tháng {idx + 1}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="form-input excel-select"
            style={{ width: "100px", padding: "6px 12px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}
          >
            {Array.from({ length: 5 }).map((_, idx) => {
              const yr = new Date().getFullYear() - 2 + idx;
              return <option key={yr} value={yr}>Năm {yr}</option>;
            })}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        {canManage && (
          <>
            <button
              className="btn btn-secondary"
              onClick={onOpenImportModal}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                borderColor: "hsl(142, 76%, 36%)",
                color: "hsl(142, 76%, 36%)",
                backgroundColor: "hsl(142, 76%, 97%)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(142, 76%, 92%)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(142, 76%, 97%)")}
            >
              <Download size={16} /> Nhập từ Excel
            </button>

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
          </>
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
