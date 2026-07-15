import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useFavourites } from "../hooks/userFavourites";
import Header from "./Header";
import styles from "./FavouritesPage.module.css";

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

export default function FavouritesPage({ theme = "dark", setTheme }) {
  const { favourites, toggleFavourite, isFavourite } = useFavourites();
  const [sortKey, setSortKey] = useState("newest");

  const sortedFavourites = useMemo(() => {
    const items = [...favourites];
    items.sort((a, b) => {
      if (sortKey === "az") {
        return a.title.localeCompare(b.title);
      }
      if (sortKey === "za") {
        return b.title.localeCompare(a.title);
      }
      if (sortKey === "oldest") {
        return new Date(a.addedAt) - new Date(b.addedAt);
      }
      return new Date(b.addedAt) - new Date(a.addedAt);
    });
    return items;
  }, [favourites, sortKey]);

  const groupedFavourites = useMemo(() => {
    return sortedFavourites.reduce((groups, favourite) => {
      const groupKey = favourite.showTitle || "Unknown show";
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(favourite);
      return groups;
    }, {});
  }, [sortedFavourites]);

  return (
    <div className={styles.pageShell}>
      <Header theme={theme} setTheme={setTheme} />
      <div className={styles.page}>
        <div className={styles.topBar}>
          <div className={styles.headingBlock}>
            <p className={styles.eyebrow}>Saved episodes</p>
            <h1 className={styles.title}>Your favourites</h1>
            <p className={styles.subtitle}>
              Keep every episode you want to return to, grouped by show.
            </p>
          </div>
          <div className={styles.controls}>
            <label className={styles.label} htmlFor="favourites-sort">
              Sort by
            </label>
            <select
              id="favourites-sort"
              className={styles.select}
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value)}
            >
              <option value="newest">Newest added</option>
              <option value="oldest">Oldest added</option>
              <option value="az">A–Z</option>
              <option value="za">Z–A</option>
            </select>
          </div>
        </div>

        {sortedFavourites.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No favourites yet</h2>
            <p>Save episodes from a show page to build your personal queue.</p>
            <Link to="/" className={styles.emptyAction}>
              Browse shows
            </Link>
          </div>
        ) : (
          <div className={styles.groups}>
            {Object.entries(groupedFavourites).map(([showTitle, episodes]) => (
              <section key={showTitle} className={styles.groupCard}>
                <div className={styles.groupHeader}>
                  <h2>{showTitle}</h2>
                  <span>
                    {episodes.length} episode{episodes.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className={styles.list}>
                  {episodes.map((episode) => (
                    <article key={episode.id} className={styles.itemCard}>
                      <div className={styles.itemMain}>
                        <div className={styles.itemBadge}>Saved</div>
                        <h3>{episode.title}</h3>
                        <p className={styles.meta}>
                          Season {episode.seasonNumber ?? "—"} • Added{" "}
                          {formatDateTime(episode.addedAt)}
                        </p>
                      </div>
                      <div className={styles.itemActions}>
                        <Link
                          to={`/show/${episode.showId}`}
                          className={styles.linkButton}
                        >
                          View show
                        </Link>
                        <button
                          type="button"
                          className={`${styles.heartButton} ${
                            isFavourite(episode.id)
                              ? styles.heartButtonActive
                              : ""
                          }`.trim()}
                          onClick={() => toggleFavourite(episode)}
                          aria-label={
                            isFavourite(episode.id)
                              ? "Unfavourite episode"
                              : "Favourite episode"
                          }
                          aria-pressed={isFavourite(episode.id)}
                          title={
                            isFavourite(episode.id)
                              ? "Remove from favourites"
                              : "Save to favourites"
                          }
                        >
                          {isFavourite(episode.id) ? "♥" : "♡"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
