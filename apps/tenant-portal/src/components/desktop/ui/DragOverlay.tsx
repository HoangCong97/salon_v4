import React from "react";
import { Upload } from "lucide-react";
import styles from "./DragOverlay.module.css";

interface DragOverlayProps {
  isActive: boolean;
  title?: string;
  description?: string;
}

export const DragOverlay: React.FC<DragOverlayProps> = ({
  isActive,
  title = "Thả file Excel/CSV vào đây",
  description = "Hệ thống sẽ tự động phân tích và đối chiếu cột dữ liệu bằng AI.",
}) => {
  if (!isActive) return null;

  return (
    <div className={styles.dragOverlay}>
      <div className={styles.dragCard}>
        <Upload size={48} className="animate-bounce" />
        <h3 className={styles.dragTitle}>{title}</h3>
        <p className={styles.dragDesc}>{description}</p>
      </div>
    </div>
  );
};

export default DragOverlay;
