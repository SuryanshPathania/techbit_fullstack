
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const authController = require("./controllers/authController");
const movieController = require("./controllers/movieController");
const authMiddleware = require("./middleware/authMiddleware");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB with debug logs
connectDB().catch(err => {
  console.error(" Database connection failed:", err);
  process.exit(1);
});

// Auth Routes
app.post("/signup", authController.upload.single("profilePic"), authController.signup);
app.post("/login", authController.login);
app.get("/profile", authMiddleware, authController.getProfile);
app.put("/profile", authMiddleware, authController.upload.single("profilePic"), authController.updateProfile);

// Movie Routes (Protected)
app.post("/movies", authMiddleware, movieController.addMovie);
app.get("/movies", authMiddleware, movieController.getMovies);
app.put("/movies/:id", authMiddleware, movieController.editMovie);
app.delete("/movies/:id", authMiddleware, movieController.deleteMovie);

// Start the server
app.listen(port, () => {
  console.log(` Server running on port ${port}`);
});
