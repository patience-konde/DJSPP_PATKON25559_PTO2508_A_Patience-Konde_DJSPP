# 🎙️ DJSPP Podcast Explorer

<p align="center">

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-Frontend-purple?logo=vite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)
![CSS Modules](https://img.shields.io/badge/CSS-Modules-blue)
![Responsive](https://img.shields.io/badge/Responsive-Yes-success)
![License](https://img.shields.io/badge/License-Educational-lightgrey)

</p>

A modern and responsive podcast application built with **React**, **React Router**, and **Vite**. DJSPP Podcast Explorer enables users to discover podcasts, browse seasons and episodes, stream audio, save favourites, search, filter, sort content, and personalize their experience with a light and dark theme.

---



# 📖 Project Overview

The DJSPP Podcast Explorer was developed to provide users with an enjoyable and intuitive platform for discovering podcasts and listening to episodes.

The application consumes podcast data from an external API and presents it through a clean, responsive user interface. Users can browse podcasts, filter by genre, search by title, sort results, manage favourites, listen to episodes using a global audio player, and save their listening progress.

This project demonstrates modern React development practices, including reusable components, custom hooks, Context API, React Router, and responsive UI design.

---

# ✨ Features

## 🎧 Podcast Library

* Browse all available podcasts
* Display podcast artwork
* View podcast descriptions
* Display available genres
* Display season count
* Display last updated date

---

## 🔍 Search Podcasts

* Search podcasts by title
* Instant search filtering

---

## 🎯 Filter by Genre

* Browse podcasts by category
* Easy genre selection

---

## ↕️ Sort Podcasts

Users can sort podcasts by:

* Title (A–Z)
* Title (Z–A)
* Newest Updated
* Oldest Updated

---

## 📄 Show Details

Each podcast includes:

* Cover artwork
* Description
* Genre tags
* Season selector
* Episode list

---

## 🎵 Global Audio Player

* Play episodes
* Pause episodes
* Resume playback
* Progress bar
* Audio seeking
* Volume control
* Display current episode

---

## ❤️ Favourite Podcasts

Users can:

* Add favourites
* Remove favourites
* Persist favourites using Local Storage

---

## 📄 Pagination

* Navigate between podcast pages
* Select pages using the PaginationModelSelector component

---

## 🌙 Theme Toggle

* Light Mode
* Dark Mode
* Theme preference saved automatically

---

## 💾 Local Storage

Stores:

* Favourite podcasts
* Listening progress
* Theme preference

---

## 📱 Responsive Design

Optimized for:

* 💻 Desktop
* 📱 Mobile
* 📟 Tablet

---

# 🛠 Technologies Used

| Technology        | Purpose                 |
| ----------------- | ----------------------- |
| React             | Frontend Framework      |
| React Router DOM  | Client-side Routing     |
| JavaScript (ES6+) | Application Logic       |
| Context API       | Global State Management |
| Custom Hooks      | Reusable Logic          |
| CSS Modules       | Component Styling       |
| HTML5             | Structure               |
| Vite              | Development Environment |

---

# 📂 Project Structure

```text
src
│
├── api
│   └── fetchData.js
│
├── assets
│
├── components
│   ├── EpisodeCard.jsx
│   ├── Error.jsx
│   ├── GenreFilter.jsx
│   ├── GenreTag.jsx
│   ├── GlobalAudioPlayer.jsx
│   ├── Header.jsx
│   ├── Loading.jsx
│   ├── PaginationModelSelector.jsx
│   ├── PodcastCard.jsx
│   ├── PodcastGrid.jsx
│   ├── ResetProgress.jsx
│   ├── SearchBar.jsx
│   ├── SortSelect.jsx
│   └── ThemeToggle.jsx
│
├── context
│   └── PodcastContext.jsx
│
├── hooks
│   ├── useAudioPlayer.js
│   └── useFavorite.js
│
├── pages
│   ├── Favorites.jsx
│   ├── Home.jsx
│   └── ShowDetail.jsx
│
├── utils
│   └── formatDate.js
│
├── App.jsx
└── main.jsx
```

---

# 🚀 Getting Started

## Clone the repository

```bash
git clone <repository-url>
```

## Navigate to the project

```bash
cd DJSPP-Podcast-Explorer
```

## Install dependencies

```bash
npm install
```

## Run the development server

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# 🌐 API

Podcast information is retrieved from the provided Podcast API.

Fallback podcast data is also included to ensure the application remains functional if the API is unavailable.

---

# 💡 React Concepts Demonstrated

* Functional Components
* Component Composition
* React Hooks

  * useState
  * useEffect
  * useMemo
* Custom Hooks
* Context API
* React Router
* Conditional Rendering
* Event Handling
* Local Storage
* Responsive Design
* Reusable Components

---

# 🎯 Challenges Faced

During development several challenges were encountered, including:

* Managing global audio playback across multiple pages.
* Synchronising playback progress with Local Storage.
* Implementing reusable components without duplicating code.
* Handling asynchronous API requests and loading states.
* Creating responsive layouts for different screen sizes.
* Managing favourites efficiently across the application.

These challenges helped strengthen my debugging skills and understanding of React application architecture.

---

# 🚀 Future Improvements

Potential enhancements include:

* User authentication
* Podcast subscriptions
* Recently played podcasts
* Episode queue
* Sleep timer
* Playback speed controls
* Podcast recommendations
* Offline listening
* Share podcasts

---

# 👩‍💻 Author

**Patience Konde**

Frontend Development Student

---

# 🙏 Acknowledgements

Special thanks to:

* CodeSpace Academy
* React Documentation
* Vite Documentation
* Podcast API providers
* My facilitators and peers for their guidance and support throughout the project.

---

# 📄 License

This project was developed for educational purposes as part of a Frontend Development programme.

---

# 📝 Project Reflection

Developing the DJSPP Podcast Explorer has been one of the most rewarding projects in my frontend development journey. It allowed me to apply everything I learned throughout the React module by building a complete, interactive, and responsive web application.

The project strengthened my understanding of component-based architecture, React Hooks, custom hooks, Context API, routing, state management, Local Storage, and API integration. One of the most challenging aspects was implementing the global audio player and ensuring playback state remained consistent across different pages while saving user progress.

Working through these challenges improved my debugging skills, problem-solving abilities, and confidence in developing scalable React applications. I also gained valuable experience in designing clean user interfaces, organizing project files, and writing maintainable code.

Overall, DJSPP Podcast Explorer represents my growth as a frontend developer and demonstrates my ability to build modern React applications using industry best practices.
