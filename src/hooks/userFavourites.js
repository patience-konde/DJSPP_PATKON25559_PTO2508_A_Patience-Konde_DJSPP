import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "podcast-favourites-v1";

function readFavourites() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useFavourites() {
  const [favourites, setFavourites] = useState(() => readFavourites());

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
  }, [favourites]);

  const toggleFavourite = useCallback((episode) => {
    setFavourites((current) => {
      const exists = current.some((item) => item.id === episode.id);
      if (exists) {
        return current.filter((item) => item.id !== episode.id);
      }
      return [{ ...episode, addedAt: new Date().toISOString() }, ...current];
    });
  }, []);

  const isFavourite = useCallback(
    (episodeId) => favourites.some((item) => item.id === episodeId),
    [favourites],
  );

  const value = useMemo(
    () => ({ favourites, toggleFavourite, isFavourite }),
    [favourites, toggleFavourite, isFavourite],
  );

  return value;
}
