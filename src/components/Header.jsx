import React from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";

/**
 * Header
 * Simple page header for the app.
 * @returns {JSX.Element}
 */
export default function Header({ theme = "dark", setTheme }) {
  const handleReset = () => {
    if (typeof window === "undefined") return;

    window.localStorage.removeItem("podcast-theme");
    window.localStorage.removeItem("podcast-favourites-v1");
    window.localStorage.removeItem("podcast-player-v1");
    window.location.reload();
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div>
          <p className={styles.eyebrow}>Audio-first discovery</p>
          <h1 className={styles.title}>Podcast Discovery</h1>
        </div>
        <div className={styles.actions}>
          <Link to="/favourites" className={styles.navLink}>
            ♥ Favourites
          </Link>
          <button
            className={styles.themeButton}
            type="button"
            onClick={() => setTheme?.(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button
            className={styles.resetButton}
            type="button"
            onClick={handleReset}
          >
            Reset all in <progress></progress>
          </button>
        </div>
      </div>
    </header>
  );
}
