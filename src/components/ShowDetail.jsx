import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { genres as genreList } from "../data";
import { formatDate } from "../utils/formatDate";
import { useAudioPlayer } from "../hooks/userAudioPlayer";
import { useFavourites } from "../hooks/userFavourites";
import Header from "./Header";
import styles from "./ShowDetail.module.css";

const genreTitleById = genreList.reduce((map, genre) => {
  map[genre.id] = genre.title;
  return map;
}, {});

/**
 * truncate
 * Shortens long text to a maximum length, appending an ellipsis if truncated.
 * @param {string} text - The original text to shorten.
 * @param {number} [maxLength=140] - The maximum allowed length.
 * @returns {string} The shortened text.
 */
const truncate = (text, maxLength = 140) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
};

/**
 * ShowDetail
 * Fetches a podcast show by ID and renders details, season navigation,
 * and episode listings.
 * @returns {JSX.Element}
 */
export default function ShowDetail({ theme = "dark", setTheme }) {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSeasonIndex, setActiveSeasonIndex] = useState(0);
  const { playEpisode, history } = useAudioPlayer();
  const { favourites, toggleFavourite, isFavourite } = useFavourites();

  useEffect(() => {
    let cancelled = false;

    async function loadShow() {
      setLoading(true);
      setError(null);
      setShow(null);

      if (!id) {
        setError("Invalid show ID.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://podcast-api.netlify.app/id/${encodeURIComponent(id)}`,
        );

        if (!response.ok) {
          throw new Error("Unable to load show details.");
        }

        const data = await response.json();
        if (cancelled) return;
        setShow(data);
        setActiveSeasonIndex(0);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Unable to load show details.");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    loadShow();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const genreTitles = useMemo(() => {
    if (!show?.genres) return [];
    return Array.isArray(show.genres)
      ? show.genres.map(
          (genreId) => genreTitleById[genreId] || `Genre ${genreId}`,
        )
      : [];
  }, [show]);

  const seasons = Array.isArray(show?.seasons) ? show.seasons : [];
  const totalEpisodes = seasons.reduce(
    (sum, season) =>
      sum + (Array.isArray(season.episodes) ? season.episodes.length : 0),
    0,
  );
  const selectedSeason = seasons[activeSeasonIndex] || seasons[0] || null;
  const historyMap = useMemo(() => {
    return (history || []).reduce((map, item) => {
      map[item.id] = item;
      return map;
    }, {});
  }, [history]);

  return (
    <div className={styles.pageShell}>
      <Header theme={theme} setTheme={setTheme} />
      <div className={styles.page}>
        <div className={styles.headingRow}>
          <Link to="/" className={styles.backLink}>
            ← Back
          </Link>
        </div>

        {loading ? (
          <div className={styles.messageBlock}>Loading show details…</div>
        ) : error ? (
          <div className={`${styles.messageBlock} ${styles.errorBlock}`}>
            {error}
          </div>
        ) : !show ? (
          <div className={styles.messageBlock}>Show not found.</div>
        ) : (
          <article className={styles.detailPage}>
            <section className={styles.heroSection}>
              {show.image && (
                <img
                  className={styles.heroImage}
                  src={show.image}
                  alt={show.title}
                />
              )}
              <div className={styles.heroContent}>
                <p className={styles.subtleMeta}>
                  {seasons.length} season{seasons.length === 1 ? "" : "s"}
                  {show.updated ? (
                    <>
                      <span className={styles.dot}>•</span>
                      Updated {formatDate(show.updated)}
                    </>
                  ) : null}
                </p>
                <h1 className={styles.title}>{show.title}</h1>
                <p className={styles.description}>{show.description}</p>
                <div className={styles.tagList}>
                  {genreTitles.length > 0 ? (
                    genreTitles.map((label) => (
                      <span key={label} className={styles.genreTag}>
                        {label}
                      </span>
                    ))
                  ) : (
                    <span className={styles.genreTag}>Unknown genre</span>
                  )}
                </div>
                <div className={styles.heroStats}>
                  <div className={styles.heroStatItem}>
                    <span className={styles.heroStatLabel}>Total seasons</span>
                    <strong>{seasons.length}</strong>
                  </div>
                  <div className={styles.heroStatItem}>
                    <span className={styles.heroStatLabel}>Total episodes</span>
                    <strong>{totalEpisodes}</strong>
                  </div>
                </div>
                <div className={styles.actionRow}>
                  <button
                    type="button"
                    className={styles.primaryAction}
                    onClick={() =>
                      playEpisode({
                        title:
                          selectedSeason?.episodes?.[0]?.title || show.title,
                        showTitle: show.title,
                        image: show.image,
                        audioUrl:
                          selectedSeason?.episodes?.[0]?.audioUrl || undefined,
                      })
                    }
                  >
                    ▶ Play featured episode
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryAction}
                    onClick={() =>
                      toggleFavourite({
                        id: `${show.id}-featured`,
                        title: show.title,
                        showTitle: show.title,
                        showId: show.id,
                        seasonNumber: selectedSeason?.season ?? 1,
                      })
                    }
                  >
                    {isFavourite(`${show.id}-featured`)
                      ? "★ Saved"
                      : "☆ Save show"}
                  </button>
                </div>
              </div>
            </section>

            <section className={styles.seasonSection}>
              <div className={styles.currentSeasonRow}>
                <div>
                  <p className={styles.currentSeasonLabel}>Current season</p>
                  <h3 className={styles.currentSeasonTitle}>
                    {selectedSeason?.title ||
                      `Season ${selectedSeason?.season ?? 1}`}
                  </h3>
                </div>
                <div className={styles.seasonSelectWrapper}>
                  <label
                    htmlFor="season-select"
                    className={styles.visuallyHidden}
                  >
                    Select season
                  </label>
                  <select
                    id="season-select"
                    className={styles.seasonSelect}
                    value={activeSeasonIndex}
                    onChange={(e) =>
                      setActiveSeasonIndex(Number(e.target.value))
                    }
                  >
                    {seasons.map((season, index) => {
                      const title =
                        season.title || `Season ${season.season ?? index + 1}`;
                      return (
                        <option key={title} value={index}>
                          {title}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {selectedSeason ? (
                <div className={styles.seasonEpisodesCard}>
                  <div className={styles.episodeList}>
                    {selectedSeason.episodes?.length ? (
                      selectedSeason.episodes.map((episode) => {
                        const episodeKey = `${show.id}-${episode.episode}`;
                        return (
                          <article
                            key={episode.episode}
                            className={styles.episodeCard}
                          >
                            <div className={styles.episodeOverlayActions}>
                              <button
                                type="button"
                                className={`${styles.episodeFavoriteButton} ${
                                  isFavourite(episodeKey)
                                    ? styles.episodeFavoriteButtonActive
                                    : ""
                                }`.trim()}
                                onClick={() =>
                                  toggleFavourite({
                                    id: episodeKey,
                                    title: episode.title,
                                    showTitle: show.title,
                                    showId: show.id,
                                    seasonNumber: selectedSeason?.season ?? 1,
                                  })
                                }
                                aria-label={
                                  isFavourite(episodeKey)
                                    ? "Remove episode from favourites"
                                    : "Add episode to favourites"
                                }
                                aria-pressed={isFavourite(episodeKey)}
                                title={
                                  isFavourite(episodeKey)
                                    ? "Remove from favourites"
                                    : "Save to favourites"
                                }
                              >
                                {isFavourite(episodeKey) ? "♥" : "♡"}
                              </button>
                            </div>
                            {selectedSeason.image && (
                              <img
                                className={styles.episodeThumbnail}
                                src={selectedSeason.image}
                                alt={selectedSeason.title}
                              />
                            )}
                            <div className={styles.episodeIndex}>
                              <span>{episode.episode}</span>
                            </div>
                            <div className={styles.episodeContent}>
                              <div className={styles.episodeHeader}>
                                <h4>{episode.title}</h4>
                                <p className={styles.episodeSubtitle}>
                                  Episode {episode.episode}
                                </p>
                              </div>
                              <p className={styles.episodeDescription}>
                                {truncate(episode.description, 140)}
                              </p>
                              <div className={styles.episodeActions}>
                                {historyMap[episodeKey] ? (
                                  <span className={styles.progressBadge}>
                                    {historyMap[episodeKey].finished
                                      ? "Finished"
                                      : historyMap[episodeKey].progress > 0
                                        ? "In progress"
                                        : "Saved"}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <button
                              type="button"
                              className={styles.episodePlayButton}
                              onClick={() =>
                                playEpisode({
                                  id: episodeKey,
                                  title: episode.title,
                                  showTitle: show.title,
                                  showId: show.id,
                                  seasonNumber: selectedSeason?.season ?? 1,
                                  image: selectedSeason.image || show.image,
                                  audioUrl: episode.audioUrl || undefined,
                                })
                              }
                              aria-label={`Play ${episode.title}`}
                            >
                              ▶
                            </button>
                          </article>
                        );
                      })
                    ) : (
                      <div className={styles.emptyState}>
                        No episodes are available for this season.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.emptyState}>No seasons available.</div>
              )}
            </section>
          </article>
        )}
      </div>
    </div>
  );
}
