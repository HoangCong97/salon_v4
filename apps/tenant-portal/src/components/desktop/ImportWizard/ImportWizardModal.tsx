import React, { useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { useImportWizard, TargetField } from "../../../hooks/useImportWizard";
import * as XLSX from "xlsx";
import { FileUploader } from "./FileUploader";
import { ColumnMapper } from "./ColumnMapper";
import { ImportReport } from "./ImportReport";
import { useAuthStore } from "../../../store/useAuthStore";

interface ImportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Triggered when import is successful (refreshes data in the parent page)
  entity: string; // e.g. "service", "inventory", "staff"
  entityLabel: string; // e.g. "Dịch vụ", "Hàng hóa", "Nhân viên"
  targetSchema: TargetField[];
  droppedFile?: File | null;
}

export const ImportWizardModal: React.FC<ImportWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  entity,
  entityLabel,
  targetSchema,
  droppedFile,
}) => {
  const { currentTenantId, currentBranchId } = useAuthStore();
  
  const {
    step,
    setStep,
    fileName,
    fileHeaders,
    sampleRows,
    mappings,
    defaultValues,
    isAnalyzing,
    isImporting,
    report,
    error,
    setError,
    handleFileSelect,
    handleMappingChange,
    handleDefaultValueChange,
    executeImport,
    reset,
  } = useImportWizard(targetSchema);

  // Reset state when opening/closing
  useEffect(() => {
    if (isOpen) {
      reset();
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    }
  }, [isOpen, droppedFile]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isImporting || isAnalyzing) return;
    onClose();
  };

  const handleImportClick = async () => {
    if (!currentTenantId) return;
    
    // Check if there are unmapped required fields that lack default values
    const unmappedRequired = targetSchema.filter(t => {
      const isMapped = Object.values(mappings).includes(t.field);
      const hasDefault = defaultValues[t.field] !== undefined && defaultValues[t.field] !== null && String(defaultValues[t.field]).trim() !== "";
      return t.required && !isMapped && !hasDefault;
    });

    if (unmappedRequired.length > 0) {
      const fieldNames = unmappedRequired.map(f => `"${f.label}"`).join(", ");
      setError(`Vui lòng đối chiếu cột hoặc nhập giá trị mặc định cho trường bắt buộc: ${fieldNames}`);
      return;
    }

    await executeImport(entity, currentTenantId, currentBranchId);
  };

  const handleFinish = () => {
    onSuccess();
    onClose();
  };

  const handleDownloadTemplate = () => {
    try {
      const headers = targetSchema.map(t => t.label);
      const worksheet = XLSX.utils.aoa_to_sheet([headers]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "MauNhapLieu");

      // Add a helpful sample row based on the field types to guide users
      const sampleRow = targetSchema.map(t => {
        if (t.field === "name") {
          return `Ví dụ ${entityLabel} A`;
        }
        if (t.type === "number") {
          if (t.field.toLowerCase().includes("price") || t.field.toLowerCase().includes("amount") || t.field.toLowerCase().includes("salary")) {
            return 150000;
          }
          if (t.field.toLowerCase().includes("duration")) {
            return 45;
          }
          return 1;
        }
        if (t.type === "boolean") {
          return "Có";
        }
        if (t.type === "select") {
          return t.options?.[0]?.label || "";
        }
        return "";
      });

      XLSX.utils.sheet_add_aoa(worksheet, [sampleRow], { origin: "A2" });
      
      const cleanLabel = entityLabel.toLowerCase().replace(/\s+/g, "_");
      XLSX.writeFile(workbook, `mau_nhap_lieu_${cleanLabel}.xlsx`);
    } catch (err: any) {
      setError("Không thể tải file mẫu. Vui lòng thử lại hoặc tải lại trang.");
    }
  };

  return (
    <div
      className="modal-overlay animate-fade-in"
      onClick={handleClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        className="modal-content animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: "800px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid hsl(210, 40%, 93%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>
              Nhập danh sách {entityLabel} từ Excel
            </h3>
            {fileName && (
              <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>
                File: {fileName}
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={isImporting || isAnalyzing}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
              borderRadius: "var(--radius-full)",
              transition: "all 0.15s ease",
            }}
            className="hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Wizard Steps Progress Header */}
        <div
          style={{
            display: "flex",
            backgroundColor: "hsl(210, 40%, 98%)",
            borderBottom: "1px solid hsl(210, 40%, 93%)",
            fontSize: "12px",
            fontWeight: "600",
            color: "var(--text-secondary)",
          }}
        >
          {[
            { s: 1, label: "Tải file lên" },
            { s: 2, label: "Khớp cột dữ liệu" },
            { s: 3, label: "Hoàn tất & Báo cáo" },
          ].map((item) => {
            const isActive = step === item.s;
            const isCompleted = step > item.s;
            return (
              <div
                key={item.s}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px",
                  borderBottom: isActive ? "2px solid var(--color-primary)" : "2px solid transparent",
                  color: isActive
                    ? "var(--color-primary)"
                    : isCompleted
                    ? "var(--color-success)"
                    : "var(--text-muted)",
                  transition: "all 0.2s ease",
                  backgroundColor: isActive ? "white" : "transparent"
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: isActive
                      ? "var(--color-primary)"
                      : isCompleted
                      ? "var(--color-success)"
                      : "hsl(210, 40%, 90%)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                  }}
                >
                  {isCompleted ? <Check size={12} strokeWidth={3} /> : item.s}
                </div>
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Modal Scrollable Content */}
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {step === 1 && (
            <FileUploader
              onFileSelect={handleFileSelect}
              isAnalyzing={isAnalyzing}
              error={error}
              onDownloadTemplate={handleDownloadTemplate}
            />
          )}

          {step === 2 && (
            <ColumnMapper
              fileHeaders={fileHeaders}
              sampleRows={sampleRows}
              targetSchema={targetSchema}
              mappings={mappings}
              defaultValues={defaultValues}
              onMappingChange={handleMappingChange}
              onDefaultValueChange={handleDefaultValueChange}
            />
          )}

          {step === 3 && <ImportReport report={report} />}

          {/* Inline notification error (Step 2/3) */}
          {error && step > 1 && (
            <div
              style={{
                marginTop: "16px",
                padding: "10px 14px",
                backgroundColor: "hsl(0, 100%, 97%)",
                borderLeft: "4px solid var(--color-danger)",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-danger)",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid hsl(210, 40%, 93%)",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            alignItems: "center",
          }}
        >
          {step === 1 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isAnalyzing}
            >
              Hủy
            </button>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setStep(1);
                  setError(null);
                }}
                disabled={isImporting}
              >
                Quay lại
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleImportClick}
                disabled={isImporting}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                {isImporting && <Loader2 className="animate-spin" size={16} />}
                Xác nhận & Nhập dữ liệu
              </button>
            </>
          )}

          {step === 3 && (
            <button type="button" className="btn btn-primary" onClick={handleFinish}>
              Hoàn tất
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
