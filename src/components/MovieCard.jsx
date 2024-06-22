import React from "react";

const MovieCard = ({ movie, selectMovie, scrollToTop }) => {
  const IMAGE_PATH = "https://image.tmdb.org/t/p/w500";

  const handleClick = () => {
    selectMovie(movie); // Calling  selectMovie to handle movie selection
    scrollToTop(); // Scroll to top after selecting the movie
  };

  return (
    <div className="movie-card" onClick={handleClick}>
      {movie.poster_path ? (
        <img
          src={`${IMAGE_PATH}${movie.poster_path}`}
          alt={movie.title}
          className="movie-cover"
        />
      ) : (
        <div className="movie-replacement">No Image Found</div>
      )}
      <h5 className="movie-title">{movie.title}</h5>
    </div>
  );
};

export default MovieCard;
