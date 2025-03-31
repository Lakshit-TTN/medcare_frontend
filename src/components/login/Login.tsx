"use client"
import React, { useEffect, useState } from "react";
import styles from "../../styles/login.module.css";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Toast from "../toast/Toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const tokenFromGoogle = searchParams.get("token");

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!tokenFromGoogle) return; //asonly for google we get in out params 
    localStorage.setItem("token", tokenFromGoogle);
    localStorage.setItem("isGoogleLogin", "true"); //Save login source only for google
    showToast("Logged in successfully!", "success");
    setTimeout(() => {
      router.push("/appointments");
    }, 2000);
  }, [tokenFromGoogle]);

  useEffect(() => {
    const checkStoredToken = () => {
      if (localStorage.getItem("isGoogleLogin") === "true") return;
      const storedToken = localStorage.getItem("token");
      if (storedToken && storedToken !== "null") {
        showToast("Already Logged In", "info");
        setTimeout(() => {
          router.push("/appointments");
        }, 3000);
      }
    };

    checkStoredToken();
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      console.log("Login Response:", data);
      if (!res.ok) {
        showToast(data.message || "Login failed", "error");
        return;
      }
      // restrict admin login in user portal
      if (data.user.role === "admin") {
        showToast("Admins cannot log in here!", "error");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        showToast("Logging In", "success");
        setTimeout(() => {
          router.push("/appointments");
        }, 3000);
      }
    } catch (err) {
      console.error("Login Error:", err);
      showToast("Something went wrong. Please try again!", "error");
    }
  };

  return hydrated ? (
    <div className={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className={styles.card}>
        <h2>Login</h2>
        <p>
          Are you a new member?{" "}
          <a href="/signup" className={styles.link}>Sign up here.</a>
        </p>

        <form className={styles.form} onSubmit={handleLogin}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className={styles.label}>Password</label>
          <div className={styles.inputWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={styles.inputP}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
            >
              <Image
                src={"/Eye.svg"}
                alt="Toggle Password"
                width={15}
                height={15}
              />
            </button>
          </div>

          <button type="submit" className={styles.loginButton}>
            Login
          </button>
          <button
            type="button"
            className={styles.googleButton}
            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google`}
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            Login with Google
          </button>

          <button type="button" className={styles.resetButton} onClick={() => { setEmail(""); setPassword(""); }}>
            Reset
          </button>
        </form>

        <a href="/forgotPassword" className={styles.forgotPassword}>
          Forgot Password?
        </a>
      </div>
    </div>
  ) : <div>Loading...</div>;
};

export default Login;
