/**
 * PodcastCard
 * Presentational card for a podcast entry.
 * @param {{podcast: {id:number,title:string,image?:string,seasons?:number,updated?:string,description?:string,genres?:Array<number>}, genres?:Array<{id:number,title:string}>}} props
 * @returns {JSX.Element}
 */

import React from "react";
import { Link } from "react-router-dom";
import styles from "./PodcastCard.module.css";
import { formatDate } from "../utils/formatDate";

export default function PodcastCard({ podcast, genres = [] }) {
  const genreSpans = (podcast.genres || []).map((id) => {
    const match = genres.find(
      (g) => g.id === id || String(g.id) === String(id),
    );
    return (
      <span key={id} className={styles.tag}>
        {match ? match.title : `Unknown (${id})`}
      </span>
    );
  });

  return (
    <Link to={`/show/${podcast.id}`} className={styles.cardLink}>
      <div className={styles.card}>
        {podcast.image && (
          <img
            className={styles.cardImage}
            src={podcast.image}
            alt={podcast.title}
          />
        )}

        <h3>{podcast.title}</h3>
        {podcast.seasons != null && (
          <p className={styles.seasons}>{podcast.seasons} seasons</p>
        )}
        <div className={styles.tags}>{genreSpans}</div>
        {podcast.updated && (
          <p className={styles.updatedText}>
            updated {formatDate(podcast.updated)}
          </p>
        )}
      </div>
    </Link>
  );
}
