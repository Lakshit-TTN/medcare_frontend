"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Appointment from "@/components/appointment/AppointmentDetails";
import Footer from "@/components/footer/Footer";
import Toast from "@/components/toast/Toast";

export default function Booking() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id ? String(params.id) : null;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info", callback?: () => void) => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
      if (callback) callback();
    }, 3000); 
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Login first", "error", () => router.push("/login")); 
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  if (isAuthenticated === null) {
    return (
      <>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <div>Loading...</div>
      </>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Appointment id={doctorId} />
      <Footer />
    </>
  );
}
