import React from 'react';
import styles from "../shared/loadingSpinner.module.css";

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Loading..." }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner} />
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;