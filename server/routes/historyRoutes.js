import express from 'express';
import History from '../models/History.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get logged in user history
// @route   GET /api/history
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const history = await History.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Save an interview result
// @route   POST /api/history
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { role, company, difficulty, questions, results, gapAnalysis } = req.body;

    const history = new History({
      user: req.user._id,
      role,
      company,
      difficulty,
      questions,
      results,
      gapAnalysis
    });

    const createdHistory = await history.save();
    res.status(201).json(createdHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
