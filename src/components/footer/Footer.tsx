import styles from "../../styles/footer.module.css";
import { IoMdCall, IoLogoWhatsapp } from "react-icons/io";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p>© EmScripts 2024. All Rights Reserved.</p>
        <div className={styles.icons}>
          <IoMdCall />
          <IoLogoWhatsapp />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
