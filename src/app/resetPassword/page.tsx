"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "../../styles/resetpassword.module.css";

const ResetPassword = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Reset Password Error:", error);
      setMessage("Error resetting password");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Reset Password</h2>
      <input
        type="password"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className={styles.input}
      />
      <button onClick={handleResetPassword} className={styles.button}>
        Reset Password
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ResetPassword;
