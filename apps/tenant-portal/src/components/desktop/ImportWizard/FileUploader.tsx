import React, { useState, useRef } from "react";
import { Upload, Loader2, FileSpreadsheet, AlertCircle, Download } from "lucide-react";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
  error: string | null;
  onDownloadTemplate?: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  isAnalyzing,
  error,
  onDownloadTemplate,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const validateAndSelect = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "xlsx" || ext === "xls" || ext === "csv") {
      onFileSelect(file);
    } else {
      alert("Định dạng file không hợp lệ! Vui lòng chọn file .xlsx, .xls hoặc .csv");
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ padding: "32px 0" }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".xlsx,.xls,.csv"
        style={{ display: "none" }}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        style={{
          border: isDragOver
            ? "2px dashed var(--color-primary)"
            : "2px dashed hsl(210, 40%, 88%)",
          backgroundColor: isDragOver
            ? "hsl(210, 100%, 98%)"
            : "hsl(210, 40%, 99%)",
          borderRadius: "var(--radius-lg)",
          padding: "48px 24px",
          textAlign: "center",
          cursor: isAnalyzing ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="animate-spin" size={48} style={{ color: "var(--color-primary)" }} />
            <div>
              <h4 style={{ fontWeight: "600", fontSize: "15px", marginBottom: "6px" }}>
                Đang phân tích file bằng AI...
              </h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                DeepSeek đang tự động đối chiếu các tiêu đề cột dữ liệu của bạn.
              </p>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "hsl(210, 100%, 95%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-primary)",
              }}
            >
              <Upload size={28} />
            </div>
            <div>
              <h4 style={{ fontWeight: "600", fontSize: "15px", marginBottom: "6px" }}>
                Kéo thả file bảng tính vào đây
              </h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "16px" }}>
                Hỗ trợ định dạng .xlsx, .xls, .csv. Dung lượng tối đa 10MB.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadTemplate?.();
                  }}
                >
                  <Download size={15} />
                  Tải file mẫu Excel
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                >
                  Chọn file từ máy tính
                </button>
                
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <div
          style={{
            marginTop: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "hsl(0, 100%, 97%)",
            borderLeft: "4px solid var(--color-danger)",
            color: "var(--color-danger)",
            fontSize: "13px",
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
