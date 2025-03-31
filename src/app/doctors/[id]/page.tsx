"use client";
import { useEffect, useState } from "react";
import {  useParams } from "next/navigation";
import DoctorDetails from "@/components/doctorDetail/DoctorDetail";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  average_rating: number;
  gender: string;
  image: string;
  image_url: string;
  qualifications: string[];
  hospital: string[];
  bio: string;
  availability: string[];
  reviews: { name: string; comment: string; rating: number }[];
};

export default function DoctorPage() {
  const params = useParams();
  const doctorId = params.id as string;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return; 
    console.log(`Fetching doctor with ID: ${doctorId}`);
    async function fetchDoctor() {
      try {
        const token = localStorage.getItem("token"); 
        if (!token) {
          console.error("No authentication token found");
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctors/${doctorId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
    
        if (response.status === 401) {
          console.error("Unauthorized! Redirecting to login...");
          window.location.href = "/login"; 
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        setDoctor(data);
      } catch (error) {
        console.error("Failed to fetch doctor:", error);
      } finally {
        setLoading(false);
      }
    }
    
    
    fetchDoctor();
  }, [doctorId]);

  if (loading) return <p>Loading doctor details...</p>;
  if (!doctor) return <p>Doctor not found!</p>;

  return <DoctorDetails doctor={doctor} />;
}
