import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import History from '../models/History.js';

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Get total questions and accuracy from history
      const history = await History.find({ user: user._id });
      let totalQuestions = 0;
      let totalScore = 0;
      let accuracy = 0;

      if (history && history.length > 0) {
        history.forEach(h => {
          totalQuestions += h.questions ? h.questions.length : 0;
          totalScore += h.score || 0;
        });
        if (totalQuestions > 0) {
          let sumScores = history.reduce((acc, curr) => acc + (curr.score || 0), 0);
          accuracy = Math.round(sumScores / history.length); 
        }
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        totalQuestionsAttempted: totalQuestions,
        accuracy: accuracy,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get user progress/history
// @route   GET /api/user/progress
// @access  Private
router.get('/progress', protect, async (req, res) => {
  try {
    const history = await History.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Save user progress
// @route   POST /api/user/progress
// @access  Private
router.post('/progress', protect, async (req, res) => {
  try {
    const { role, topic, company, difficulty, questions, results, gapAnalysis, score, improvementMetrics } = req.body;

    const history = new History({
      user: req.user._id,
      role: role || topic || 'General',
      topic: topic || role || 'General',
      company,
      difficulty,
      questions,
      results,
      score: score || 0,
      improvementMetrics: improvementMetrics || {},
      gapAnalysis
    });

    const createdHistory = await history.save();
    res.status(201).json(createdHistory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
