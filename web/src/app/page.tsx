"use client";

import RadioApp from "../components/RadioApp";
import { AuthProvider } from "./(auth)/AuthProvider";
import NavBar from "../components/NavBar";
import styles from "./form.module.css";
import pageStyles from "./page.module.css";

export default function Page() {
  return (
    <AuthProvider>
      <div className={styles.fullscreen}>
        <NavBar />
        <div className={pageStyles.center}>
          <RadioApp />
        </div>
      </div>
    </AuthProvider>
  );
}
