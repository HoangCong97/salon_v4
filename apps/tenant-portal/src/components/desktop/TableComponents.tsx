import React from "react";

interface ExcelInputProps {
  value: string | number | undefined | null;
  onChange: (val: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  type?: "text" | "number";
  placeholder?: string;
  textAlign?: "left" | "center" | "right";
  fontWeight?: string | number;
  textColor?: string;
  unit?: string;
  unitColor?: string;
  showUnit?: boolean;
  disabled?: boolean;
}

export const ExcelInput: React.FC<ExcelInputProps> = ({
  value,
  onChange,
  onBlur,
  onKeyDown,
  type = "text",
  placeholder,
  textAlign = "left",
  fontWeight,
  textColor,
  unit,
  unitColor,
  showUnit = true,
  disabled = false,
}) => {
  const handleMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    if (document.activeElement !== e.currentTarget) {
      e.currentTarget.focus();
      e.preventDefault();
    }
  };

  const handleKeyDownEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // Adjust paddings dynamically to prevent text from overlapping units
  const paddingLeft = textAlign === "center" ? (unit ? (unit === "phút" ? "32px" : "24px") : "10px") : "10px";
  const paddingRight = unit ? (unit === "phút" ? "32px" : "24px") : "10px";

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center" }}>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={handleKeyDownEvent}
        onFocus={(e) => e.target.select()}
        onMouseDown={handleMouseDown}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          border: "none",
          background: "transparent",
          width: "100%",
          height: "100%",
          paddingLeft,
          paddingRight,
          fontSize: "13px",
          textAlign,
          fontWeight,
          color: textColor || "var(--text-primary)",
          boxSizing: "border-box",
          borderRadius: 0,
        }}
        className="excel-input"
      />
      {unit && showUnit && (
        <span
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: unit === "phút" ? "11px" : "12px",
            color: unitColor || "var(--text-muted)",
            pointerEvents: "none",
            fontWeight: fontWeight || "500",
          }}
        >
          {unit}
        </span>
      )}
    </div>
  );
};

interface ExcelSelectOption {
  value: string;
  label: string;
}

interface ExcelSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: ExcelSelectOption[];
  colorStyle?: React.CSSProperties;
  placeholder?: string;
  disabled?: boolean;
}

export const ExcelSelect: React.FC<ExcelSelectProps> = ({
  value,
  onChange,
  options,
  colorStyle,
  placeholder = "-- Chọn --",
  disabled = false,
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{
        ...colorStyle,
        width: "100%",
        height: "100%",
        padding: "0 10px",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
        boxSizing: "border-box",
        border: "none",
        borderRadius: "6px",
      }}
      className="excel-select"
    >
      <option value="" style={{ color: "var(--text-primary)" }}>{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} style={{ color: "var(--text-primary)" }}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
