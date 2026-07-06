import React from "react";
import styles from "../Dashboard.module.css";

interface TableSectionHeaderProps {
  title: string | React.ReactNode;
}

export function TableSectionHeader({ title }: TableSectionHeaderProps) {
  return (
    <div className={styles.tableSectionHeader}>
      <h3 className="card-title" style={{ margin: 0 }}>{title}</h3>
    </div>
  );
}
