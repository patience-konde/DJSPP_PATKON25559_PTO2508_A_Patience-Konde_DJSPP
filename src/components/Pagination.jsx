import React, { useContext, useMemo, useEffect } from "react";
import { PodcastContext } from "../context/PodcastContext";
import styles from "./Pagination.module.css";

/**
 * Pagination
 * Renders numbered pagination or a "Load More" button depending on
 * the `paginationMode` supplied by `PodcastContext`.
 * - In `pages` mode displays prev/next and page buttons.
 * - In `load-more` and `infinite` modes displays a single button to reveal more items.
 * @returns {JSX.Element|null}
 */
export default function Pagination() {
  const {
    page,
    setPage,
    pageSize,
    totalPodcasts,
    paginationMode,
    loadMore,
    visibleCount,
  } = useContext(PodcastContext);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalPodcasts / pageSize)),
    [totalPodcasts, pageSize],
  );

  // Ensure current page is not out of range when totalPodcasts changes
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages, setPage]);

  if (totalPages <= 1 && paginationMode === "pages") return null;

  // Numbered pagination
  if (paginationMode === "pages") {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);

    return (
      <nav className={styles.pagination} aria-label="Pagination">
        <button
          className={styles.button}
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Prev
        </button>

        {pages.map((p) => (
          <button
            key={p}
            className={`${styles.button} ${p === page ? styles.active : ""}`}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        ))}

        <button
          className={styles.button}
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </nav>
    );
  }

  // Load more button (also used as fallback for infinite)
  return (
    <div className={styles.loadMoreWrap}>
      <button
        className={styles.button}
        onClick={() => loadMore()}
        disabled={visibleCount >= totalPodcasts}
      >
        {visibleCount >= totalPodcasts ? "All Loaded" : "Load More"}
      </button>
    </div>
  );
}
