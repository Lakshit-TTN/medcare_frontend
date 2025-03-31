"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "../../styles/appointment.module.css";
import Toast from "../toast/Toast";

interface AppointmentProps {
  id: string | null;
}

const Appointment: React.FC<AppointmentProps> = ({ id }) => {
  const router = useRouter();
  const dateContainerRef = useRef<HTMLDivElement>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dates, setDates] = useState<{ date: string; dayName: string; isAvailable: boolean }[]>([]);
  const [doctor, setDoctor] = useState<{ id: string; name: string; hospital: string[] } | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);
  const [selectedBookingType, setSelectedBookingType] = useState<string>("online");
  const [userId, setUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<string>("");
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(new Date().getMonth());
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<{ morning: string[], afternoon: string[] }>({ morning: [], afternoon: [] });

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  // to update the displayed month name
  useEffect(() => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    setCurrentMonth(monthNames[currentMonthIndex]);
  }, [currentMonthIndex]);

  useEffect(() => setHydrated(true), []); // So that no hydratioin error comes

  // Handlers for changing months
  const prevMonth = () => {
    setCurrentMonthIndex((prev) => {
      if (prev === 0) return prev;
      return prev - 1;
    });
  };

  const nextMonth = () => {
    setCurrentMonthIndex((prev) => {
      if (prev === 11) return prev;
      return prev + 1;
    });
  };

  // Handlers for scrolling the dates
  const scrollLeft = () => {
    if (dateContainerRef.current) {
      dateContainerRef.current.scrollBy({ left: -100, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (dateContainerRef.current) {
      dateContainerRef.current.scrollBy({ left: 100, behavior: "smooth" });
    }
  };

  // to fetch user ID from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      console.log(user);
      setUserId(user.id);
    }
  }, []);

  useEffect(() => {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    if (today.getDate() === lastDayOfMonth) {
      setCurrentMonthIndex((prev) => (prev === 11 ? 0 : prev + 1)); // Move to next month
    }
  }, []);


  // thisn fetches booked slots for the selected doctor and date
  useEffect(() => {
    console.log("Fetching:", id);
    if (!id || !selectedDate) return;
    async function fetchBookedSlots() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/booked-slots?doctor_id=${id}&appointment_date=${selectedDate}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch booked slots");
        const data = await response.json();
        console.log("Booked Slots:", data.bookedSlots);

        setBookedSlots(data.bookedSlots);
      } catch (error) {
        console.error("Error fetching booked slots:", error);
      }
    }
    fetchBookedSlots();
  }, [id, selectedDate]);


  // sets doctors details 
  useEffect(() => {
    if (!id) return;
    async function fetchDoctor() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showToast(" User might not be logged in", "error");
          console.error("No token found! User might not be logged in.");
          return;
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctors/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 401) {
          showToast("Session expired! Please log in again.", "error");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        if (!response.ok) {
          throw new Error(`Failed to fetch doctor: ${response.statusText}`);
        }
        const data = await response.json();
        setDoctor(data);

        // we set the first hospital here
        if (Array.isArray(data.hospital) && data.hospital.length > 0) {
          setSelectedHospital(data.hospital[0]);
        }
      } catch (error) {
        console.error("Error fetching doctor:", error);
      }
    }
    fetchDoctor();
  }, [id]);

  //fetches avaialbel slots
  useEffect(() => {
    async function fetchAvailableSlots() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showToast("User might not be logged in", "error");
          return;
        }

        let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/available-slots?doctor_id=${id}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch available slots");
        const data = await response.json();
        if (data.morning && data.afternoon) {
          setAvailableSlots({
            morning: data.morning,
            afternoon: data.afternoon
          });
        } else {
          console.error("Invalid data format received:", data);
        }

      } catch (error) {
        console.error("Error fetching slots:", error);
      }
    }

    fetchAvailableSlots();
  }, [id]);

function generateDates(year: number, month: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // ensures that all dates are compared as whole days,
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysArray: { date: string; dayName: string; disabled: boolean }[] = [];
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const isPast = d < today; 
    daysArray.push({
      date: d.toLocaleDateString("en-CA"),
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      disabled: isPast, 
    });
  }
  return daysArray;
}

  // Fetch available dates 
  useEffect(() => {
    async function fetchDates() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/available-dates`);
        const data = await response.json();
        const availableDates = new Set(data.dates);
        const fullMonthDates = generateDates(new Date().getFullYear(), currentMonthIndex);
        setDates(fullMonthDates.map(({ date, dayName }) => ({
          date,
          dayName,
          isAvailable: availableDates.has(date),
        })));

        console.log("Available Dates from API:", data.dates);
        console.log("Checking isAvailable for:", fullMonthDates);
      } catch (error) {
        console.error("Error fetching dates:", error);
      }

    }
    fetchDates();
  }, [currentMonthIndex]);

  // checks if the next button should be disabled if all are not selected
  const isNextDisabled = () => {
    return !(userId || selectedSlot || selectedDate || id);
  };

  // checks if we filled all the details required
  const handleNext = async () => {
    if (!userId || !selectedSlot || !selectedDate || !id) {
      showToast("Please select all required fields.", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found! User might not be logged in.");
        showToast("User might not be logged in", "error");
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          doctor_id: id,
          appointment_date: selectedDate,
          time_slot: selectedSlot,
          booking_type: selectedBookingType,
          location: selectedHospital,
        }),
      });
      if (response.status === 401) {
        showToast("Session expired! Please log in again.", "error");
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      if (!response.ok) throw new Error("Failed to book appointment");
      localStorage.setItem("appointment", JSON.stringify({
        doctorName: doctor?.name,
        date: selectedDate,
        time: selectedSlot,
        location: selectedHospital,
        type: selectedBookingType,
      }));
      showToast("Appointment Booked", "success");
      setTimeout(() => {
        router.push("/confirmation");
      }, 3000);
    } catch (error) {
      console.error("Error booking appointment:", error);
      showToast("Something went wrong! Try again later", "error");
    }
  };

  return hydrated ? (
    <div className={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className={styles.leftSection}>
        <h1>Book Your Next <br /> Doctor Visit in <br /> Seconds.</h1>
        <p>CareMate helps you find the best healthcare provider by specialty, location, and more.</p>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Schedule Appointment</h2>
            <button className={styles.bookBtn}>Book Appointment</button>
          </div>

          <div className={styles.toggleButtons}>
            <button className={selectedBookingType === "online" ? styles.active : ""} onClick={() => setSelectedBookingType("online")}>Book Video Consult</button>
            <button className={selectedBookingType === "offline" ? styles.active : ""} onClick={() => setSelectedBookingType("offline")}>Book Hospital Visit</button>
          </div>

          <select className={styles.dropdown} value={selectedHospital || ""} onChange={(e) => setSelectedHospital(e.target.value)}>
            {doctor?.hospital?.length ? (
              doctor.hospital.map((hospital) => (
                <option key={hospital} value={hospital}>{hospital}</option>
              ))
            ) : (
              <option>Loading hospitals...</option>
            )}
          </select>

          <div className={styles.dateContainer}>
            <div className={styles.monthSelector}>
              <button onClick={prevMonth}>◀</button>
              <span>{currentMonth} {new Date().getFullYear()}</span>
              <button onClick={nextMonth}>▶</button>
            </div>

            <div className={styles.datePickerContainer}>
              <button className={styles.arrow} onClick={scrollLeft}>◀</button>
              <div className={styles.datePicker} ref={dateContainerRef}>

                {dates.map(({ date, dayName, isAvailable }) => {
                  const dateObj = new Date(date);
                  const day = dateObj.getDate();
                  const month = dateObj.toLocaleDateString("en-US", { month: "short" });
                  return (
                    <button
                      key={date}
                      className={`${selectedDate === date ? styles.selected : ""} ${!isAvailable ? styles.disabledDate : ""}`}
                      onClick={() => isAvailable && setSelectedDate(date)}
                      disabled={!isAvailable} >
                      {dayName} {day} {month}
                    </button>
                  );
                })}
              </div>
              <button className={styles.arrow} onClick={scrollRight}>▶</button>
            </div>
          </div>

          <div className={styles.slotCard}>
            <div className={styles.slotHeader}>
              <h3>
                <Image src="/sun.png" alt="sun" width={12} height={12} /> Morning
              </h3>
              <div className={styles.firstRowSlots}>
                {availableSlots.morning.filter((slot) => !bookedSlots.includes(slot)).length} slots
              </div>
            </div>
            <hr className={styles.divider} />
            <div className={styles.slotGrid}>
              {availableSlots.morning.map((slot) => (
                <button
                  key={slot}
                  className={`${selectedSlot === slot ? styles.active : ""} ${bookedSlots.includes(slot) ? styles.disabledSlot : ""}`}
                  onClick={() => !bookedSlots.includes(slot) && setSelectedSlot(slot)}
                  disabled={bookedSlots.includes(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.slotCard}>
            <div className={styles.slotHeader}>
              <h3>
                <Image src="/sunset.png" alt="sunset" width={12} height={12} /> Afternoon
              </h3>
              <div className={styles.firstRowSlots}>
                {availableSlots.afternoon.filter((slot) => !bookedSlots.includes(slot)).length} slots
              </div>
            </div>
            <hr className={styles.divider} />
            <div className={styles.slotGrid}>
              {availableSlots.afternoon.map((slot) => (
                <button
                  key={slot}
                  className={`${selectedSlot === slot ? styles.active : ""} ${bookedSlots.includes(slot) ? styles.disabledSlot : ""}`}
                  onClick={() => !bookedSlots.includes(slot) && setSelectedSlot(slot)}
                  disabled={bookedSlots.includes(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
          <button className={styles.nextBtn} onClick={handleNext} disabled={isNextDisabled()}>Next</button>
        </div>
      </div>
    </div>
  ) : <div>Loading...</div>;
};

export default Appointment;