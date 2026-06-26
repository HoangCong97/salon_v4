import React from "react";
import { TargetField } from "../../../hooks/useImportWizard";
import { HelpCircle, AlertTriangle } from "lucide-react";

interface ColumnMapperProps {
  fileHeaders: string[];
  sampleRows: any[][];
  targetSchema: TargetField[];
  mappings: Record<string, string>;
  defaultValues: Record<string, any>;
  onMappingChange: (fileHeader: string, targetField: string) => void;
  onDefaultValueChange: (field: string, value: any) => void;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  fileHeaders,
  sampleRows,
  targetSchema,
  mappings,
  defaultValues,
  onMappingChange,
  onDefaultValueChange,
}) => {

  // Find which file header is currently mapped to a target field
  const getMappedHeaderForField = (field: string) => {
    return Object.keys(mappings).find(key => mappings[key] === field) || "";
  };

  // Check if a target field is mapped
  const isFieldMapped = (field: string) => {
    return Object.values(mappings).includes(field);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h4 style={{ fontWeight: "600", fontSize: "14px", marginBottom: "6px" }}>
          1. Đối chiếu cột tiêu đề
        </h4>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
          AI đã đề xuất ánh xạ tương đồng. Vui lòng kiểm tra lại các trường đối chiếu bên dưới.
        </p>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid hsl(210, 40%, 90%)", borderRadius: "var(--radius-md)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "hsl(210, 40%, 97%)", borderBottom: "1px solid hsl(210, 40%, 90%)" }}>
              <th style={{ padding: "10px 12px", fontWeight: "600", width: "220px", minWidth: "150px" }}>Cột trong file</th>
              <th style={{ padding: "10px 12px", fontWeight: "600", width: "240px", minWidth: "180px" }}>Cột trong hệ thống</th>
              <th style={{ padding: "10px 12px", fontWeight: "600", }}>Dữ liệu xem trước</th>
            </tr>
          </thead>
          <tbody>
            {fileHeaders.map((header, idx) => {
              const mappedField = mappings[header] || "";
              const targetFieldObj = targetSchema.find(t => t.field === mappedField);

              return (
                <tr key={header} style={{ borderBottom: "1px solid hsl(210, 40%, 94%)" }}>
                  <td style={{ padding: "10px 12px", fontWeight: "600", color: "var(--text-primary)" }}>
                    {header}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <select
                      className="form-input"
                      value={mappedField}
                      onChange={(e) => onMappingChange(header, e.target.value)}
                      style={{
                        padding: "6px 10px",
                        fontSize: "13px",
                        width: "100%",
                        borderColor: targetFieldObj?.required ? "var(--color-primary-light)" : "hsl(210, 40%, 88%)",
                        backgroundColor: mappedField ? "hsl(210, 100%, 99%)" : "white"
                      }}
                    >
                      <option value="">--</option>
                      {targetSchema.map((field) => (
                        <option key={field.field} value={field.field}>
                          {field.label} {field.required ? "*" : ""}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>
                    <div style={{ display: "flex", gap: "8px", overflowX: "auto", whiteSpace: "nowrap" }}>
                      {sampleRows.map((row, rowIdx) => (
                        <span
                          key={rowIdx}
                          style={{
                            padding: "3px 8px",
                            backgroundColor: "hsl(210, 40%, 95%)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "12px"
                          }}
                        >
                          {row[idx] || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>trống</span>}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Default Values Configuration for Unmapped Columns */}
      <div>
        <h4 style={{ fontWeight: "600", fontSize: "14px", marginBottom: "6px" }}>
          2. Giá trị mặc định cho cột thiếu
        </h4>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "16px" }}>
          Thiết lập giá trị mặc định cho các cột không có trong file Excel của bạn.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
            backgroundColor: "hsl(210, 40%, 99%)",
            border: "1px solid hsl(210, 40%, 93%)",
            padding: "16px",
            borderRadius: "var(--radius-md)"
          }}
        >
          {targetSchema.map((target) => {
            const isMapped = isFieldMapped(target.field);
            if (isMapped) return null; // Only show fields that are NOT mapped

            return (
              <div key={target.field} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                  {target.label} {target.required && <span style={{ color: "var(--color-danger)" }}>*</span>}
                  {target.required && (
                    <span
                      title="Trường này bắt buộc. Bạn phải chọn cột tương ứng ở bước 1 hoặc nhập giá trị mặc định tại đây."
                      style={{ color: "var(--color-danger)", display: "flex", alignItems: "center" }}
                    >
                      <AlertTriangle size={13} />
                    </span>
                  )}
                </label>

                {target.type === "select" ? (
                  <select
                    className="form-input"
                    value={defaultValues[target.field] || ""}
                    onChange={(e) => onDefaultValueChange(target.field, e.target.value)}
                    style={{ padding: "6px 10px", fontSize: "13px" }}
                  >
                    <option value="">-- Chọn mặc định --</option>
                    {target.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : target.type === "number" ? (
                  <input
                    type="number"
                    className="form-input"
                    value={defaultValues[target.field] !== undefined ? defaultValues[target.field] : ""}
                    onChange={(e) => onDefaultValueChange(target.field, parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    style={{ padding: "6px 10px", fontSize: "13px" }}
                  />
                ) : target.type === "boolean" ? (
                  <select
                    className="form-input"
                    value={defaultValues[target.field] === true ? "true" : "false"}
                    onChange={(e) => onDefaultValueChange(target.field, e.target.value === "true")}
                    style={{ padding: "6px 10px", fontSize: "13px" }}
                  >
                    <option value="false">Không / Sai (False)</option>
                    <option value="true">Có / Đúng (True)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    value={defaultValues[target.field] || ""}
                    onChange={(e) => onDefaultValueChange(target.field, e.target.value)}
                    placeholder="Nhập giá trị mặc định..."
                    style={{ padding: "6px 10px", fontSize: "13px" }}
                  />
                )}
                {target.description && (
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>
                    {target.description}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
