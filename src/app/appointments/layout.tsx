import Footer from "@/components/footer/Footer";
import { ReactNode } from "react";

export default function AppointmentsLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <main>{children}</main>
      <Footer/>
    </div>
  );
}
