import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

import { CustomNumberInputProps } from "./types";

export const CustomNumberInput: React.FC<CustomNumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled,
  placeholder,
  className,
  style,
}) => {
  const handleIncrement = () => {
    if (disabled) return;
    const currentVal = value !== undefined && value !== null && !isNaN(value) ? value : (min !== undefined ? min : 0);
    let nextVal = currentVal + step;
    if (max !== undefined && nextVal > max) nextVal = max;
    onChange(nextVal);
  };

  const handleDecrement = () => {
    if (disabled) return;
    const currentVal = value !== undefined && value !== null && !isNaN(value) ? value : (min !== undefined ? min : 0);
    let nextVal = currentVal - step;
    if (min !== undefined && nextVal < min) nextVal = min;
    onChange(nextVal);
  };

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
      <input
        className={`form-input custom-number-input ${className || ""}`}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          onChange(isNaN(val) ? 0 : val);
        }}
        disabled={disabled}
        placeholder={placeholder}
        style={{
          ...style,
          width: "100%",
          paddingRight: "44px",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "1px",
          top: "1px",
          bottom: "1px",
          width: "36px",
          display: "flex",
          flexDirection: "column",
          gap: "1px",
          zIndex: 5,
        }}
      >
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "hsl(210, 40%, 96%)",
            border: "none",
            borderLeft: "1px solid hsl(210, 40%, 90%)",
            borderTopRightRadius: "var(--radius-sm)",
            cursor: disabled ? "not-allowed" : "pointer",
            color: "var(--text-secondary)",
            padding: 0,
            transition: "background 0.15s ease",
            outline: "none",
            height: "50%",
          }}
          onMouseEnter={(e) => !disabled && (e.currentTarget.style.backgroundColor = "hsl(210, 40%, 90%)")}
          onMouseLeave={(e) => !disabled && (e.currentTarget.style.backgroundColor = "hsl(210, 40%, 96%)")}
        >
          <ChevronUp size={16} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "hsl(210, 40%, 96%)",
            border: "none",
            borderLeft: "1px solid hsl(210, 40%, 90%)",
            borderBottomRightRadius: "var(--radius-sm)",
            cursor: disabled ? "not-allowed" : "pointer",
            color: "var(--text-secondary)",
            padding: 0,
            transition: "background 0.15s ease",
            outline: "none",
            height: "50%",
          }}
          onMouseEnter={(e) => !disabled && (e.currentTarget.style.backgroundColor = "hsl(210, 40%, 90%)")}
          onMouseLeave={(e) => !disabled && (e.currentTarget.style.backgroundColor = "hsl(210, 40%, 96%)")}
        >
          <ChevronDown size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
