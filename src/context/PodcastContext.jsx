import React, { createContext, useEffect, useMemo, useState } from "react";

/**
 * sorting options available to the user for viewing podcasts.
 * @type {{key: string, label: string}[]}
 */
export const SORT_OPTIONS = [
  { key: "default", label: "Default" },
  { key: "date-desc", label: "Newest" },
  { key: "date-asc", label: "Oldest" },
  { key: "title-asc", label: "Title (A-Z)" },
  { key: "title-desc", label: "Title (Z-A)" },
];
/**
 * React context for sharing podcast state across components.
 * must be used within a PodcastProvider to access values.
 */
export const PodcastContext = createContext();

/**
 * @typedef {Object} PodcastContextValue
 * @property {string} search
 * @property {(v:string)=>void} setSearch
 * @property {string|number} genre
 * @property {(v:string)=>void} setGenre
 * @property {string} sortKey
 * @property {(v:string)=>void} setSortKey
 * @property {number} page
 * @property {(n:number)=>void} setPage
 * @property {number} pageSize
 * @property {(n:number)=>void} setPageSize
 * @property {Object[]} podcasts - current page or visible podcasts
 * @property {number} totalPodcasts - total count after filters
 * @property {string} paginationMode
 * @property {(m:string)=>void} setPaginationMode
 * @property {function} loadMore
 * @property {number} visibleCount
 * @property {number} totalPages
 */

/**
 * PodcastProvider
 * Wraps children in a context and manages podcast browse state, including
 * search, genre filters, sort order, pagination, and UI persistence.
 * @param {{children: React.ReactNode, initialPodcasts:Object[]}} props
 * @returns {JSX.Element} The provider component wrapping children with context values.
 */
export function PodcastProvider({ children, initialPodcasts = [] }) {
  const SESSION_KEY = "podcast_ui_v1";

  /**
   * Read persisted UI session from `sessionStorage`.
   * @returns {{search?:string,genre?:string,sortKey?:string,page?:number,pageSize?:number,paginationMode?:string,visibleCount?:number}}
   */
  const readSession = () => {
    try {
      if (typeof window === "undefined") return {};
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  };

  const saved = readSession();

  const [search, setSearch] = useState(saved.search ?? "");
  const [genre, setGenre] = useState(saved.genre ?? "all");
  const [sortKey, setSortKey] = useState(saved.sortKey ?? "date-desc");
  const [page, setPage] = useState(saved.page ?? 1);
  const [pageSize, setPageSize] = useState(saved.pageSize ?? 10);
  // pagination modes: 'pages' (numbered), 'load-more' (button), 'infinite' (scroll)
  const [paginationMode, setPaginationMode] = useState("pages");
  // used for load-more / infinite modes to track how many items are revealed
  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => {
    /**
     * Calculate a sensible `pageSize` based on viewport width.
     * Desktop: estimate how many ~250px cards fit; mobile/tablet: fixed 10.
     * @returns {void}
     */
    const calculatePageSize = () => {
      const screenWidth = window.innerWidth;

      // Tablet and smaller if (width < 1024px): allow 10 cards per page
      if (screenWidth < 1024) {
        setPageSize(10);
        return;
      }

      // Desktop: calculate how many cards fit based on a 250px card width and 25px gap
      const cardWidth = 250;
      const gap = 25;
      const totalCardWidth = cardWidth + gap;
      const calculatedPageSize = Math.floor(screenWidth / totalCardWidth);
      setPageSize(calculatedPageSize);
    };

    calculatePageSize();
    window.addEventListener("resize", calculatePageSize);
    return () => window.removeEventListener("resize", calculatePageSize);
  }, []);

  const [filteredPodcasts, setFilteredPodcasts] = useState(() => [
    ...initialPodcasts,
  ]);

  /**
   * Compute the filtered and sorted podcast list whenever the source data
   * or UI controls change. This keeps a stable filtered array in state so
   * pagination can operate on a consistent dataset.
   */
  useEffect(() => {
    let items = [...initialPodcasts];

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      items = items.filter(
        (podcast) =>
          podcast.title.toLowerCase().includes(query) ||
          (podcast.description &&
            podcast.description.toLowerCase().includes(query)),
      );
    }

    if (genre !== "all") {
      const g = Number(genre);
      items = items.filter((podcast) => {
        if (Array.isArray(podcast.genres)) return podcast.genres.includes(g);
        if (podcast.genre) return Number(podcast.genre) === g;
        return false;
      });
    }

    switch (sortKey) {
      case "date-asc":
        items.sort(
          (a, b) =>
            new Date(a.updated || a.date) - new Date(b.updated || b.date),
        );
        break;
      case "date-desc":
        items.sort(
          (a, b) =>
            new Date(b.updated || b.date) - new Date(a.updated || a.date),
        );
        break;
      case "title-asc":
        items.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        items.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    setFilteredPodcasts(items);
  }, [initialPodcasts, search, genre, sortKey]);

  const paginatedPodcasts = useMemo(() => {
    if (paginationMode === "pages") {
      const startIndex = (page - 1) * pageSize;
      return filteredPodcasts.slice(startIndex, startIndex + pageSize);
    }

    // load-more and infinite: show from start up to visibleCount
    return filteredPodcasts.slice(0, visibleCount);
  }, [filteredPodcasts, page, pageSize, paginationMode, visibleCount]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredPodcasts.length / pageSize),
    );
    if (page > totalPages) setPage(totalPages);
  }, [filteredPodcasts.length, pageSize]);

  // reset pagination when filters/search/sort change
  useEffect(() => {
    setPage(1);
    setVisibleCount(pageSize);
  }, [search, genre, sortKey, pageSize]);

  // persist UI choices to sessionStorage so they survive navigation within the session
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const payload = {
        search,
        genre,
        sortKey,
        page,
        pageSize,
        paginationMode,
        visibleCount,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
  }, [search, genre, sortKey, page, pageSize, paginationMode, visibleCount]);

  // helpers for load more / infinite
  const totalPages = Math.max(1, Math.ceil(filteredPodcasts.length / pageSize));

  /**
   * Reveal more items for `load-more` / `infinite` modes or advance page
   * when using numbered pages.
   * @returns {void}
   */
  const loadMore = () => {
    // if in pages mode, advance page
    if (paginationMode === "pages")
      return setPage((p) => Math.min(totalPages, p + 1));
    setVisibleCount((v) => Math.min(filteredPodcasts.length, v + pageSize));
  };

  const value = {
    search,
    setSearch,
    genre,
    setGenre,
    sortKey,
    setSortKey,
    page,
    setPage,
    pageSize,
    setPageSize,
    podcasts: paginatedPodcasts,
    totalPodcasts: filteredPodcasts.length,
    paginationMode,
    setPaginationMode,
    loadMore,
    visibleCount,
    totalPages,
  };

  return (
    <PodcastContext.Provider value={value}>{children}</PodcastContext.Provider>
  );
}
