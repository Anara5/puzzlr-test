const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
require("dotenv").config();

const router = express.Router();

// **Signup Route **
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" })
    }

    user = new User({ email, password });
    await user.save(); // Password gets hashed in the model before saving

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ msg: "Server error" });
  }
})

// **Login Route **
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" })
    }

    // Ensure email is a string
    if (typeof email !== "string") {
      return res.status(400).json({ msg: "Invalid email format" })
    }

    // Find user in DB
    const user = await User.findOne({ email: email.trim() });

    if (!user) {
      return res.status(400).json({ msg: "User does not exist" })
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" })
    }

    // Generate token with userId property
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: "2h" });

    // Send only token and user info (avoid sending password)
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ msg: "Server error" })
  }
})

// **Get user score **
router.get("/score", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({ msg: "User ID is missing" })
    }

    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    res.json({ score: user.score });
  } catch (err) {
    console.error("Score fetch error:", err)
    res.status(500).json({ msg: "Server error", error: err.message })
  }
})

// **Update user score **
router.post("/score", authMiddleware, async (req, res) => {
  const { change } = req.body;
  const io = req.app.get("io");

  try {
    if (!req.user) {
      return res.status(400).json({ msg: "User ID is missing" })
    }

    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    user.score += change;
    await user.save();

    // Emit leaderboard update event
    const topUsers = await User.find({}).sort({ score: -1 }).limit(10).select("email score")

    io.emit("leaderboard-update", { leaderboard: topUsers });

    res.json({ newScore: user.score });
  } catch (err) {
    console.error("Score update error:", err)
    res.status(500).json({ msg: "Server error", error: err.message })
  }
})

// **Get top scores (leaderboard) **
router.get("/leaderboard", async (req, res) => {
  try {
    // Get limit from query params or default to 10
    const limit = Number.parseInt(req.query.limit) || 10;

    // Find top users sorted by score (descending)
    const topUsers = await User.find({}).sort({ score: -1 }).limit(limit).select("email score"); // Return email and score

    res.json({ leaderboard: topUsers });
  } catch (err) {
    console.error("Leaderboard fetch error:", err)
    res.status(500).json({ msg: "Server error", error: err.message })
  }
})

// **Get player ranking **
router.get("/ranking", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({ msg: "User ID is missing" })
    }

    // Get the user's score
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    // Count how many users have a higher score
    const higherScores = await User.countDocuments({ score: { $gt: user.score } });

    // Ranking is position (1-based)
    const ranking = higherScores + 1;

    // Get total number of users
    const totalUsers = await User.countDocuments();

    res.json({
      ranking,
      totalUsers,
      percentile: Math.round(((totalUsers - ranking) / totalUsers) * 100),
    });
  } catch (err) {
    console.error("Ranking fetch error:", err)
    res.status(500).json({ msg: "Server error", error: err.message })
  }
});

module.exports = router;
