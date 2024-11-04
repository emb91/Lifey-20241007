import { Button } from '../ui/Button';
import styles from "../../shared/deleteConfirmation.module.css";

interface SaveConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskName: string;
}

export function SaveConfirmationPopup({ 
  isOpen, 
  onClose, 
  onConfirm, 
  taskName 
}: SaveConfirmationPopupProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popupContainer}>
        <h3 className={styles.title}>Save Changes</h3>
        <p className={styles.message}>
          Are you sure you want to save the changes to "{taskName}"?
        </p>
        <div className={styles.buttonContainer}>
          <Button
            onClick={onClose}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}