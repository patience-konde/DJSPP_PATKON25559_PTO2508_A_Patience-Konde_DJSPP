import React, { useContext, useEffect, useRef } from "react";
import PodcastCard from "./PodcastCard";
import styles from "./PodcastGrid.module.css";
import { PodcastContext } from "../context/PodcastContext";

/**
 * PodcastGrid
 * Renders a grid of PodcastCard components from context-provided podcasts.
 * @param {{genres: {id: number, name: string}[]}} props
 */
export default function PodcastGrid({ genres }) {
  const {
    podcasts = [],
    paginationMode,
    loadMore,
  } = useContext(PodcastContext) || {};
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (paginationMode !== "infinite") return;
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) loadMore();
        });
      },
      { rootMargin: "200px" },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [paginationMode, loadMore]);

  if (!podcasts.length) {
    return (
      <p className={styles.noResults}>
        No podcasts match your search or filters.
      </p>
    );
  }

  return (
    <div className={styles.grid}>
      {podcasts.map((podcast) => (
        <PodcastCard key={podcast.id} podcast={podcast} genres={genres} />
      ))}
      {paginationMode === "infinite" && (
        <div ref={sentinelRef} data-testid="scroll-sentinel" />
      )}
    </div>
  );
}
