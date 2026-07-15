import React, { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter as Router, Link, Routes, Route } from "react-router-dom";
import { PodcastProvider } from "./context/PodcastContext";
import { genres } from "./data";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import SortSelect from "./components/SortSelect";
import GenreFilter from "./components/GenreFilter";
import PaginationModeSelector from "./components/PaginationModeSelector";
import PodcastGrid from "./components/PodcastGrid";
import Pagination from "./components/Pagination";
import ShowDetail from "./components/ShowDetail";
import FavouritesPage from "./components/FavouritesPage";
import GlobalAudioPlayer from "./components/GlobalAudioPlayer";
import { AudioPlayerProvider } from "./hooks/userAudioPlayer";
import styles from "./App.module.css";
import "../styles.css";

/**
 * App
 * Fetches the show preview list and renders the homepage or the show
 * detail page based on the current route.
 * @returns {JSX.Element}
 */
export default function App() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem("podcast-theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("podcast-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    let cancelled = false;

    async function fetchShows() {
      setLoading(true);
      setFetchError(null);

      try {
        const res = await fetch("https://podcast-api.netlify.app/shows");
        if (!res.ok) throw new Error("Unable to load shows");
        const data = await res.json();
        if (!cancelled) setShows(data);
      } catch (err) {
        if (!cancelled) setFetchError(err.message || "Unable to load shows");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchShows();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PodcastProvider initialPodcasts={shows}>
      <AudioPlayerProvider>
        <Router>
          <div className={styles.appShell}>
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    loading={loading}
                    error={fetchError}
                    theme={theme}
                    setTheme={setTheme}
                    shows={shows}
                  />
                }
              />
              <Route
                path="/show/:id"
                element={<ShowDetail theme={theme} setTheme={setTheme} />}
              />
              <Route
                path="/favourites"
                element={<FavouritesPage theme={theme} setTheme={setTheme} />}
              />
            </Routes>
            <GlobalAudioPlayer />
          </div>
        </Router>
      </AudioPlayerProvider>
    </PodcastProvider>
  );
}

/**
 * HomePage
 * Displays the podcast browsing UI, including filters, search, and the
 * podcast grid, while preserving UI state from the context provider.
 * @param {{loading:boolean,error:string|null}} props
 * @returns {JSX.Element}
 */
function HomePage({ loading, error, theme, setTheme, shows }) {
  const featuredShows = useMemo(() => {
    if (!shows?.length) return [];
    return [...shows]
      .sort((a, b) => Number(b.seasons || 0) - Number(a.seasons || 0))
      .slice(0, 8);
  }, [shows]);
  const carouselRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);

  const scrollCarousel = (direction) => {
    const container = carouselRef.current;
    if (!container) return;
    const cardWidth =
      container.firstElementChild?.getBoundingClientRect().width || 280;
    const gap = 16;
    const target =
      direction === "next"
        ? container.scrollLeft + cardWidth + gap
        : container.scrollLeft - cardWidth - gap;
    container.scrollTo({ left: target, behavior: "smooth" });
  };

  const handleTouchStart = (event) => {
    setTouchStart(event.touches[0].clientX);
  };

  const handleTouchEnd = (event) => {
    if (touchStart === null) return;
    const delta = event.changedTouches[0].clientX - touchStart;
    if (delta > 50) {
      scrollCarousel("prev");
    } else if (delta < -50) {
      scrollCarousel("next");
    }
    setTouchStart(null);
  };

  const handleCarouselKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollCarousel("next");
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollCarousel("prev");
    }
  };

  return (
    <div className={styles.pageLayout}>
      <Header theme={theme} setTheme={setTheme} />

      <div className={styles.controls}>
        <SearchBar />
        <GenreFilter genres={genres} />
        <SortSelect />
        <PaginationModeSelector />
      </div>

      {loading ? (
        <div className={styles.loadingMessage}>Loading shows…</div>
      ) : error ? (
        <div className={styles.errorMessage}>
          Unable to load podcasts. Please try again later.
        </div>
      ) : (
        <>
          <section className={styles.recommendationSection}>
            <div className={styles.recommendationHeader}>
              <div>
                <p className={styles.eyebrow}>Recommended for you</p>
                <h2>Fresh picks to keep the queue moving</h2>
              </div>
              <p className={styles.recommendationCopy}>
                Curated shows with standout seasons and binge-worthy energy.
              </p>
            </div>
            <div className={styles.carouselControls}>
              <button
                type="button"
                className={styles.carouselButton}
                onClick={() => scrollCarousel("prev")}
                aria-label="Scroll to previous recommended show"
              >
                ←
              </button>
              <div
                ref={carouselRef}
                className={styles.recommendationCarousel}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onKeyDown={handleCarouselKeyDown}
                tabIndex={0}
                role="listbox"
                aria-label="Recommended shows carousel"
              >
                {featuredShows.map((show) => (
                  <Link
                    key={show.id}
                    to={`/show/${show.id}`}
                    className={styles.recommendationCard}
                    role="option"
                  >
                    {show.image ? (
                      <img src={show.image} alt={show.title} />
                    ) : null}
                    <div>
                      <h3>{show.title}</h3>
                      <p>
                        {show.seasons
                          ? `${show.seasons} seasons`
                          : "New episodes"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <button
                type="button"
                className={styles.carouselButton}
                onClick={() => scrollCarousel("next")}
                aria-label="Scroll to next recommended show"
              >
                →
              </button>
            </div>
          </section>
          <PodcastGrid genres={genres} />
          <Pagination />
        </>
      )}
    </div>
  );
}
