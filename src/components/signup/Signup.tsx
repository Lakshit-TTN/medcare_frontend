"use client";
import React, { useEffect, useState } from "react";
import styles from "../../styles/signup.module.css";
import Image from "next/image";
import Toast from "../toast/Toast";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  useEffect(() => {
    setHydrated(true);
    const token = localStorage.getItem("token");
    if (token && token !== "null") {
      // ensure token is valid
      showToast("Already Logged In", "info");
      setTimeout(() => {
        window.location.href = "/appointments";
      }, 3000);
    }
  }, []);

  const validateForm = () => {
    const errorMessages: string[] = [];
    //regex to check on frontend
    if (!name.trim()) {
      errorMessages.push("Name is required");
    } else if (!/^[A-Za-z\s]+$/.test(name.trim())) {
      errorMessages.push("Name can only contain letters and spaces");
    }
    if (!email.trim()) {
      errorMessages.push("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errorMessages.push("Invalid email format");
    }

    if (!password.trim()) {
      errorMessages.push("Password is required");
    } else if (password.length < 6) {
      errorMessages.push("Password must be at least 6 characters");
    }

    if (errorMessages.length > 0) {
      showToast(errorMessages + "", "error");
      return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        showToast(data.message + "" || "Signup failed", "error");
        return;
      }

      showToast("Signup successful!", "success");
      console.log("User registered:", data);
      localStorage.setItem("token", data.token);
      setEmail("");
      setPassword("");
      setName("");
      window.location.href = "/appointments";
    } catch (error) {
      console.error("Signup error:", error);
      showToast("Something went wrong. Please try again later", "error");
    }
  };


  return hydrated ? (
    <div className={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className={styles.card}>
        <h2>Signup</h2>
        <p>
          Already a member?{" "}
          <a href="/login" className={styles.link}>Login</a>
        </p>

        <form className={styles.form} onSubmit={handleSignup}>
          <label className={styles.label}>Name</label>
          <input
            type="text"
            placeholder="Enter your Name"
            className={`${styles.input} ${styles.inputN}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p className={styles.error}>{errors.name}</p>}

          <label className={styles.label}>Email</label>
          <input
            type="email"
            placeholder="Enter your Email"
            className={`${styles.input} ${styles.inputE}`}
            value={email || ""}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className={styles.error}>{errors.email}</p>}

          <label className={styles.label}>Password</label>
          <div className={styles.inputWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={`${styles.input} ${styles.inputP}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
            >
              <Image src="/Eye.svg" alt="Toggle Password" width={15} height={15} />
            </button>
          </div>
          {errors.password && <p className={styles.error}>{errors.password}</p>}

          <button type="submit" className={styles.loginButton} disabled={!name || !email || !password}>
            Submit
          </button>

          <button
            type="button"
            className={styles.resetButton}
            onClick={() => {
              setEmail("");
              setPassword("");
              setName("");
              setErrors({});
            }}
          >
            Reset
          </button>

        </form>
      </div>
    </div>
  ) : <div>Loading...</div>;
};

export default Signup;
