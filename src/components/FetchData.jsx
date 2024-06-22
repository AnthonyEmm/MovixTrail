import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import MovieCard from "./MovieCard";
import { GiFilmProjector } from "react-icons/gi";
import YouTube from "react-youtube";
import { FiXCircle } from "react-icons/fi";

const FetchData = () => {
  const IMAGE_PATH = "https://image.tmdb.org/t/p/original";
  const API_URL = "https://api.themoviedb.org/3";
  const [movies, setMovies] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [selectedMovie, setSelectedMovie] = useState({});
  const [showTrailer, setShowTrailer] = useState(false);
  const [player, setPlayer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMovies = useCallback(async (searchKey = "", page = 1) => {
    const type = searchKey ? "search" : "discover";

    try {
      const {
        data: { results, total_pages },
      } = await axios.get(`${API_URL}/${type}/movie`, {
        params: {
          api_key: import.meta.env.VITE_TMDB_API_KEY,
          query: searchKey,
          page: page,
        },
      });

      if (results.length > 0) {
        setMovies(results);
        await selectMovie(results[0]);
        setTotalPages(total_pages);
        setCurrentPage(page);
      } else {
        setMovies([]);
        setTotalPages(0);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  }, []);

  const getMovie = async (id) => {
    try {
      const { data } = await axios.get(`${API_URL}/movie/${id}`, {
        params: {
          api_key: import.meta.env.VITE_TMDB_API_KEY,
          append_to_response: "videos",
        },
      });
      return data;
    } catch (error) {
      console.error("Error finding movies:", error);
    }
  };

  const selectMovie = async (movie) => {
    const movieData = await getMovie(movie.id);
    setSelectedMovie(movieData);
    setShowTrailer(false);
    if (player) {
      player.stopVideo();
    }
    scrollToTop();
  };

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const renderMovies = () =>
    movies.map((movie) => (
      <MovieCard
        key={movie.id}
        movie={movie}
        selectMovie={selectMovie}
        scrollToTop={scrollToTop}
      />
    ));

  const handleSearchMovies = (e) => {
    e.preventDefault();
    fetchMovies(searchKey);
  };

  const clearSearch = () => {
    setSearchKey("");
    fetchMovies("");
  };

  const toggleTrailerModal = () => {
    setShowTrailer(!showTrailer);
  };

  const onReady = (event) => {
    setPlayer(event.target);
    event.target.playVideo();
  };

  const onCloseTrailer = () => {
    if (player) {
      player.stopVideo();
    }
    setShowTrailer(false);
    scrollToTop();
  };

  const goToPage = (page) => {
    fetchMovies(searchKey, page);
    scrollToTop();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    const pageButtons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <button
          key={i}
          className={`pagination-button ${i === currentPage ? "active" : ""}`}
          onClick={() => goToPage(i)}
        >
          {i}
        </button>,
      );
    }

    return (
      <div className="pagination">
        <button
          className="pagination-button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {pageButtons}
        <button
          className="pagination-button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  const renderTrailer = () => {
    if (!selectedMovie.videos || !selectedMovie.videos.results) return null;

    const trailer = selectedMovie.videos.results.find(
      (vid) => vid.type === "Trailer" || vid.name === "Official Trailer",
    );

    if (!trailer) return <p>No trailer available</p>;

    return (
      <div className={`trailer-modal ${showTrailer ? "show" : ""}`}>
        <div className="trailer-content">
          {showTrailer && (
            <YouTube
              videoId={trailer.key}
              className="youtube-video"
              onReady={onReady}
              opts={{
                playerVars: {
                  autoplay: 1,
                  controls: 1,
                },
              }}
            />
          )}
          <button className="close-button" onClick={onCloseTrailer}>
            Close Trailer
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fetchdata">
        <header className="header">
          <div className="header-content align-all">
            <div className="logo">
              <GiFilmProjector className="logo-icon" color="green" size={45} />
              <span className="movix">Movix</span>
            </div>
            <form onSubmit={handleSearchMovies} className="search-form">
              <div className="input-container">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                />
                {searchKey && (
                  <FiXCircle
                    className="clear-icon"
                    size={20}
                    onClick={clearSearch}
                  />
                )}
              </div>
              <button type="submit">GO!</button>
            </form>
          </div>
        </header>
        {selectedMovie && selectedMovie.backdrop_path && (
          <div className="hero-section">
            <img
              src={`${IMAGE_PATH}${selectedMovie.backdrop_path}`}
              alt={selectedMovie.title}
              className="hero-image"
            />
            <div className="hero-content">
              <button className="button" onClick={toggleTrailerModal}>
                Play Trailer
              </button>
              <h1 className="hero-title">{selectedMovie.title}</h1>
              {selectedMovie.overview && (
                <p className="hero-overview">{selectedMovie.overview}</p>
              )}
            </div>
          </div>
        )}
        <div className="container">{renderMovies()}</div>
        {renderPagination()}
        {renderTrailer()}
      </div>
    </>
  );
};

export default FetchData;
