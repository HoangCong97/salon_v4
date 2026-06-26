import React, { useState, useRef, useEffect } from "react";
import { Upload, ChevronDown, FileSpreadsheet, FileText } from "lucide-react";
import { exportToSpreadsheet, ExportFileType, ExportColumnMapping } from "../../utils/exportData";

interface ExportButtonProps<T> {
  data: T[];
  fileName: string;
  columns?: ExportColumnMapping[];
  buttonText?: string;
}

export function ExportButton<T>({
  data,
  fileName,
  columns,
  buttonText = "Xuất dữ liệu",
}: ExportButtonProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleExport = (type: ExportFileType) => {
    exportToSpreadsheet(data, fileName, type, columns);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        className="btn btn-secondary"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          whiteSpace: "nowrap",
          flexShrink: 0,
          borderColor: "hsl(142, 76%, 36%)",
          color: "hsl(142, 76%, 36%)",
          backgroundColor: "hsl(142, 76%, 97%)",
          transition: "background-color 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "hsl(142, 76%, 92%)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "hsl(142, 76%, 97%)";
        }}
      >
        <Upload size={16} />
        <span>{buttonText}</span>
        <ChevronDown size={14} style={{ opacity: 0.7 }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "6px",
            width: "180px",
            backgroundColor: "white",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            zIndex: 1000,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            padding: "4px 0",
          }}
        >
          <button
            onClick={() => handleExport("xlsx")}
            style={{
              padding: "10px 16px",
              fontSize: "13px",
              textAlign: "left",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "var(--text-primary)",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(210, 40%, 96%)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <FileSpreadsheet size={16} style={{ color: "hsl(142, 76%, 36%)" }} />
            <span>Excel (.xlsx)</span>
          </button>
          <button
            onClick={() => handleExport("xls")}
            style={{
              padding: "10px 16px",
              fontSize: "13px",
              textAlign: "left",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "var(--text-primary)",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(210, 40%, 96%)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <FileSpreadsheet size={16} style={{ color: "hsl(142, 76%, 45%)", opacity: 0.8 }} />
            <span>Excel 97-2003 (.xls)</span>
          </button>
          <button
            onClick={() => handleExport("csv")}
            style={{
              padding: "10px 16px",
              fontSize: "13px",
              textAlign: "left",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "var(--text-primary)",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(210, 40%, 96%)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <FileText size={16} style={{ color: "hsl(215, 20%, 50%)" }} />
            <span>Text CSV (.csv)</span>
          </button>
        </div>
      )}
    </div>
  );
}
