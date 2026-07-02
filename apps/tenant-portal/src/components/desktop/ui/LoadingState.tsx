import React from "react";
import { Loader2 } from "lucide-react";
import styles from "./LoadingState.module.css";

interface LoadingStateProps {
  text?: string;
  size?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  text,
  size = 32,
}) => {
  return (
    <div className={styles.loadingWrapper}>
      <Loader2 className={`animate-spin ${styles.loader}`} size={size} />
      {text && <span className={styles.loadingText}>{text}</span>}
    </div>
  );
};

export default LoadingState;
