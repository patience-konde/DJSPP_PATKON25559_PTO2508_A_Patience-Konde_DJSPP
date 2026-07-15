import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const STORAGE_KEY = "podcast-player-v1";
const DEFAULT_AUDIO =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

function loadStoredState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const AudioPlayerContext = createContext(null);

export function AudioPlayerProvider({ children }) {
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [history, setHistory] = useState(() => {
    const stored = loadStoredState();
    return stored?.history || [];
  });
  const audioRef = useRef(null);
  const activeEpisodeRef = useRef(null);
  const historyRef = useRef([]);
  const progressRef = useRef(0);
  const durationRef = useRef(0);

  useEffect(() => {
    activeEpisodeRef.current = activeEpisode;
  }, [activeEpisode]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  const updateHistoryEntry = useCallback(
    (episode, nextProgress, nextDuration, finished) => {
      if (!episode?.id) return;
      const safeDuration =
        Number.isFinite(nextDuration) && nextDuration > 0
          ? nextDuration
          : durationRef.current || 0;
      const safeProgress = Number.isFinite(nextProgress)
        ? Math.max(0, nextProgress)
        : 0;
      const nextEntry = {
        id: episode.id,
        title: episode.title,
        showTitle: episode.showTitle || episode.show || "Unknown show",
        showId: episode.showId,
        seasonNumber: episode.seasonNumber,
        progress: Math.min(safeProgress, safeDuration || safeProgress),
        duration: safeDuration,
        finished: Boolean(finished),
        updatedAt: new Date().toISOString(),
        lastPlayedAt: new Date().toISOString(),
      };

      setHistory((current) => {
        const existing = current.find((item) => item.id === episode.id);
        if (existing) {
          return current.map((item) =>
            item.id === episode.id ? nextEntry : item,
          );
        }
        return [nextEntry, ...current];
      });
    },
    [],
  );

  const ensureAudio = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) {
      const audio = new Audio(DEFAULT_AUDIO);
      audio.preload = "metadata";
      audio.volume = volume;
      audio.addEventListener("timeupdate", () => {
        const currentTime = audio.currentTime || 0;
        progressRef.current = currentTime;
        setProgress(currentTime);
        const currentEpisode = activeEpisodeRef.current;
        if (currentEpisode?.id) {
          updateHistoryEntry(
            currentEpisode,
            currentTime,
            audio.duration || durationRef.current || 0,
            false,
          );
        }
      });
      audio.addEventListener("loadedmetadata", () => {
        const nextDuration = audio.duration || 0;
        durationRef.current = nextDuration;
        setDuration(nextDuration);
        const currentEpisode = activeEpisodeRef.current;
        if (currentEpisode?.id) {
          const storedEntry = historyRef.current.find(
            (item) => item.id === currentEpisode.id,
          );
          const resumeTime =
            storedEntry && !storedEntry.finished
              ? storedEntry.progress || 0
              : 0;
          const safeResumeTime = Math.min(
            resumeTime,
            nextDuration || resumeTime,
          );
          if (safeResumeTime > 0 && audio.currentTime !== safeResumeTime) {
            audio.currentTime = safeResumeTime;
          }
          setProgress(safeResumeTime);
        }
      });
      audio.addEventListener("ended", () => {
        const currentEpisode = activeEpisodeRef.current;
        const finalDuration = audio.duration || durationRef.current || 0;
        setIsPlaying(false);
        setProgress(finalDuration);
        if (currentEpisode?.id) {
          updateHistoryEntry(
            currentEpisode,
            finalDuration,
            finalDuration,
            true,
          );
        }
      });
      audioRef.current = audio;
    }
    return audioRef.current;
  }, [updateHistoryEntry, volume]);

  useEffect(() => {
    const stored = loadStoredState();
    if (stored?.activeEpisode) {
      setActiveEpisode(stored.activeEpisode);
      setProgress(stored.progress || 0);
      setIsPlaying(Boolean(stored.isPlaying));
      setVolume(stored.volume ?? 0.8);
      setHistory(stored.history || []);
    }
  }, []);

  useEffect(() => {
    const audio = ensureAudio();
    if (!audio) return;
    audio.volume = volume;
  }, [ensureAudio, volume]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = {
      activeEpisode,
      progress,
      volume,
      isPlaying,
      history,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [activeEpisode, progress, volume, isPlaying, history]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isPlaying) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isPlaying]);

  const playEpisode = useCallback(
    (episode) => {
      const audio = ensureAudio();
      if (!audio) return;
      const episodeToPlay = {
        ...episode,
        id: episode.id || `${episode.showId || "show"}-${episode.title}`,
        audioUrl: episode.audioUrl || DEFAULT_AUDIO,
      };
      const storedEntry = historyRef.current.find(
        (item) => item.id === episodeToPlay.id,
      );
      const resumeTime =
        storedEntry && !storedEntry.finished ? storedEntry.progress || 0 : 0;
      setActiveEpisode(episodeToPlay);
      setProgress(resumeTime);
      setDuration(storedEntry?.duration || 0);
      audio.src = episodeToPlay.audioUrl;
      audio.currentTime = resumeTime;
      audio.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
      updateHistoryEntry(
        episodeToPlay,
        resumeTime,
        storedEntry?.duration || 0,
        false,
      );
    },
    [ensureAudio, updateHistoryEntry],
  );

  const togglePlay = useCallback(() => {
    const audio = ensureAudio();
    if (!audio) return;
    if (!activeEpisode) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    audio.play().catch(() => setIsPlaying(false));
    setIsPlaying(true);
  }, [activeEpisode, ensureAudio, isPlaying]);

  const pausePlayback = useCallback(() => {
    const audio = ensureAudio();
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, [ensureAudio]);

  const seekTo = useCallback(
    (nextTime) => {
      const audio = ensureAudio();
      if (!audio) return;
      const safeNextTime = Math.max(0, nextTime);
      audio.currentTime = safeNextTime;
      setProgress(safeNextTime);
      const currentEpisode = activeEpisodeRef.current;
      if (currentEpisode?.id) {
        updateHistoryEntry(
          currentEpisode,
          safeNextTime,
          durationRef.current || 0,
          false,
        );
      }
    },
    [ensureAudio, updateHistoryEntry],
  );

  const setPlayerVolume = useCallback(
    (nextVolume) => {
      const audio = ensureAudio();
      if (!audio) return;
      const safeVolume = Math.min(1, Math.max(0, nextVolume));
      audio.volume = safeVolume;
      setVolume(safeVolume);
    },
    [ensureAudio],
  );

  const resetHistory = useCallback(() => {
    setHistory([]);
    setProgress(0);
    setDuration(0);
    const audio = ensureAudio();
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
  }, [ensureAudio]);

  const value = useMemo(
    () => ({
      activeEpisode,
      playEpisode,
      isPlaying,
      progress,
      duration,
      volume,
      history,
      togglePlay,
      pausePlayback,
      seekTo,
      setVolume: setPlayerVolume,
      resetHistory,
    }),
    [
      activeEpisode,
      playEpisode,
      isPlaying,
      progress,
      duration,
      volume,
      history,
      togglePlay,
      pausePlayback,
      seekTo,
      setPlayerVolume,
      resetHistory,
    ],
  );

  return React.createElement(AudioPlayerContext.Provider, { value }, children);
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error(
      "useAudioPlayer must be used within an AudioPlayerProvider",
    );
  }
  return context;
}
