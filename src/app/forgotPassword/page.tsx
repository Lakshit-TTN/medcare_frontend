"use client";
import { useState } from "react";
import styles from "../../styles/forgotpassword.module.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleForgotPassword = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            setMessage(data.message);
        } catch (error) {
            console.error("Forgot Password Error:", error);
            setMessage("Error sending reset link");
        }
    };

    return (
        <div className={styles.parent}>

            <div className={styles.container}>
                <h2 className={styles.title}>Forgot Password?</h2>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                />
                <button onClick={handleForgotPassword} className={styles.button}>
                    Send Reset Link
                </button>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
};

export default ForgotPassword;
