import React from 'react';
import styles from "../shared/chat.module.css";

interface RegenerateButtonProps {
  onRegenerate: () => void;
  isRegenerating: boolean;
  showButton: boolean;
}

const RegenerateButton: React.FC<RegenerateButtonProps> = ({ 
  onRegenerate, 
  isRegenerating, 
  showButton 
}) => {
  if (!showButton) return null;

  return (
    <div className={styles.regenerateContainer}>
      <button
        onClick={onRegenerate}
        disabled={isRegenerating}
        className={styles.regenerateButton}
      >
        {isRegenerating ? "Regenerating..." : "Regenerate response"}
      </button>
    </div>
  );
};

export default RegenerateButton;