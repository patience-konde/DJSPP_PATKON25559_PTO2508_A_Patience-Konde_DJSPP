import React, { useEffect, useMemo, useRef } from "react";
import styles from "./GlobalAudioPlayer.module.css";
import { useAudioPlayer } from "../hooks/userAudioPlayer";

function formatTime(seconds = 0) {
  const safeSeconds = Number.isFinite(seconds)
    ? Math.max(0, Math.floor(seconds))
    : 0;
  const mins = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (safeSeconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function GlobalAudioPlayer() {
  const { activeEpisode, isPlaying, progress, duration, togglePlay, seekTo } =
    useAudioPlayer();

  const rangeRef = useRef(null);

  const progressPercent = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, (progress / duration) * 100);
  }, [progress, duration]);

  useEffect(() => {
    if (!rangeRef.current) return;
    rangeRef.current.style.setProperty("--progress", `${progressPercent}%`);
  }, [progressPercent]);

  if (!activeEpisode) {
    return null;
  }

  return (
    <div className={styles.playerShell}>
      <div className={styles.playerInfo}>
        <div className={styles.playerArt}>
          {activeEpisode.image ? (
            <img src={activeEpisode.image} alt={activeEpisode.title} />
          ) : (
            <span>♪</span>
          )}
        </div>
        <div className={styles.playerMeta}>
          <p className={styles.playerTitle}>{activeEpisode.title}</p>
          <p className={styles.playerSubtitle}>
            {activeEpisode.showTitle || "Now playing"}
          </p>
        </div>
      </div>

      <div className={styles.controlsSection}>
        <div className={styles.buttonRow}>
          <button
            className={styles.iconButton}
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause episode" : "Play episode"}
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>
          <div className={styles.timeRow}>
            <span>{formatTime(progress)}</span>
            <input
              ref={rangeRef}
              className={styles.progressInput}
              type="range"
              min="0"
              max={duration || 0}
              value={progress}
              onChange={(event) => seekTo(Number(event.target.value))}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
