import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "../../styles/DoctorDetail.module.css";
import Link from "next/link";
import StarRating from "../rating/Rating";
import Toast from "../toast/Toast";


interface Review {
  name: string;
  comment: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  average_rating: number;
  image_url: string;
  qualifications: string[];
  hospital: string[];
  bio: string;
  availability: string[];
  reviews:{ name: string; comment: string; rating: number }[];
}

const DoctorDetails: React.FC<{ doctor: Doctor }> = ({ doctor }) => {
  const formattedRating = Number(doctor.average_rating) || 0;
  const [reviews, setReviews] = useState<{ name: string; comment: string; rating: number }[]>(doctor.reviews || []);
  const [hydrated, setHydrated] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [reviewUpdated, setReviewUpdated] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  useEffect(() => setHydrated(true), []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctors/reviews/${doctor.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const data = await response.json();
      console.log("Fetched Reviews:", data.reviews);
      setReviews(data.reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    console.log("Fetching reviews for doctor:", doctor.id);
    fetchReviews();
  }, [doctor, reviewUpdated]);

  const handleRating = (rating: number) => {
    setSelectedRating(rating);
  };

  const submitReview = async () => {
    if (!selectedRating && !reviewText.trim()) {
      showToast("Please provide a rating or a review before submitting.", "error");
      return;
    }
    setSubmitting(true);
    
    const userName = localStorage.getItem("userName") || "Anonymous";
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctors/rate/${doctor.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          rating: selectedRating || null,
          review_text: reviewText.trim() || null,
        }),
      });

      if (response.ok) {
        showToast("Review submitted successfully!", "success");
        setShowPopup(false);
        setSelectedRating(null);
        setReviewText("");
        setReviewUpdated(prev => !prev);
      } else {
        const errorData = await response.json();
        showToast("Error: " + errorData.message, "error");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      showToast("Failed to submit review. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!doctor) {
    return <p>No doctor data available.</p>;
  }

  return hydrated ? (
    <div className={styles.DoctorDetailcontainer}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className={styles.DoctorDetailcard}>
        <div className={styles.DoctorDetailleft}>
          <Image
            src={doctor.image_url}
            alt={doctor.name}
            width={120}
            height={120}
            className={styles.DoctorDetailimage}
          />
          <div className={styles.DoctorDetailinfo}>
            <h2 className={styles.DoctorDetailh2}>{doctor.name}</h2>
            <p className={styles.DoctorDetailspecialty}>{doctor.specialty}</p>
            <p className={styles.DoctorDetailExp}>Experience: {doctor.experience} years</p>
            <p className={styles.DoctorDetailrating}>
              Ratings : <StarRating rating={formattedRating} />
            </p>
          </div>
        </div>
        <Link href={`/booking/${doctor.id}`} target="_blank">
          <button className={styles.DoctorDetailbookBtn}>Book Appointment</button>
        </Link>
      </div>

      <div className={styles.DoctorDetailsections}>
        <div className={styles.DoctorDetaildetails}>
          <h3>About</h3>
          <p>{doctor.bio}</p>
          <h3>Qualifications</h3>
          <ul>
            {doctor.qualifications.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
          <h3>Availability</h3>
          <ul>
            {doctor.availability.map((slot, i) => (
              <li key={i}>{slot}</li>
            ))}
          </ul>
          <h3>Hospital</h3>
          <ul>
            {doctor.hospital.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>

        <div className={styles.DoctorDetailreviews}>
          <h3>Reviews</h3>
          {reviews.length > 0 ? (
            reviews.slice(-4).reverse().map((r, i) => (
              <div key={i} className={styles.DoctorDetailreviewCard}>
                <p><strong>{r.name}:</strong> {r.comment}</p>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}

          <button className={styles.addReviewBtn} onClick={() => setShowPopup(true)}>
            Add Review or Rating
          </button>
        </div>

        {showPopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popupContent}>
              <h3>Rate and Review</h3>
              <div className={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={styles.star}
                    onClick={() => handleRating(star)}
                    style={{ color: star <= (selectedRating || 0) ? "gold" : "gray", cursor: "pointer", fontSize: "24px" }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <textarea
                className={styles.reviewInput}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review..."
              ></textarea>
              <div className={styles.popupButtons}>
                <button className={styles.submitBtn} onClick={submitReview} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
                <button className={styles.cancelBtn} onClick={() => setShowPopup(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : <div>Loading...</div>;
};

export default DoctorDetails;
