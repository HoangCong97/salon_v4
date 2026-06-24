import React, { useState } from "react";

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
  const [isFocused, setIsFocused] = useState(false);
  const showSuggestions = (unit === "đ" || unit === "VND") && isFocused;
  const {
    showSuggestion,
    suggestedValue,
    applySuggestion,
    handleKeyDown: handleSuggestionKeyDown
  } = usePriceSuggestion(value, onChange, false);

  const handleMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    if (document.activeElement !== e.currentTarget) {
      e.currentTarget.focus();
      e.preventDefault();
    }
  };

  const handleKeyDownEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions) {
      const handled = handleSuggestionKeyDown(e);
      if (handled) return;
    }

    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // Adjust paddings dynamically to prevent text from overlapping units
  const paddingLeft = textAlign === "center" ? ((unit && showUnit) ? (unit === "phút" ? "32px" : "24px") : "10px") : "10px";
  const paddingRight = (unit && showUnit) ? (unit === "phút" ? "32px" : "24px") : "10px";

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", zIndex: isFocused ? 50 : 1 }}>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => {
          setIsFocused(false);
          if (onBlur) onBlur();
        }}
        onKeyDown={handleKeyDownEvent}
        onFocus={(e) => {
          setIsFocused(true);
          e.target.select();
        }}
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
      {showSuggestions && (
        <PriceSuggestionBadge
          show={showSuggestion}
          suggestedValue={suggestedValue}
          onClick={applySuggestion}
        />
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
        width: "100%",
        height: "100%",
        padding: "0 10px",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
        boxSizing: "border-box",
        border: "none",
        borderRadius: "6px",
        ...colorStyle,
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

/* Reusable Price Suggestion logic and helpers */

export function usePriceSuggestion(
  value: string | number | undefined | null,
  onChange: (newValue: string) => void,
  multiSegment = false
) {
  const strValue = String(value ?? "");
  const cleanValue = multiSegment ? strValue : strValue.replace(/,/g, "");
  const segments = cleanValue.split(",");
  const lastSegment = segments[segments.length - 1] || "";
  const lastSegmentDigits = /^\d+$/.test(lastSegment.trim()) ? lastSegment.trim() : null;
  const showSuggestion = lastSegmentDigits !== null && lastSegmentDigits.length <= 4 && lastSegmentDigits.length > 0;
  const suggestedValue = lastSegmentDigits ? lastSegmentDigits + "000" : "";

  const applySuggestion = () => {
    if (!suggestedValue) return;
    if (multiSegment) {
      const segs = strValue.split(",");
      segs[segs.length - 1] = suggestedValue;
      const newValue = segs.join(", ") + ", ";
      onChange(newValue);
    } else {
      onChange(suggestedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && showSuggestion) {
      e.preventDefault();
      applySuggestion();
      return true; // Handled
    }
    return false; // Not handled
  };

  return {
    showSuggestion,
    suggestedValue,
    applySuggestion,
    handleKeyDown
  };
}

interface PriceSuggestionBadgeProps {
  show: boolean;
  suggestedValue: string;
  onClick: () => void;
  style?: React.CSSProperties;
}

export const PriceSuggestionBadge: React.FC<PriceSuggestionBadgeProps> = ({
  show,
  suggestedValue,
  onClick,
  style
}) => {
  if (!show || !suggestedValue) return null;

  const displayVal = Number(suggestedValue).toLocaleString("vi-VN") + "đ";

  return (
    <button
      type="button"
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        zIndex: 100,
        marginTop: "4px",
        padding: "4px 10px",
        fontSize: "12px",
        background: "var(--color-primary)",
        color: "white",
        border: "none",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontWeight: "600",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        whiteSpace: "nowrap",
        ...style
      }}
      onClick={onClick}
      onMouseDown={(e) => {
        // Prevent loss of focus on input which would trigger blur/auto-save before suggestion is clicked
        e.preventDefault();
      }}
    >
      <span>{displayVal}</span>
      <kbd
        style={{
          fontSize: "9px",
          padding: "1px 5px",
          borderRadius: "3px",
          background: "rgba(255,255,255,0.15)",
          fontFamily: "inherit",
          border: "none",
          color: "rgba(255,255,255,0.8)",
        }}
      >
        Enter ↵
      </kbd>
    </button>
  );
};

interface PriceInputWithSuggestionProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (val: string) => void;
  multiSegment?: boolean;
}

export const PriceInputWithSuggestion: React.FC<PriceInputWithSuggestionProps> = ({
  value,
  onChange,
  multiSegment = false,
  className = "form-input",
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const {
    showSuggestion,
    suggestedValue,
    applySuggestion,
    handleKeyDown
  } = usePriceSuggestion(value, onChange, multiSegment);

  const handleKeyDownEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const handled = handleKeyDown(e);
    if (!handled && props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", zIndex: isFocused ? 50 : 1 }}>
      <input
        {...props}
        className={className}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDownEvent}
        onFocus={(e) => {
          setIsFocused(true);
          if (props.onFocus) props.onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          if (props.onBlur) props.onBlur(e);
        }}
        style={style}
      />
      <PriceSuggestionBadge
        show={showSuggestion && isFocused}
        suggestedValue={suggestedValue}
        onClick={applySuggestion}
      />
    </div>
  );
};

interface ExcelChipsInputProps {
  values: number[];
  onChange: (newValues: number[]) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  disabled?: boolean;
  hasOutline?: boolean;
}

export const ExcelChipsInput: React.FC<ExcelChipsInputProps> = ({
  values = [],
  onChange,
  onBlur,
  onFocus,
  placeholder = "+ Giá...",
  disabled = false,
  hasOutline = true,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const addChip = (valStr: string) => {
    const cleaned = valStr.replace(/\D/g, "");
    if (!cleaned) return;
    const num = parseInt(cleaned, 10);
    if (!isNaN(num) && !values.includes(num)) {
      const nextValues = [...values, num];
      onChange(nextValues);
    }
    setInputValue("");
  };

  const removeChip = (indexToRemove: number) => {
    const nextValues = values.filter((_, idx) => idx !== indexToRemove);
    onChange(nextValues);
  };

  const {
    showSuggestion,
    suggestedValue,
    applySuggestion,
    handleKeyDown: handleSuggestionKeyDown
  } = usePriceSuggestion(inputValue, addChip, false);

  const handleInputChange = (val: string) => {
    if (val.includes(",")) {
      const parts = val.split(",");
      const toAdd = parts[0].trim();
      addChip(toAdd);
      setInputValue(parts[1] || "");
    } else {
      setInputValue(val);
    }
  };

  const handleKeyDownEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const handled = handleSuggestionKeyDown(e);
    if (handled) return;

    if (e.key === "Enter") {
      e.preventDefault();
      addChip(inputValue);
    } else if (e.key === "Backspace" && inputValue === "") {
      if (values.length > 0) {
        removeChip(values.length - 1);
        if (onBlur) {
          setTimeout(() => onBlur(), 0);
        }
      }
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (containerRef.current && e.target === containerRef.current) {
      const input = containerRef.current.querySelector("input");
      if (input) input.focus();
    }
  };

  const formatChipValue = (val: number): string => {
    return new Intl.NumberFormat("vi-VN").format(val) + "đ";
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "0 6px",
        boxSizing: "border-box",
        zIndex: isFocused ? 50 : 1,
        background: isFocused ? "white" : "transparent",
        outline: (isFocused && hasOutline) ? "2px solid var(--color-primary)" : "none",
        outlineOffset: "-2px",
        overflow: "visible",
        cursor: "text"
      }}
    >
      {values.map((val, idx) => (
        <span
          key={`${val}-${idx}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "2px 6px",
            fontSize: "11px",
            fontWeight: "600",
            backgroundColor: "var(--color-primary-light)",
            color: "var(--color-primary)",
            borderRadius: "4px",
            height: "24px",
            flexShrink: 0,
            boxSizing: "border-box"
          }}
        >
          {formatChipValue(val)}
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              removeChip(idx);
              if (onBlur) {
                setTimeout(() => onBlur(), 0);
              }
            }}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-primary)",
              fontSize: "12px",
              fontWeight: "bold",
              lineHeight: 1
            }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        disabled={disabled}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDownEvent}
        onFocus={() => {
          setIsFocused(true);
          if (onFocus) onFocus();
        }}
        onBlur={() => {
          setIsFocused(false);
          if (inputValue.trim()) {
            addChip(inputValue);
          }
          if (onBlur) onBlur();
        }}
        placeholder={values.length === 0 ? placeholder : ""}
        style={{
          border: "none",
          background: "transparent",
          height: "100%",
          flexGrow: values.length > 0 ? (isFocused ? 1 : 0) : 1,
          width: values.length > 0 ? (isFocused ? "60px" : "30px") : "100%",
          minWidth: values.length > 0 ? (isFocused ? "50px" : "30px") : "60px",
          fontSize: "13px",
          padding: 0,
          outline: "none",
          boxShadow: "none"
        }}
      />
      <PriceSuggestionBadge
        show={showSuggestion && isFocused}
        suggestedValue={suggestedValue}
        onClick={applySuggestion}
      />
    </div>
  );
};

