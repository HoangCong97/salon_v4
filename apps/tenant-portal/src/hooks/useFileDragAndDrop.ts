import { useState, useEffect, useRef } from "react";

export function useFileDragAndDrop(onFileDrop: (file: File) => void) {
  const [isDragActive, setIsDragActive] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    const isSpreadsheetDrag = (dt: DataTransfer) => {
      if (!dt.items || dt.items.length === 0) return false;
      const items = Array.from(dt.items);
      
      const hasFiles = items.some(item => item.kind === "file");
      if (!hasFiles) return false;

      const hasImages = items.some(item => item.kind === "file" && item.type.startsWith("image/"));
      if (hasImages) return false;

      const spreadsheetTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
        "application/vnd.ms-excel", // xls
        "text/csv", // csv
        "application/csv",
        "text/x-csv",
        "application/csv",
      ];

      return items.some(item => 
        item.kind === "file" && 
        (spreadsheetTypes.includes(item.type) || item.type === "")
      );
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.dataTransfer && isSpreadsheetDrag(e.dataTransfer)) {
        dragCounter.current++;
        setIsDragActive(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer && isSpreadsheetDrag(e.dataTransfer)) {
        e.dataTransfer.dropEffect = "copy";
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.dataTransfer && isSpreadsheetDrag(e.dataTransfer)) {
        dragCounter.current--;
        // Check if cursor leaves viewport or if counter is 0 or less
        // e.clientY <= 0, e.clientX <= 0, etc. check if drag left window
        if (
          dragCounter.current <= 0 ||
          e.clientY <= 0 ||
          e.clientX <= 0 ||
          e.clientX >= window.innerWidth ||
          e.clientY >= window.innerHeight ||
          !e.relatedTarget
        ) {
          dragCounter.current = 0;
          setIsDragActive(false);
        }
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      dragCounter.current = 0;

      if (e.dataTransfer && isSpreadsheetDrag(e.dataTransfer)) {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
          const file = files[0];
          const ext = file.name.split(".").pop()?.toLowerCase();
          if (ext === "xlsx" || ext === "xls" || ext === "csv") {
            onFileDrop(file);
          }
        }
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [onFileDrop]);

  return { isDragActive };
}
