import React from 'react';
import styles from '../shared/popup.module.css'; 
import Link from 'next/link';

type PopupProps = {
  isOpen: boolean;
  onClose: () => void;
  message: string;
};

const Popup: React.FC<PopupProps> = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null; //

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <h2>Notification</h2>
        <p>{message}</p>
        <Link href="/get-tasks">
         <button type="button">See your tasks</button>
         <p>or</p>
        </Link>
        <button onClick={onClose}>Create a new task</button>
      </div>
    </div>
  );
};

export default Popup;