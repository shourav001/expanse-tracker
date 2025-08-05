const express = require('express');
const Transaction = require('../models/transactionModel');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const data = await Transaction.find({ userId: req.user.id });
  res.json(data);
});

router.post('/', async (req, res) => {
  const tx = await Transaction.create({ ...req.body, userId: req.user.id });
  res.status(201).json(tx);
});

router.put('/:id', async (req, res) => {
  const tx = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(tx);
});

router.delete('/:id', async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
