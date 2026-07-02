import React from "react";
import { Info } from "lucide-react";
import styles from "./ErrorState.module.css";

interface ErrorStateProps {
  title?: string;
  message: string;
  icon?: React.ReactNode;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Lỗi nạp dữ liệu",
  message,
  icon = <Info size={16} />,
}) => {
  return (
    <div className={`card ${styles.errorCard}`}>
      <h3 className={styles.errorTitle}>
        {icon} {title}
      </h3>
      <p className={styles.errorDesc}>{message}</p>
    </div>
  );
};

export default ErrorState;
