import React, { useState } from "react";
import { createPortal } from "react-dom";

interface ExcelInputProps {
  value: string | number | undefined | null;
  onChange: (val: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  type?: "text" | "number" | "password";
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
  colorStyle?: React.CSSProperties;
}

interface ExcelSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: ExcelSelectOption[];
  colorStyle?: React.CSSProperties;
  placeholder?: string;
  disabled?: boolean;
  allowCustom?: boolean;
  unit?: string;
  className?: string;
}

export const ExcelSelect: React.FC<ExcelSelectProps> = ({
  value,
  onChange,
  options,
  colorStyle,
  placeholder = "-- Chọn --",
  disabled = false,
  allowCustom = false,
  unit,
  className = "excel-select",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0, width: 0 });
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const canOpen = !disabled && options && options.length > 0;
  const showPriceSuggestion = (unit === "đ" || unit === "VND") && isFocused;
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

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isOpen) {
          setIsOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const cleanStr = (s: string) => (s || "").replace(/\D/g, "");

  const selectedOpt = options.find(opt => {
    if (opt.value === value) return true;
    const cleanOpt = cleanStr(opt.value);
    const cleanVal = cleanStr(value);
    return cleanOpt && cleanVal && cleanOpt === cleanVal;
  });

  const displayLabel = selectedOpt ? selectedOpt.label : (value || placeholder);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {allowCustom ? (
        <div
          className={className}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            height: "100%",
            position: "relative",
            borderRadius: "var(--radius-sm)",
            boxSizing: "border-box",
            outline: isFocused ? "2px solid var(--color-primary)" : "none",
            outlineOffset: "-2px",
            background: isFocused ? "white" : "transparent",
            ...colorStyle,
          }}
        >
          <input
            type="text"
            disabled={disabled}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={(e) => {
              setIsFocused(true);
              e.target.select();
            }}
            onBlur={() => setIsFocused(false)}
            onMouseDown={handleMouseDown}
            onKeyDown={(e) => {
              if (showPriceSuggestion) {
                const handled = handleSuggestionKeyDown(e);
                if (handled) return;
              }
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "transparent",
              textAlign: "center",
              fontSize: "12px",
              fontWeight: colorStyle?.fontWeight || "500",
              color: "inherit",
              paddingLeft: "16px",
              paddingRight: canOpen ? "24px" : "16px",
              boxSizing: "border-box",
              outline: "none"
            }}
          />
          {canOpen && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setIsOpen(!isOpen);
              }}
              style={{
                position: "absolute",
                right: "4px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                fontSize: "9px"
              }}
            >
              ▼
            </button>
          )}
          {showPriceSuggestion && (
            <PriceSuggestionBadge
              show={showSuggestion}
              suggestedValue={suggestedValue}
              onClick={applySuggestion}
            />
          )}
        </div>
      ) : (
        <div
          onClick={() => {
            if (canOpen) setIsOpen(!isOpen);
          }}
          className={className}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            padding: canOpen ? "0 24px 0 10px" : "0 10px",
            fontSize: "12px",
            fontWeight: "500",
            cursor: disabled ? "not-allowed" : (canOpen ? "pointer" : "default"),
            boxSizing: "border-box",
            borderRadius: "var(--radius-sm)",
            position: "relative",
            userSelect: "none",
            ...colorStyle,
          }}
        >
          <span style={{ 
            textAlign: "center", 
            width: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}>
            {displayLabel}
          </span>
          {canOpen && (
            <span style={{ position: "absolute", right: "8px", fontSize: "9px", color: "var(--text-muted)" }}>
              ▼
            </span>
          )}
        </div>
      )}

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: `${dropdownCoords.top}px`,
            left: `${dropdownCoords.left}px`,
            width: `${dropdownCoords.width}px`,
            maxHeight: "200px",
            overflowY: "auto",
            backgroundColor: "white",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            zIndex: 9999,
            marginTop: "2px",
            padding: "4px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            const isHovered = hoveredValue === opt.value;
            return (
              <div
                key={opt.value}
                onMouseEnter={() => setHoveredValue(opt.value)}
                onMouseLeave={() => setHoveredValue(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: "8px 10px",
                  borderRadius: "16px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  textAlign: "center",
                  transition: "all 0.1s ease",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  filter: isHovered ? "brightness(0.95)" : "none",
                  ...((isSelected || !opt.colorStyle) ? {
                    background: isSelected 
                      ? "var(--color-primary-light)" 
                      : (isHovered ? "var(--bg-app)" : "transparent"),
                    color: isSelected || isHovered
                      ? "var(--color-primary)" 
                      : "var(--text-primary)",
                  } : {}),
                  ...(opt.colorStyle || {}),
                }}
                className="excel-select-option"
              >
                {opt.label}
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </div>
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
  onBlur?: (newValues?: number[]) => void;
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
    if (onBlur) {
      onBlur(nextValues);
    }
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
          let nextValues = values;
          if (inputValue.trim()) {
            const cleaned = inputValue.replace(/\D/g, "");
            if (cleaned) {
              const num = parseInt(cleaned, 10);
              if (!isNaN(num) && !values.includes(num)) {
                nextValues = [...values, num];
                onChange(nextValues);
              }
            }
            setInputValue("");
          }
          if (onBlur) {
            onBlur(nextValues);
          }
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

interface ExcelMultipleSelectOption {
  value: string;
  label: string;
}

interface ExcelMultipleSelectProps {
  values: string[];
  onChange: (newValues: string[]) => void;
  onBlur?: () => void;
  options: ExcelMultipleSelectOption[];
  placeholder?: string;
  disabled?: boolean;
}

export const ExcelMultipleSelect: React.FC<ExcelMultipleSelectProps> = ({
  values = [],
  onChange,
  onBlur,
  options,
  placeholder = "-- Chọn --",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isOpen) {
          setIsOpen(false);
          setSearchTerm("");
          if (onBlur) onBlur();
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onBlur]);

  const handleToggle = (val: string) => {
    let nextValues;
    if (values.includes(val)) {
      nextValues = values.filter((v) => v !== val);
    } else {
      nextValues = [...values, val];
    }
    onChange(nextValues);
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLabels = options
    .filter((opt) => values.includes(opt.value))
    .map((opt) => opt.label.replace(/HairStar|BarberShop| - Chi nhánh/g, "").trim());

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Trigger Area */}
      <div
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "0 10px",
          fontSize: "12px",
          cursor: disabled ? "not-allowed" : "pointer",
          boxSizing: "border-box",
          borderRadius: "var(--radius-sm)",
          background: isOpen ? "white" : "transparent",
          outline: isOpen ? "2px solid var(--color-primary)" : "none",
          outlineOffset: "-2px",
        }}
        className="excel-multiple-select-trigger"
      >
        <div
          style={{
            display: "flex",
            gap: "4px",
            flexWrap: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            alignItems: "center",
            maxWidth: "calc(100% - 20px)",
          }}
        >
          {selectedLabels.length === 0 ? (
            <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>{placeholder}</span>
          ) : (
            selectedLabels.map((lbl, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: "11px",
                  padding: "1px 6px",
                  borderRadius: "10px",
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #e2e8f0",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {lbl}
              </span>
            ))
          )}
        </div>
        <span style={{ color: "var(--text-muted)", fontSize: "10px", flexShrink: 0, marginLeft: "4px" }}>
          ▼
        </span>
      </div>

      {/* Dropdown Menu via Portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: `${dropdownCoords.top}px`,
            left: `${dropdownCoords.left}px`,
            width: `${Math.max(260, dropdownCoords.width)}px`,
            maxHeight: "260px",
            backgroundColor: "white",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            zIndex: 9999,
            marginTop: "2px",
            padding: "8px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {/* Search Box */}
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                height: "30px",
                padding: "4px 8px 4px 28px",
                fontSize: "12px",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                boxSizing: "border-box",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "12px",
                color: "var(--text-muted)",
              }}
            >
              🔍
            </span>
          </div>

          {/* Options List */}
          <div
            style={{
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              flexGrow: 1,
            }}
          >
            {filteredOptions.length === 0 ? (
              <div style={{ padding: "8px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
                Không tìm thấy kết quả
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isChecked = values.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(opt.value);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 8px",
                      borderRadius: "calc(var(--radius-sm) - 2px)",
                      cursor: "pointer",
                      fontSize: "12px",
                      background: isChecked ? "var(--color-primary-light)" : "transparent",
                      color: isChecked ? "var(--color-primary)" : "var(--text-primary)",
                      transition: "all 0.1s ease",
                    }}
                    className="excel-multiple-select-option"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => { }}
                      style={{ cursor: "pointer" }}
                    />
                    <span style={{ fontWeight: isChecked ? "600" : "400", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {opt.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

interface ExcelRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  onImageDrop?: (file: File) => void;
}

export const ExcelRow: React.FC<ExcelRowProps> = ({
  children,
  onImageDrop,
  style,
  ...props
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    if (!onImageDrop) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLTableRowElement>) => {
    if (!onImageDrop) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>) => {
    if (!onImageDrop) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        onImageDrop(file);
      }
    }
  };

  return (
    <tr
      {...props}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        transition: "all 0.15s ease",
        backgroundColor: isDragging ? "var(--color-primary-light)" : undefined,
        outline: isDragging ? "2px dashed var(--color-primary)" : undefined,
        outlineOffset: "-2px",
        ...style
      }}
    >
      {children}
    </tr>
  );
};


