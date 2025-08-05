const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
  title: String,
  amount: Number,
  category: String,
  type: { type: String, enum: ['income', 'expense'] },
  date: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
module.exports = mongoose.model('Transaction', transactionSchema);
