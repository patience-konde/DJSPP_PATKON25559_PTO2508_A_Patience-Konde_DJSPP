import React, { useContext } from "react";
import { PodcastContext, SORT_OPTIONS } from "../context/PodcastContext";
import styles from "./SortSelect.module.css";

/**
 * SortSelect
 * Select control for choosing sort order. Updates `sortKey` in context.
 * @returns {JSX.Element}
 */
export default function SortSelect() {
  const { sortKey, setSortKey } = useContext(PodcastContext);

  return (
    <select
      className={styles.select}
      value={sortKey}
      onChange={(e) => setSortKey(e.target.value)}
      aria-label="Sort podcasts"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.key} value={opt.key}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
