import React from "react";
import { Download } from "lucide-react";

interface ImportButtonProps {
  onClick: () => void;
  buttonText?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ImportButton({
  onClick,
  buttonText = "Nhập dữ liệu",
  className = "",
  style = {},
}: ImportButtonProps) {
  return (
    <button
      className={`btn btn-secondary ${className}`}
      onClick={onClick}
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
        cursor: "pointer",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "hsl(142, 76%, 92%)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "hsl(142, 76%, 97%)";
      }}
    >
      <Download size={16} /> {buttonText}
    </button>
  );
}
