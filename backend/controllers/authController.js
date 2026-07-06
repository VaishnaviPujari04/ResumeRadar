import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google
export async function googleLogin(req, res) {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: "Google credential is required" });
  }

  try {
    // Verify the token with Google — this is what guarantees the email is real
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: "Google email is not verified" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // Existing user — link Google if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = "google";
        user.avatar = picture;
        await user.save();
      }
    } else {
      // New user — create account
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: "google",
        avatar: picture,
      });
    }

    res.json({
      message: "Google login successful",
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid Google token", error: err.message });
  }
}
// POST /api/auth/signup
export async function signup(req, res) {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({
      message: "Account created successfully",
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
}

// GET /api/auth/me
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
}