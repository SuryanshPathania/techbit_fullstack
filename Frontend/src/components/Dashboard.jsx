

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchMovies,
  addMovie,
  editMovie,
  deleteMovie,
} from "../redux/movieSlice";
import "../../src/App.css";

const Dashboard = () => {
  const dispatch = useDispatch();
  const movies = useSelector((state) => state.movies.list);
  const loading = useSelector((state) => state.movies.status === "loading");
  const [movie, setMovie] = useState({
    _id: "",
    title: "",
    year: "",
    poster: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(fetchMovies());
  }, [dispatch]);

  const handleChange = (e) => {
    setMovie({ ...movie, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      dispatch(editMovie(movie));
    } else {
      dispatch(addMovie(movie));
    }
    setMovie({ _id: "", title: "", year: "", poster: "" });
    setIsEditing(false);
  };

  const handleEdit = (movie) => {
    setMovie(movie);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this movie?")) {
      dispatch(deleteMovie(id));
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Movie Dashboard</h1>
        <Link to="/profile" className="profile-button">
          My Profile
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="movie-form">
        <input type="text" name="title" value={movie.title} onChange={handleChange} placeholder="Movie Title" required />
        <input type="number" name="year" value={movie.year} onChange={handleChange} placeholder="Release Year" required min="1880" max="2099" />
        <input type="url" name="poster" value={movie.poster} onChange={handleChange} placeholder="Poster URL" required />
        <button type="submit" disabled={loading} className="submit-btn">
          {isEditing ? "Update Movie" : "Add Movie"}
        </button>
      </form>

      {loading && <p className="loading-message">Loading movies...</p>}

      {!loading && movies.length > 0 ? (
        <div className="movie-list">
          {movies.map((movie) => (
            <div key={movie._id} className="movie-card">
              <img src={movie.poster} alt={movie.title} className="movie-poster" />
              <h3>{movie.title} ({movie.year})</h3>
              <div className="movie-actions">
                <button className="edit-btn" onClick={() => handleEdit(movie)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(movie._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-movies-message">No movies available.</p>
      )}
    </div>
  );
};

export default Dashboard;
