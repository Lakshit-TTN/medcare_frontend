"use client"
import Image from "next/image";
import styles from "../styles/home.module.css";
import img from "../../public/hero2.jpg"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const router =  useRouter();
  const handleGetStarted = () =>{
    router.push('/login')
  }

  return hydrated ? (
    <main className={styles.homeContainer}>
      <section className={styles.homeleft}>
        <h1>Health in Your <br /> Hands.</h1>
        <p>
          Take control of your healthcare with CareMate. Book <br />appointments with ease,
          explore health blogs, and stay <br /> on top of your well-being, all in one place.
        </p>
        <button className={styles.btn} onClick={handleGetStarted} >Get Started</button>
      </section>
      <section className={styles.homeright}>
        <Image
          src={img}
          alt="Doctor with patient"
          width={800}
          objectFit="cover"
          height={600}
          className={styles["hero-image"]}
        />
      </section>
    </main>
  ) : <div>Loading...</div>;
};

export default HomePage;
