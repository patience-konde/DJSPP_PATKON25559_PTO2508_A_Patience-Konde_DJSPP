import React, { useContext } from "react";
import { PodcastContext } from "../context/PodcastContext";
import styles from "./SearchBar.module.css";

/**
 * SearchBar
 * Renders a search input bound to the global podcast `search` state.
 * Updates the `search` value in `PodcastContext` as the user types.
 * @returns {JSX.Element}
 */
export default function SearchBar() {
  const { search, setSearch } = useContext(PodcastContext);

  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
      <input
        className={styles.input}
        type="search"
        placeholder="Search podcasts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search podcasts"
      />
    </form>
  );
}
