import React, { useContext } from "react";
import { PodcastContext } from "../context/PodcastContext";
import styles from "./PaginationModeSelector.module.css";

/**
 * PaginationModeSelector
 * Small control allowing the user to choose pagination behavior.
 * Updates `paginationMode` in `PodcastContext`.
 * @returns {JSX.Element}
 */
export default function PaginationModeSelector() {
  const { paginationMode, setPaginationMode } = useContext(PodcastContext);

  return (
    <select
      className={styles.select}
      value={paginationMode}
      onChange={(e) => setPaginationMode(e.target.value)}
      aria-label="Pagination mode"
    >
      <option value="pages">Pages</option>
      <option value="load-more">Load More</option>
      <option value="infinite">Infinite Scroll</option>
    </select>
  );
}
