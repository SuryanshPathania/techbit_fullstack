const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  releaseYear: {
    type: Number,
    required: true
  },
  posterUrl: {
    type: String, // Store the URL of the movie poster
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference the User model
    required: true
  }
});

module.exports = mongoose.model("Movie", movieSchema);
