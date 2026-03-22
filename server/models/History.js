import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  role: { type: String, required: true },
  topic: { type: String },
  company: { type: String },
  difficulty: { type: String, required: true },
  questions: { type: Array, required: true },
  results: { type: Array, required: true },
  score: { type: Number, default: 0 },
  improvementMetrics: { type: Object, default: {} },
  gapAnalysis: { type: Object }
}, { timestamps: true });

const History = mongoose.model('History', historySchema);
export default History;
