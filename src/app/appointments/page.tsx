"use client";
import React, { useState, useEffect, useCallback } from "react";
import DoctorCard from "../../components/card/DoctorCard";
import styles from "../../styles/AppointmentMain.module.css";
import Toast from "../../components/toast/Toast";
import { useSearchParams, useRouter } from "next/navigation";

type Doctor = {
    id: string;
    name: string;
    specialty: string;
    experience?: number;
    average_rating: number;
    gender: string;
    image_url: string;
    qualifications: string[];
    hospital: string[];
    about: string;
    availability: string[];
    diseases: string[];
    reviews: { name: string; review: string; }[];
};

const DoctorsPage: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
    const initialSearch = searchParams.get("searchTerm") || "";
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const initialPage = parseInt(searchParams.get("page") || "1", 10);
    const initialRating = searchParams.get("rating") ? parseInt(searchParams.get("rating")!, 10) : null;
    const initialGender = searchParams.get("gender") || null;
    const [ratingFilter, setRatingFilter] = useState<number | null>(initialRating);
    const [genderFilter, setGenderFilter] = useState<string | null>(initialGender);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalDoctors, setTotalDoctors] = useState<number>(0);

    const parseExperienceFilter = (exp: string | null) => {
        if (!exp) return null;
        const [min, max] = exp.split("-").map((num) => (num === "null" ? null : parseInt(num, 10)));
        return { min: min || 0, max: max || null };
    };
    const initialExperience = parseExperienceFilter(searchParams.get("experience"));
    const [experienceFilter, setExperienceFilter] = useState<{ min: number; max: number | null } | null>(
        initialExperience
    );
    const showToast = (message: string, type: "success" | "error" | "info") => {
        setToast({ message, type });
    };
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.has("searchTerm")) {
            params.delete("searchTerm");
            router.replace(`?${params.toString()}`, { scroll: false });
        }
        setSearchQuery(""); 
        setSearchTerm(""); 
    }, []);

    const fetchDoctors = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                showToast("You need to log in first!", "error");
                setTimeout(() => router.push("/login"), 3000);
                return;
            }
            const params = new URLSearchParams();
            if (ratingFilter !== null) params.append("rating", ratingFilter.toString());
            if (experienceFilter !== null) {
                if (experienceFilter.max !== null) {
                    params.append("experience", `${experienceFilter.min}-${experienceFilter.max}`);
                } else {
                    params.append("experience", `${experienceFilter.min}+`); 
                }
            }
            if (genderFilter !== null) params.append("gender", genderFilter);
            if (searchQuery.trim()) {
                params.append("searchTerm", searchQuery.trim());
            } else {
                params.delete("searchTerm");
            }
            params.append("page", currentPage.toString());
            params.append("limit", "6");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/doctors/?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 401) {
                showToast("Session expired! Please log in again.", "error");
                localStorage.removeItem("token");
                router.push("/login");
                return;
            }
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const data = await response.json();
            setDoctors(data.doctors);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
            setTotalDoctors(data.totalDoctors);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            setDoctors([]);
            setTotalDoctors(0);
        }
    }, [ratingFilter, experienceFilter, genderFilter, searchQuery, currentPage, router]);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    const updateFilters = (newFilters: {
        rating?: number | null;
        experience?: { min: number; max: number | null } | null;
        gender?: string | null;
        reset?: boolean;
    }) => {
        setCurrentPage(1);
        const params = new URLSearchParams(window.location.search);
        if (newFilters.rating !== undefined) {
            setRatingFilter(newFilters.rating);
            params.set("rating", newFilters.rating?.toString() || "");
        }
        if (newFilters.experience !== undefined) {
            setExperienceFilter(newFilters.experience);
            if (newFilters.experience) {
                const { min, max } = newFilters.experience;
                if (max !== null) {
                    params.set("experience", `${min}-${max}`);
                } else {
                    params.set("experience", `${min}+`); 
                }
            } else {
                params.delete("experience");
            }
        }
        if (newFilters.gender !== undefined) {
            setGenderFilter(newFilters.gender);
            params.set("gender", newFilters.gender || "");
        }
        if (newFilters.reset) {
            setSearchTerm(""); 
            setSearchQuery("");
            params.delete("searchTerm");
            params.delete("rating"); 
            params.delete("gender"); 
        }
        params.set("page", "1"); 
        router.push(`?${params.toString()}`);
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) return; 
        setSearchQuery(searchTerm); 
        setCurrentPage(1);
        const params = new URLSearchParams();
        if (ratingFilter !== null) params.append("rating", ratingFilter.toString());
        if (experienceFilter !== null) {
            const { min, max } = experienceFilter;
            if (max !== null) {
                params.append("experience", `${min}-${max}`);
            } else {
                params.append("experience", `${min}+`);
            }
        }
        if (genderFilter !== null) params.append("gender", genderFilter);
        params.append("page", "1");
        if (!searchTerm.trim()) {
            params.delete("searchTerm"); 
        } else {
            params.append("searchTerm", searchTerm.trim());
        }
        router.push(`?${params.toString()}`);
        setSearchQuery(searchTerm.trim());
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value); 
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(window.location.search);
        if (ratingFilter !== null) params.set("rating", ratingFilter.toString());
        if (experienceFilter !== null) {
            const { min, max } = experienceFilter;
            if (max !== null) {
                params.set("experience", `${min}-${max}`);
            } else {
                params.set("experience", `${min}+`);
            }
        }
        if (genderFilter !== null) params.set("gender", genderFilter);
        if (searchQuery) params.set("searchTerm", searchQuery);
        params.set("page", newPage.toString());
        router.push(`?${params.toString()}`);
        setCurrentPage(newPage);
    };

    return (
        <div className={styles.Appointmentcontainer}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className={styles.searchParent}>
                <h1 className={styles.h1}>Find a doctor at your own ease</h1>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Search Doctors by Name or Specialty or Disease"
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <button className={styles.searchBtn} onClick={handleSearch}>Search</button>
                </div>
            </div>

            <div className={styles.headerContainer}>
                <h1 className={styles.headerh1}>{totalDoctors} Doctors Available</h1>
                <p className={styles.headerP}>Book appointments with minimum wait-time & verified doctor details</p>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.sidebar}>
                    <div className={styles.filterHeader}>
                        <h3 className={styles.h3}>Filter By:</h3>
                        <button
                            className={styles.resetBtn}
                            onClick={() => updateFilters({ rating: null, experience: null, gender: null, reset: true })}
                        >
                            Reset
                        </button>
                    </div>

                    <div className={styles.filterCard}>
                        <h4>Rating</h4>
                        <label>
                            <input
                                className={styles.radioInp}
                                type="radio"
                                name="rating"
                                checked={ratingFilter === null}
                                onChange={() => updateFilters({ rating: null })}
                            />
                            Show All
                        </label>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <label key={star}>
                                <input
                                    className={styles.radioInp}
                                    type="radio"
                                    name="rating"
                                    checked={ratingFilter === star}
                                    onChange={() => updateFilters({ rating: ratingFilter === star ? null : star })}
                                />
                                {star} Star
                            </label>
                        ))}
                    </div>

                    <div className={styles.filterCard}>
                        <h4>Experience</h4>
                        {[
                            { label: "15+", min: 15, max: null },
                            { label: "10-15", min: 10, max: 15 },
                            { label: "5-10", min: 5, max: 10 },
                            { label: "3-5", min: 3, max: 5 },
                            { label: "1-3", min: 1, max: 3 },
                            { label: "0-1", min: 0, max: 1 },
                        ].map((range) => (
                            <label key={range.label}>
                                <input
                                    className={styles.radioInp}
                                    type="radio"
                                    name="experience"
                                    checked={
                                        experienceFilter?.min === range.min &&
                                        experienceFilter?.max === range.max
                                    }
                                    onChange={() =>
                                        updateFilters({
                                            experience:
                                                experienceFilter?.min === range.min &&
                                                    experienceFilter?.max === range.max
                                                    ? null
                                                    : { min: range.min, max: range.max },
                                        })}/>
                                {range.label} years
                            </label>
                        ))}
                    </div>

                    <div className={styles.filterCard}>
                        <h4>Gender</h4>
                        <label>
                            <input
                                className={styles.radioInp}
                                type="radio"
                                name="gender"
                                checked={genderFilter === null}
                                onChange={() => updateFilters({ gender: null })}
                            />
                            Show All
                        </label>
                        {["Male", "Female"].map((gender) => (
                            <label key={gender}>
                                <input
                                    className={styles.radioInp}
                                    type="radio"
                                    name="gender"
                                    checked={genderFilter === gender}
                                    onChange={() => updateFilters({ gender: genderFilter === gender ? null : gender })}
                                />
                                {gender}
                            </label>
                        ))}
                    </div>
                </div>

                <div className={styles.doctorList}>
                    {doctors.length > 0 ? (
                        doctors.map((doc) => <DoctorCard key={doc.id} {...doc} average_rating={doc.average_rating} qualifications={doc.qualifications} />)
                    ) : (
                        <p className={styles.noDoctors}>No doctors match the selected filters.</p>
                    )}
                </div>
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button className={styles.pageBtn} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        ❮ Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            className={`${styles.pageNumber} ${currentPage === i + 1 ? styles.active : ""}`}
                            onClick={() => handlePageChange(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button className={styles.pageBtn} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        Next ❯
                    </button>
                </div>
            )}
        </div>
    );
};

export default DoctorsPage;
