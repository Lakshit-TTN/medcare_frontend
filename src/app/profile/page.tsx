"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../styles/profile.module.css";

type Appointment = {
  id: number;
  doctor_name: string;
  appointment_date: string;
  time_slot: string;
  method: string;
  status: "confirmed" | "cancelled" | "pending";
  location: string;
};

type User = {
  id: number;
  name: string;
  email: string;
};

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          console.warn("Token expired. Redirecting to login...");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch user profile");
        const data = await res.json();

        const sortedAppointments = data.appointments.sort(
          (a: Appointment, b: Appointment) =>
            new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
        );


        console.log(sortedAppointments);

        setUser(data.user);
        setAppointments(sortedAppointments);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const totalPages = Math.ceil(appointments.length / itemsPerPage);
  const paginatedAppointments = appointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.parent}>
      <div className={styles.container}>
        <h2>User Profile</h2>
        {user && (
          <div className={styles.userInfo}>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        )}

        <h3>My Appointments History</h3>
        {appointments.length > 0 ? (
          <>
            <table className={styles.appointmentsTable}>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Method</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAppointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>{appt.doctor_name}</td>
                    <td>{new Date(appt.appointment_date).toLocaleString().split(",")[0]}</td>
                    <td>{appt.time_slot}</td>
                    <td>{appt.method}</td>
                    <td>{appt.location}</td>
                    <td className={appt.status === "confirmed" ? styles.approved : appt.status === "pending" ? styles.pending : styles.rejected}>
                      {appt.status === "confirmed" ? "Approved" : appt.status === "pending" ? "Pending" : "Cancelled"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.pagination}>
              <button onClick={handlePrevPage} disabled={currentPage === 1} className={styles.pageButton}>
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages} className={styles.pageButton}>
                Next
              </button>
            </div>
          </>
        ) : (
          <p>No appointments found.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
