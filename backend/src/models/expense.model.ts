import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  note: { type: String }
}, {
  timestamps: true
});

export const Expense = mongoose.model('Expense', expenseSchema);
