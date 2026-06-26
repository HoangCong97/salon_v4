import React from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { ImportReportData } from "../../../hooks/useImportWizard";

interface ImportReportProps {
  report: ImportReportData | null;
}

export const ImportReport: React.FC<ImportReportProps> = ({ report }) => {
  if (!report) return null;

  const { importedCount, failedCount, errors } = report;
  const isPerfect = failedCount === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "16px 0" }}>
      {/* Overview Status Panel */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "20px",
          borderRadius: "var(--radius-lg)",
          backgroundColor: isPerfect ? "hsl(142, 70%, 96%)" : "hsl(30, 100%, 96%)",
          borderLeft: `5px solid ${isPerfect ? "var(--color-success)" : "var(--color-warning)"}`,
        }}
      >
        <div style={{ color: isPerfect ? "var(--color-success)" : "var(--color-warning)", flexShrink: 0 }}>
          {isPerfect ? <CheckCircle2 size={36} /> : <AlertCircle size={36} />}
        </div>
        <div>
          <h4 style={{ fontWeight: "600", fontSize: "16px", marginBottom: "4px", color: "var(--text-primary)" }}>
            {isPerfect
              ? "Nhập dữ liệu thành công hoàn hảo!"
              : `Nhập dữ liệu hoàn tất với ${failedCount} dòng bị lỗi`}
          </h4>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
            Đã lưu {importedCount} bản ghi vào hệ thống.
            {!isPerfect && " Các dòng bị lỗi bên dưới không được lưu, vui lòng kiểm tra lại."}
          </p>
        </div>
      </div>

      {/* Error Details Table */}
      {!isPerfect && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h5 style={{ fontWeight: "600", fontSize: "13px", color: "var(--color-danger)", display: "flex", alignItems: "center", gap: "6px" }}>
            <XCircle size={15} /> Chi tiết danh sách {failedCount} dòng bị lỗi:
          </h5>

          <div
            style={{
              maxHeight: "260px",
              overflowY: "auto",
              border: "1px solid hsl(0, 100%, 93%)",
              borderRadius: "var(--radius-md)"
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "hsl(0, 100%, 98%)", borderBottom: "1px solid hsl(0, 100%, 93%)", color: "var(--color-danger)" }}>
                  <th style={{ padding: "8px 10px", fontWeight: "600", width: "80px", textAlign: "center" }}>Hàng số</th>
                  <th style={{ padding: "8px 10px", fontWeight: "600", width: "240px" }}>Dữ liệu gốc</th>
                  <th style={{ padding: "8px 10px", fontWeight: "600" }}>Lý do lỗi</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((err, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid hsl(0, 100%, 97%)" }}>
                    <td style={{ padding: "8px 10px", fontWeight: "600", color: "var(--color-danger)", textAlign: "center" }}>
                      {err.row}
                    </td>
                    <td style={{ padding: "8px 10px", color: "var(--text-secondary)" }}>
                      <div
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "240px",
                          fontFamily: "monospace",
                          fontSize: "11px",
                          color: "var(--text-muted)"
                        }}
                        title={JSON.stringify(err.data)}
                      >
                        {JSON.stringify(err.data)}
                      </div>
                    </td>
                    <td style={{ padding: "8px 10px", color: "var(--color-danger)", fontWeight: "500" }}>
                      {err.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
