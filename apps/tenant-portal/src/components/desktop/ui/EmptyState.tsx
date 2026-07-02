import React from "react";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<React.PropsWithChildren<EmptyStateProps>> = ({
  title,
  description,
  icon,
  children,
}) => {
  return (
    <div className={`card ${styles.emptyCard}`}>
      {icon && <div className={styles.emptyIcon}>{icon}</div>}
      <h3 className={styles.emptyTitle}>{title}</h3>
      {description && <p className={styles.emptyDesc}>{description}</p>}
      {children && <div className={styles.emptyActions}>{children}</div>}
    </div>
  );
};

export default EmptyState;
