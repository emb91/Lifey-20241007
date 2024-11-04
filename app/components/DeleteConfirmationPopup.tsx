import { Button } from './ui/Button';
import styles from "../shared/deleteConfirmation.module.css";

interface DeleteConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileName: string;
  fileType: string;
}

export function DeleteConfirmationPopup({ 
  isOpen, 
  onClose, 
  onConfirm, 
  fileName,
  fileType 
}: DeleteConfirmationPopupProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popupContainer}>
        <h3 className={styles.title}>Confirm Delete</h3>
        <p className={styles.message}>
          Are you sure you want to delete this {fileType} ({fileName})? 
          This action cannot be undone.
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
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}