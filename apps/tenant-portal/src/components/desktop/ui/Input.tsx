import React, { forwardRef } from "react";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", style, ...props }, ref) => {
    const inputClass = [
      styles.input,
      icon ? styles.inputWithIcon : "",
      error ? styles.errorInput : "",
      className,
    ].filter(Boolean).join(" ");

    return (
      <div className={styles.wrapper} style={style}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.inputContainer}>
          {icon && <div className={styles.iconWrapper}>{icon}</div>}
          <input ref={ref} className={inputClass} {...props} />
        </div>
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
