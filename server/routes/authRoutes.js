import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const generateToken = (id) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET is not configured.');
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }
    if (name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ message: 'Name must be between 2 and 100 characters.' });
    }

    const emailLower = email.toLowerCase().trim();

    const userExists = await User.findOne({ email: emailLower });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name: name.trim(), email: emailLower, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const emailLower = email.toLowerCase().trim();

    const user = await User.findOne({ email: emailLower });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

export default router;
