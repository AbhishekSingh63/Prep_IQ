import express from 'express';
import { parseResume, analyzeGap, generateQuestions, evaluateAnswer } from '../services/aiService.js';

const router = express.Router();

router.post('/parse-resume', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    
    // Attempt real AI call, fallback if error or no API key
    try {
      const data = await parseResume(text);
      res.json({ data });
    } catch (err) {
      console.log('Using fallback parseResume');
      res.json({ data: { name: "Candidate", skills: ["JavaScript", "Python"], experience_years: 2, projects: ["Portfolio"], education: "B.Tech", level: "mid" }});
    }
  } catch (error) {
    console.error('Error in /parse-resume:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

router.post('/analyze-gap', async (req, res) => {
  try {
    const { skills, role } = req.body;
    try {
      const data = await analyzeGap(skills, role);
      res.json({ data });
    } catch (err) {
      console.log('Using fallback analyzeGap');
      res.json({ data: { strong_skills: skills?.slice(0, 3) || [], weak_skills: ["System Design", "DSA"], recommendation: "Focus on fundamentals." }});
    }
  } catch (error) {
    console.error('Error in /analyze-gap:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { skills, role, difficulty, company } = req.body;
    try {
      const data = await generateQuestions(skills, role, difficulty, company);
      res.json({ data });
    } catch (err) {
      console.log('Using fallback generateQuestions');
      res.json({ data: [
        { id: 1, type: "DSA", question: "Implement a function to find two numbers in an array that sum to a target value.", hint: "Think about hash maps for O(n) complexity.", ideal_answer: "Use a hash map to store visited numbers." },
        { id: 2, type: "DSA", question: "Write a function to check if a string is a valid palindrome.", hint: "Two pointer approach works well here.", ideal_answer: "Use two pointers from both ends, skip non-alphanumeric characters." },
        { id: 3, type: "DSA", question: "Level-order traversal of binary tree.", hint: "BFS with a queue.", ideal_answer: "Use a queue, push root, then for each node pop and push its children." },
        { id: 4, type: "System Design", question: "Design a URL shortener like bit.ly. Discuss API, database, and scalability.", hint: "Think about base62 encoding, caching.", ideal_answer: "Use base62 encoding for short keys, store in a distributed DB (Cassandra)." },
        { id: 5, type: "System Design", question: "Design real-time notification system.", hint: "Consider WebSockets.", ideal_answer: "Use WebSockets for push, Kafka for message queue." },
        { id: 6, type: "HR", question: "Tell me about a time you disagreed with a technical decision. How did you handle it?", hint: "Use STAR format.", ideal_answer: "Describe the situation, your concern, how you communicated it constructively." },
      ]});
    }
  } catch (error) {
    console.error('Error in /generate:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

router.post('/evaluate', async (req, res) => {
  try {
    const { question, answer, idealAnswer } = req.body;
    try {
      const data = await evaluateAnswer(question, answer, idealAnswer);
      res.json({ data });
    } catch (err) {
      console.log('Using fallback evaluateAnswer');
      res.json({ data: { score: 6, verdict: "Good", feedback: "Your answer covers the main points.", missing_concepts: [], improved_answer: idealAnswer }});
    }
  } catch (error) {
    console.error('Error in /evaluate:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

export default router;
