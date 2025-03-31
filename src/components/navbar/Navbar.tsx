"use client";

import Link from "next/link";
import Image from "next/image";
import { FC, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "../../styles/navbar.module.css";
import Toast from "../toast/Toast";

const Navbar: FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Function to check login state
  const checkLoginState = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // Convert token to boolean
  };

  // Run on mount and every time pathname changes (user navigates)
  // so that we cant go entering path manually
  useEffect(() => {
    checkLoginState();
  }, [pathname]); // Runs when the page changes

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token

    // Check if the user logged in via Google
    const isGoogleLogin = localStorage.getItem("isGoogleLogin");

    // Remove Google login flag
    localStorage.removeItem("isGoogleLogin");
    setIsLoggedIn(false); 

    // Redirect to login first
    router.push("/login");

    // If the user logged in via Google, log them out from Google 
    if (isGoogleLogin === "true") {
      setTimeout(() => {
        window.open("https://accounts.google.com/Logout", "_blank");
      }, 1000);
    }
  };

  const handleProfile = () => {
    router.push("/profile");
  }

  // Function to handle protected route clicks
  const handleProtectedRoute = (e: React.MouseEvent, path: string) => {
    if (!isLoggedIn && path === "/appointments") {
      e.preventDefault(); // Prevent navigation for appointments
      showToast("You need to log in first!", "error");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  };


  return hydrated ? (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <nav className={styles.navbar}>
        <div className={styles["navbar-left"]}>
          <div className={styles.logo}>
            <Image src="/Frame.svg" alt="logo" width={30} height={30} className={styles.img} />
            MedCare
          </div>

          <div className={`${styles["nav-links"]} ${menuOpen ? styles.open : ""}`}>
            <Link href="/" className={pathname === "/" ? styles.active : ""}>Home</Link>

            <Link
              href="/appointments"
              className={pathname === "/appointments" ? styles.active : ""}
              onClick={(e) => handleProtectedRoute(e, "/appointments")}
            >
              Appointments
            </Link>

            <Link href="/contacts" className={pathname === "/contacts" ? styles.active : ""}>Contacts</Link>

            <div className={styles["mobile-auth-buttons"]}>
              {isLoggedIn ? (
                <>
                  <button className={`${styles.btn} ${styles.logout}`} onClick={handleLogout}>
                    Logout
                  </button>
                  <button className={styles.Ubtn} onClick={handleProfile}>
                <Image src={'/user.png'} height={10} width={10} alt="user-icon" />
              </button>
                </>
              ) : (
                <>
                  <Link href='/login'>
                    <button className={`${styles.btn} ${styles.login}`}>Login</button>
                  </Link>
                  <Link href='/signup'>
                    <button className={`${styles.btn} ${styles.register}`}>Register</button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles["auth-buttons"]}>
          {isLoggedIn ? (
            <>
              <button className={styles.Ubtn} onClick={handleProfile}>
                <Image src={'/user.png'} height={10} width={10} alt="user-icon" />
              </button>
              <button className={`${styles.btn} ${styles.logout}`} onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href='/login'>
                <button className={`${styles.btn} ${styles.login}`}>Login</button>
              </Link>
              <Link href='/signup'>
                <button className={`${styles.btn} ${styles.register}`}>Register</button>
              </Link>
            </>
          )}
        </div>

        <div className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "X" : "☰"}
        </div>
      </nav>
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default Navbar;
