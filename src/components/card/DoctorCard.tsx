"use client"
import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "../../styles/DoctorCard.module.css";
import { useRouter } from "next/navigation";
import StarRating from "../rating/Rating";

interface DoctorCardProps {
  id: string;
  name: string;
  specialty: string;
  experience?: number;
  average_rating: number;
  qualifications:string[];
  image_url: string;
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  id,
  name,
  specialty,
  experience,
  average_rating,
  qualifications,
  image_url,
}) => {
  const formattedRating = Number(average_rating) || 0; 

  const router = useRouter();
  
  const handleBookAppointment = (event: React.MouseEvent) => {
    event.stopPropagation();
    router.push(`/booking/${id}`);
  };
  const handleCardClick = () => {
    router.push(`/doctors/${id}`);
  };

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  return hydrated ? (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.imageContainer}>
      <Image src={image_url.startsWith("https") ? image_url : `${image_url}`} alt={name} width={100} height={100} />
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{name},{qualifications[0]}</h3>
        <p className={styles.details}>
          <span className={styles.icon}><Image src="./Stethoscope.svg" alt="Stethoscope" height={20} width={20} className={styles.imageIcon} /></span> {specialty} &nbsp;
          <span className={styles.icon}><Image src="./Hourglass.svg" alt="hourglass" height={20} width={20} className={styles.imageIcon} /></span> {experience} Years
        </p>
      </div>

      <p className={styles.rating}>
        Ratings : <StarRating rating={formattedRating} />
      </p>
      
      <button className={styles.bookBtn} onClick={handleBookAppointment}>Book Appointment</button>

    </div>
  ) : <div>Loading...</div>;
};

export default DoctorCard;
