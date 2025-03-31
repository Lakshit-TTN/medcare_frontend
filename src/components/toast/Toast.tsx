"use client"
import React, { useState, useEffect } from "react";
import styles from "../../styles/Toast.module.css";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
};

const Toast: React.FC<ToastProps> = ({ message, type = "info", onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 3000); 

    return () => clearTimeout(timer)//to clear timer if when unmounts
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span>{message}</span>
      <button className={styles.closeBtn} onClick={onClose}>✖</button>
    </div>
  );
};

export default Toast;
