"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../styles/confirmation.module.css";
import Toast from "../toast/Toast";
import Image from "next/image";

const Confirmation = () => {
  const router = useRouter();
  const [appointment, setAppointment] = useState<{
    doctorName: string;
    date: string;
    time: string;
    location: string;
    type: string;
  } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  useEffect(() => {
    const storedAppointment = localStorage.getItem("appointment");
    if (storedAppointment) {
      setAppointment(JSON.parse(storedAppointment));
      localStorage.removeItem("appointment");
    } else {
      setTimeout(() => {
        showToast("Book Appointment first", "error");
      }, 100);
      setTimeout(() => {
        router.push("/appointments");
      }, 3000);
    }
  }, [router]);

  return (
    <div className={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {appointment ? (
        <div className={styles.card}>
          <Image src="/tick.png" alt="Success" height={50} width={50} />
          <h1 className={styles.h1}>Appointment Confirmed!</h1>
          <p>
            Your appointment has been successfully sent for approval.
            <br />
            You will get notified on your registered email address
          </p>

          <div className={styles.details}>
            <p><strong>Doctor:</strong> {appointment.doctorName}</p>
            <p><strong>Date:</strong> {appointment.date}</p>
            <p><strong>Time:</strong> {appointment.time}</p>
            <p><strong>Location:</strong> {appointment.location}</p>
            <p><strong>Type:</strong> {appointment.type === "online" ? "Video Consultation" : "Hospital Visit"}</p>
          </div>

          <button className={styles.homeBtn} onClick={() => router.push("/")}>
            Go to Homepage
          </button>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default Confirmation;
