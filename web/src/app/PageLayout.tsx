import NavBar from "../components/NavBar";
import { AuthProvider } from "./(auth)/AuthProvider";
import styles from "./form.module.css";
import pageStyles from "./page.module.css";

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className={styles.fullscreen}>
        <NavBar />
        <div className={pageStyles.center}>
          {children}
        </div>
      </div>
    </AuthProvider>
  );
}
