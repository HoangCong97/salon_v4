import React from "react";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const PageHeader: React.FC<React.PropsWithChildren<PageHeaderProps>> = ({
  title,
  subtitle,
  icon,
  children,
}) => {
  return (
    <div className={styles.headerRow}>
      <div className={styles.headerTitleWrapper}>
        {icon && <div className={styles.headerIconBg}>{icon}</div>}
        <div className={styles.headerTextWrapper}>
          <h2 className={styles.headerTitle}>{title}</h2>
          {subtitle && <span className={styles.headerSubtitle}>{subtitle}</span>}
        </div>
      </div>
      {children && <div className={styles.actionsWrapper}>{children}</div>}
    </div>
  );
};
export default PageHeader;
