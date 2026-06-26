import * as XLSX from "xlsx";

export type ExportFileType = "xlsx" | "xls" | "csv";

export interface ExportColumnMapping {
  key: string;
  header: string;
  transform?: (val: any) => any;
}

export function exportToSpreadsheet<T>(
  data: T[],
  fileName: string,
  fileType: ExportFileType,
  columns?: ExportColumnMapping[]
) {
  const sheetData: any[][] = [];

  // 1. Add headers row
  if (columns && columns.length > 0) {
    sheetData.push(columns.map(c => c.header));
  } else if (data.length > 0) {
    sheetData.push(Object.keys(data[0] as any));
  }

  // 2. Add data rows
  if (columns && columns.length > 0) {
    for (const row of data) {
      const rowData = columns.map(col => {
        let val = (row as any)[col.key];
        if (col.transform) {
          val = col.transform(val);
        }
        return val !== undefined && val !== null ? val : "";
      });
      sheetData.push(rowData);
    }
  } else {
    for (const row of data) {
      sheetData.push(Object.values(row as any));
    }
  }

  // 3. Create sheet
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // 3. Write file and trigger download
  if (fileType === "csv") {
    // UTF-8 CSV with BOM for Vietnamese characters Excel compatibility
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // Write XLSX / XLS binary representation
    const bookType = fileType === "xls" ? "biff8" : "xlsx";
    const wbout = XLSX.write(workbook, { bookType, type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${fileName}.${fileType}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
