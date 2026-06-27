import React from "react";
import { TargetField } from "../../../hooks/useImportWizard";
import { AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";

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

  // Find the header currently mapped to this field
  const getMappedHeaderForField = (field: string) => {
    return Object.keys(mappings).find(key => mappings[key] === field) || "";
  };

  const handleSelectHeaderForField = (field: string, newHeader: string) => {
    // Find what is currently mapped to this field
    const currentHeader = Object.keys(mappings).find(key => mappings[key] === field);
    
    if (currentHeader && currentHeader !== newHeader) {
      // Unmap the old header
      onMappingChange(currentHeader, "");
    }
    
    if (newHeader) {
      onMappingChange(newHeader, field);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h4 style={{ fontWeight: "600", fontSize: "14px", marginBottom: "6px" }}>
          Đối chiếu các trường dữ liệu
        </h4>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
          Hãy chọn cột tương ứng từ file của bạn. Nếu file Excel thiếu cột này, thiết lập giá trị mặc định ngay bên cạnh.
        </p>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid hsl(210, 40%, 90%)", borderRadius: "var(--radius-md)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "hsl(210, 40%, 97%)", borderBottom: "1px solid hsl(210, 40%, 90%)" }}>
              <th style={{ padding: "10px 12px", fontWeight: "600", width: "180px", minWidth: "140px" }}>Cột trong hệ thống</th>
              <th style={{ padding: "10px 12px", fontWeight: "600", width: "180px", minWidth: "130px" }}>Cột tương ứng trong file</th>
              <th style={{ padding: "10px 12px", fontWeight: "600", minWidth: "260px" }}>Xem trước / Giá trị mặc định</th>
            </tr>
          </thead>
          <tbody>
            {targetSchema.map((target) => {
              const mappedHeader = getMappedHeaderForField(target.field);
              const headerIdx = fileHeaders.indexOf(mappedHeader);
              const isRequired = target.required;
              
              // Validate default value if not mapped
              const hasDefaultValue = defaultValues[target.field] !== undefined && defaultValues[target.field] !== null && String(defaultValues[target.field]).trim() !== "";
              const showRequiredWarning = isRequired && !mappedHeader && !hasDefaultValue;

              return (
                <tr 
                  key={target.field} 
                  style={{ 
                    borderBottom: "1px solid hsl(210, 40%, 94%)", 
                    backgroundColor: showRequiredWarning ? "hsl(0, 100%, 99%)" : "white" 
                  }}
                >
                  {/* System Column Label & Description Tooltip */}
                  <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                        {target.label}
                      </span>
                      {isRequired && <span style={{ color: "var(--color-danger)", fontWeight: "bold" }}>*</span>}
                      {target.description && (
                        <span 
                          title={target.description} 
                          style={{ color: "var(--text-muted)", display: "inline-flex", alignItems: "center", cursor: "help" }}
                        >
                          <HelpCircle size={14} />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Dropdown Select File Column */}
                  <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                    <select
                      className="form-input"
                      value={mappedHeader}
                      onChange={(e) => handleSelectHeaderForField(target.field, e.target.value)}
                      style={{
                        padding: "4px 8px",
                        fontSize: "12.5px",
                        width: "100%",
                        borderColor: showRequiredWarning 
                          ? "var(--color-danger)" 
                          : mappedHeader 
                          ? "var(--color-success)" 
                          : "hsl(210, 40%, 88%)",
                        backgroundColor: mappedHeader ? "hsl(140, 100%, 99%)" : "white",
                        borderRadius: "var(--radius-sm)",
                        height: "32px",
                      }}
                    >
                      <option value="">-- Bỏ qua / Không có --</option>
                      {fileHeaders.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Preview of data OR Default Value Input */}
                  <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                    {mappedHeader ? (
                      // Show data preview
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "11px", color: "var(--color-success)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle size={12} /> Đã khớp dữ liệu mẫu:
                        </span>
                        <div 
                          style={{ 
                            display: "flex", 
                            gap: "6px", 
                            overflowX: "auto", 
                            whiteSpace: "nowrap", 
                            paddingBottom: "2px",
                            maxWidth: "100%",
                            scrollbarWidth: "thin"
                          }}
                        >
                          {sampleRows.map((row, rowIdx) => {
                            const val = row[headerIdx];
                            return (
                              <span
                                key={rowIdx}
                                style={{
                                  padding: "2px 6px",
                                  backgroundColor: "hsl(210, 40%, 95%)",
                                  borderRadius: "var(--radius-sm)",
                                  fontSize: "11.5px",
                                  color: "var(--text-secondary)",
                                  flexShrink: 0,
                                }}
                                title={val}
                              >
                                {val || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>trống</span>}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      // Show Default Value Config
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "11px", color: showRequiredWarning ? "var(--color-danger)" : "var(--text-muted)", fontWeight: "500" }}>
                            Cột thiếu trong file Excel - Nhập mặc định:
                          </span>
                          {showRequiredWarning && (
                            <span 
                              style={{ 
                                display: "inline-flex", 
                                alignItems: "center", 
                                gap: "3px", 
                                fontSize: "11px", 
                                color: "var(--color-danger)",
                                backgroundColor: "hsl(0, 100%, 95%)",
                                padding: "1px 4px",
                                borderRadius: "var(--radius-sm)",
                                fontWeight: "600"
                              }}
                            >
                              <AlertTriangle size={11} /> Bắt buộc
                            </span>
                          )}
                        </div>

                        {target.type === "select" ? (
                          <select
                            className="form-input"
                            value={defaultValues[target.field] || ""}
                            onChange={(e) => onDefaultValueChange(target.field, e.target.value)}
                            style={{ 
                              padding: "4px 8px", 
                              fontSize: "12.5px", 
                              width: "100%",
                              borderRadius: "var(--radius-sm)",
                              height: "32px",
                              borderColor: showRequiredWarning ? "var(--color-danger)" : "hsl(210, 40%, 88%)"
                            }}
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
                            onChange={(e) => onDefaultValueChange(target.field, e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            style={{ 
                              padding: "4px 8px", 
                              fontSize: "12.5px", 
                              width: "100%",
                              borderRadius: "var(--radius-sm)",
                              height: "32px",
                              borderColor: showRequiredWarning ? "var(--color-danger)" : "hsl(210, 40%, 88%)"
                            }}
                          />
                        ) : target.type === "boolean" ? (
                          <select
                            className="form-input"
                            value={defaultValues[target.field] === true ? "true" : "false"}
                            onChange={(e) => onDefaultValueChange(target.field, e.target.value === "true")}
                            style={{ 
                              padding: "4px 8px", 
                              fontSize: "12.5px", 
                              width: "100%",
                              borderRadius: "var(--radius-sm)",
                              height: "32px",
                              borderColor: showRequiredWarning ? "var(--color-danger)" : "hsl(210, 40%, 88%)"
                            }}
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
                            style={{ 
                              padding: "4px 8px", 
                              fontSize: "12.5px", 
                              width: "100%",
                              borderRadius: "var(--radius-sm)",
                              height: "32px",
                              borderColor: showRequiredWarning ? "var(--color-danger)" : "hsl(210, 40%, 88%)"
                            }}
                          />
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
