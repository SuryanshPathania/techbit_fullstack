
const Movie = require("../Models/Movie");

// ✅ Add Movie (Only for Logged-in User)
const addMovie = async (req, res) => {
  try {
    console.log(" Received Movie Data:", req.body);
    console.log(" Authenticated User ID:", req.user.userId);

    const { title, year, poster } = req.body;
    const userId = req.user.userId;

    if (!title || !year || !poster) {
      console.log(" Missing required fields");
      return res.status(400).json({ message: "All fields are required (title, year, poster)" });
    }

    const newMovie = new Movie({
      title,
      releaseYear: year,
      posterUrl: poster,
      user: userId,
    });

    await newMovie.save();
    console.log(" Movie added successfully:", newMovie);

    res.status(201).json({
      message: "Movie added successfully",
      movie: {
        _id: newMovie._id,
        title: newMovie.title,
        year: newMovie.releaseYear,
        poster: newMovie.posterUrl,
      },
    });

  } catch (error) {
    console.error(" Error adding movie:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get Movies (Only for Logged-in User)
// const getMovies = async (req, res) => {
//   try {
//     console.log(" Fetching movies for user:", req.user.userId);
//     const userId = req.user.userId;
//     const movies = await Movie.find({ user: userId });

//     console.log(" Movies found:", movies.length);

//     res.json(movies);
//   } catch (error) {
//     console.error(" Error fetching movies:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

const getMovies = async (req, res) => {
    try {
      console.log(" Fetching movies for user:", req.user.userId);
      const userId = req.user.userId;
      const movies = await Movie.find({ user: userId });
  
      console.log(" Movies found:", movies.length);
  
      // Ensure full image URL is sent
      const formattedMovies = movies.map(movie => ({
        _id: movie._id,
        title: movie.title,
        year: movie.releaseYear,
        poster: movie.posterUrl.startsWith("http") ? movie.posterUrl : `http://localhost:3000/uploads/${movie.posterUrl}`
      }));
  
      res.json(formattedMovies);
    } catch (error) {
      console.error(" Error fetching movies:", error);
      res.status(500).json({ message: "Server error" });
    }
  };



const editMovie = async (req, res) => {
    try {
      console.log("🔹 Editing Movie Data:", req.body);
      console.log("🔹 Authenticated User ID:", req.user.userId);
  
      const { title, year, poster } = req.body;
      const userId = req.user.userId;
      const movieId = req.params.id;
  
      const movie = await Movie.findOne({ _id: movieId, user: userId });
  
      if (!movie) {
        console.log(" Movie not found");
        return res.status(404).json({ message: "Movie not found" });
      }
  
      //  Keep the existing poster if none is provided
      movie.title = title || movie.title;
      movie.releaseYear = year || movie.releaseYear;
      movie.posterUrl = poster ? poster : movie.posterUrl; 
  
      const updatedMovie = await movie.save();
      console.log(" Movie updated successfully:", updatedMovie);
  
      res.json({
        _id: updatedMovie._id,
        title: updatedMovie.title,
        year: updatedMovie.releaseYear,
        poster: updatedMovie.posterUrl,
      });
  
    } catch (error) {
      console.error(" Error updating movie:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  

//  Delete Movie (Only for Logged-in User)
const deleteMovie = async (req, res) => {
  try {
    console.log(" Deleting Movie ID:", req.params.id);
    console.log(" Authenticated User ID:", req.user.userId);

    const userId = req.user.userId;
    const movieId = req.params.id;

    const movie = await Movie.findOne({ _id: movieId, user: userId });

    if (!movie) {
      console.log(" Movie not found");
      return res.status(404).json({ message: "Movie not found" });
    }

    await Movie.deleteOne({ _id: movieId });
    console.log(" Movie deleted successfully");

    res.json({ message: "Movie deleted successfully" });
  } catch (error) {
    console.error(" Error deleting movie:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addMovie, getMovies, editMovie, deleteMovie };
