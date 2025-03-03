const User = require("../Models/User");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Rename file with timestamp
  }
});

// Multer upload middleware
const upload = multer({ storage: storage });

// Password validation regex (at least one special character)
const passwordRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

// Base URL for profile pictures
const baseUrl = process.env.BASE_URL || "http://localhost:3000";

// SIGNUP API

const signup = async (req, res) => {
  try {
    console.log(" Signup API hit");

    const { email, password, dob, firstName, lastName } = req.body;
    console.log(" Received Data:", { email, password, dob, firstName, lastName });

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "⚠ Email, password, first name, and last name are required" });
    }

    if (!validator.isEmail(email)) {
      console.log(" Invalid email format");
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!passwordRegex.test(password)) {
      console.log(" Weak password");
      return res.status(400).json({ message: "Password must contain at least one special character" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(" User already exists");
      return res.status(400).json({ message: "Email already exists" });
    }

    // 🔹 Ensure only the date part is saved as a STRING
    const dobFormatted = dob ? dob.split("T")[0] : null; // Saves only "YYYY-MM-DD"

    // Profile Pic Handling
    const profilePic = req.file ? `${baseUrl}/uploads/${req.file.filename}` : null;

    // Save User
    const user = new User({
      email,
      password,
      profilePic,
      dob: dobFormatted, // Save DOB as a string
      firstName,
      lastName
    });

    await user.save();
    console.log(" User created:", user);

    res.status(201).json({
      message: "User created successfully",
      userId: user._id,
      profilePic: user.profilePic
    });

  } catch (error) {
    console.error(" Signup error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// LOGIN API
const login = async (req, res) => {
  try {
    console.log(" Login API hit");

    const { email, password } = req.body;
    console.log(" Received Data:", { email, password });

    if (!email || !password) {
      return res.status(400).json({ message: "⚠ Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      console.log(" Invalid credentials");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log(" Password matched");

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePic: user.profilePic ? `${baseUrl}/uploads/${user.profilePic.split('/').pop()}` : null
    });

  } catch (error) {
    console.error(" Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET PROFILE (Protected)
const getProfile = async (req, res) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      console.log(" No Authorization header received");
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    //  Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    if (!token) {
      console.log("Token missing from Authorization header");
      return res.status(401).json({ message: "Invalid token format" });
    }

    console.log("🔹 Received Token:", token);

    //  Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified successfully:", decoded);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log(" User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // 🔹 Fix profile picture URL
    if (user.profilePic && !user.profilePic.startsWith("http")) {
      user.profilePic = `${process.env.BASE_URL}/uploads/${user.profilePic.split("/").pop()}`;
    }

    res.json(user);
  } catch (error) {
    console.error(" Token verification failed:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

// UPDATE PROFILE (Protected)
const updateProfile = async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Extract Token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find User
    let user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare update data
    let updateData = {};
    if (req.body.firstName) updateData.firstName = req.body.firstName;
    if (req.body.lastName) updateData.lastName = req.body.lastName;
    if (req.body.dob) updateData.dob = req.body.dob;

    // Handle Profile Picture Upload
    if (req.file) {
      // Delete old profile picture if exists
      if (user.profilePic) {
        const oldImagePath = path.join(__dirname, "..", "uploads", user.profilePic.split("/").pop());
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.profilePic = `${baseUrl}/uploads/${req.file.filename}`;
    }

    // Update user
    user = await User.findByIdAndUpdate(decoded.userId, updateData, { new: true }).select("-password");

    res.json({
      message: "Profile updated successfully",
      user,
    });

  } catch (error) {
    console.error(" Update profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// EXPORT MODULE
module.exports = { signup, login, getProfile, updateProfile, upload };
