const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserDB, TransactionDB, initializeTestUser } = require('./simple-db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Initialize test user
initializeTestUser().then(() => {
  console.log('Database initialized with test user');
}).catch(err => {
  console.log('Error initializing test user:', err);
});

// Password comparison function
async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await UserDB.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Auth Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, monthlyBudget = 0 } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await UserDB.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await UserDB.create({
      username,
      password: hashedPassword,
      monthlyBudget
    });
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        monthlyBudget: user.monthlyBudget
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const user = await UserDB.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        monthlyBudget: user.monthlyBudget
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        monthlyBudget: req.user.monthlyBudget,
        budgetAlertThreshold: req.user.budgetAlertThreshold
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user budget
app.put('/api/auth/budget', authenticateToken, async (req, res) => {
  try {
    const { monthlyBudget, budgetAlertThreshold } = req.body;
    
    const updatedUser = await UserDB.findByIdAndUpdate(req.user.id, {
      monthlyBudget: monthlyBudget || req.user.monthlyBudget,
      budgetAlertThreshold: budgetAlertThreshold || req.user.budgetAlertThreshold
    });
    
    res.json({
      message: 'Budget updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        monthlyBudget: updatedUser.monthlyBudget,
        budgetAlertThreshold: updatedUser.budgetAlertThreshold
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Routes

// Get all transactions
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { type, category } = req.query;
    let filter = { userId: req.user.id };
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    
    const transactions = await TransactionDB.find(filter);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new transaction
app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;
    
    if (!title || !amount || !type || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const transaction = await TransactionDB.create({
      userId: req.user.id,
      title,
      amount,
      type,
      category,
      date: date || new Date()
    });
    
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update transaction
app.put('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;
    
    if (!title || !amount || !type || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const transaction = await TransactionDB.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        title,
        amount,
        type,
        category,
        date: date || new Date()
      }
    );
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete transaction
app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await TransactionDB.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get transaction by ID
app.get('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await TransactionDB.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get summary statistics
app.get('/api/summary', authenticateToken, async (req, res) => {
  try {
    const transactions = await TransactionDB.find({ userId: req.user.id });
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    // Calculate monthly expenses for budget tracking
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const monthlyExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Budget alert calculation
    let budgetAlert = null;
    if (req.user.monthlyBudget > 0) {
      const budgetPercentage = (monthlyExpenses / req.user.monthlyBudget) * 100;
      if (budgetPercentage >= req.user.budgetAlertThreshold) {
        budgetAlert = {
          message: `You've used ${budgetPercentage.toFixed(1)}% of your monthly budget!`,
          percentage: budgetPercentage,
          isExceeded: budgetPercentage >= 100
        };
      }
    }
    
    res.json({
      totalIncome,
      totalExpense,
      balance,
      totalTransactions: transactions.length,
      monthlyExpenses,
      monthlyBudget: req.user.monthlyBudget,
      budgetAlert
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 