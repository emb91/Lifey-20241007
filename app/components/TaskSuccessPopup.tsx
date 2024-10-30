import React from 'react';
import styles from '../shared/popup.module.css'; 
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type TaskSuccessPopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

const TaskSuccessPopup: React.FC<TaskSuccessPopupProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  const handleNewTask = () => {
    // Using both to ensure the refresh happens
    window.location.href = window.location.href; // Force a full page refresh
    // OR
    window.location.reload(true); // Force reload from server, not cache
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <h2>Notification</h2>
        <p>Task created successfully!</p>
        <Link href="/get-tasks">
          <button type="button">See your tasks</button>
          <p>or</p>
        </Link>
        <button 
          onClick={handleNewTask} 
          type="button"
        >
          Create a new task
        </button>
      </div>
    </div>
  );
};

export default TaskSuccessPopup;