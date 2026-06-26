import { useState } from "react";
import * as XLSX from "xlsx";

export interface TargetField {
  field: string;
  label: string;
  type: "string" | "number" | "boolean" | "select";
  required: boolean;
  options?: Array<{ value: string; label: string }>;
  description?: string;
}

export interface ImportReportData {
  importedCount: number;
  failedCount: number;
  errors: Array<{ row: number; data: any; reason: string }>;
}

export function useImportWizard(targetSchema: TargetField[]) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState<string>("");
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<any[][]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [defaultValues, setDefaultValues] = useState<Record<string, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [report, setReport] = useState<ImportReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset the wizard state
  const reset = () => {
    setStep(1);
    setFileName("");
    setFileHeaders([]);
    setSampleRows([]);
    setRawData([]);
    setMappings({});
    setDefaultValues({});
    setReport(null);
    setError(null);
    setIsAnalyzing(false);
    setIsImporting(false);
  };

  // Read the uploaded file (XLSX, XLS, CSV) and parse headers + rows
  const handleFileSelect = (file: File) => {
    setFileName(file.name);
    setIsAnalyzing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(new Uint8Array(buffer), { type: "array", codepage: 65001 });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to array of objects
        const rows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: "" });
        if (rows.length === 0) {
          throw new Error("File trống hoặc không hợp lệ.");
        }

        // Get headers from first row keys
        const headers = Object.keys(rows[0]).filter(k => !k.startsWith("__rowNum"));
        setFileHeaders(headers);
        setRawData(rows);

        // Get up to 3 sample rows as arrays
        const samples = rows.slice(0, 3).map(row => 
          headers.map(h => row[h]?.toString() || "")
        );
        setSampleRows(samples);

        // Call backend API to analyze mapping suggestions using DeepSeek
        await getMappingSuggestions(headers, samples);
      } catch (err: any) {
        setError(err.message || "Không thể đọc file. Vui lòng kiểm tra lại định dạng.");
        setIsAnalyzing(false);
      }
    };

    reader.onerror = () => {
      setError("Lỗi đọc file.");
      setIsAnalyzing(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // Request AI mapping suggestions from backend
  const getMappingSuggestions = async (headers: string[], samples: any[][]) => {
    try {
      const res = await fetch("http://localhost:3000/api/import/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileHeaders: headers,
          sampleRows: samples,
          targetSchema
        })
      });

      if (!res.ok) throw new Error("Không thể phân tích file bằng AI");
      const data = await res.json();

      // Convert mapping array to key-value map: File Header -> Target Field
      const initialMappings: Record<string, string> = {};
      if (Array.isArray(data.mappings)) {
        for (const m of data.mappings) {
          initialMappings[m.fileHeader] = m.targetField;
        }
      }
      setMappings(initialMappings);

      // Pre-fill default values for unmapped required fields
      const initialDefaults: Record<string, any> = {};
      for (const t of targetSchema) {
        const isMapped = Object.values(initialMappings).includes(t.field);
        if (!isMapped) {
          if (t.type === "number") initialDefaults[t.field] = 0;
          else if (t.type === "boolean") initialDefaults[t.field] = false;
          else initialDefaults[t.field] = "";
        }
      }
      setDefaultValues(initialDefaults);

      setStep(2); // Go to Step 2 (Mapping)
    } catch (err: any) {
      setError(err.message || "Lỗi phân tích gợi ý trường.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMappingChange = (fileHeader: string, targetField: string) => {
    setMappings(prev => {
      const updated = { ...prev };
      if (!targetField) {
        delete updated[fileHeader];
      } else {
        // Prevent duplicate mapping: remove previous headers mapped to the same target field
        for (const [key, val] of Object.entries(updated)) {
          if (val === targetField) {
            delete updated[key];
          }
        }
        updated[fileHeader] = targetField;
      }
      return updated;
    });
  };

  const handleDefaultValueChange = (field: string, value: any) => {
    setDefaultValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Submit parsed data + mapping config to backend to execute imports
  const executeImport = async (entity: string, tenantId: string, branchId: string | null) => {
    setIsImporting(true);
    setError(null);

    try {
      const url = `http://localhost:3000/api/import/execute/${entity}?tenantId=${tenantId}${branchId ? `&branchId=${branchId}` : ""}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawData,
          mappings,
          defaultValues
        })
      });

      if (!res.ok) throw new Error("Lỗi kết nối máy chủ khi import.");
      const resultData = await res.json();
      
      setReport(resultData);
      setStep(3); // Go to Step 3 (Report)
    } catch (err: any) {
      setError(err.message || "Lỗi thực thi nhập dữ liệu.");
    } finally {
      setIsImporting(false);
    }
  };

  return {
    step,
    setStep,
    fileName,
    fileHeaders,
    sampleRows,
    rawData,
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
    reset
  };
}
