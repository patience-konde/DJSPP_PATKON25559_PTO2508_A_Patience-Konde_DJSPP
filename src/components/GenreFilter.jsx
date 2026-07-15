import { useContext } from "react";
import { PodcastContext } from "../context/PodcastContext";
import styles from "./GenreFilter.module.css";

/**
 * GenreFilter
 * Dropdown to select a genre filter. Reads and writes `genre` in context.
 * @param {{genres: {id: number, name: string}[]}} props
 * @returns {JSX.Element}
 */
export default function GenreFilter({ genres }) {
  const { genre, setGenre } = useContext(PodcastContext);

  return (
    <select
      className={styles.select}
      value={genre}
      onChange={(e) => setGenre(e.target.value)}
    >
      <option value="all">All Genres</option>
      {genres.map((g) => (
        <option key={g.id} value={g.id}>
          {g.title}
        </option>
      ))}
    </select>
  );
}
