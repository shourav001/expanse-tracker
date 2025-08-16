const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'simple-db.json');

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    users: [],
    transactions: []
  }));
}

// Read database
function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [], transactions: [] };
  }
}

// Write database
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// User operations
const UserDB = {
  async findOne(query) {
    const db = readDB();
    return db.users.find(user => {
      return Object.keys(query).every(key => user[key] === query[key]);
    });
  },

  async findById(id) {
    const db = readDB();
    return db.users.find(user => user.id === id);
  },

  async create(userData) {
    const db = readDB();
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(newUser);
    writeDB(db);
    return newUser;
  },

  async findByIdAndUpdate(id, updateData) {
    const db = readDB();
    const userIndex = db.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    db.users[userIndex] = {
      ...db.users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    writeDB(db);
    return db.users[userIndex];
  }
};

// Transaction operations
const TransactionDB = {
  async find(query = {}) {
    const db = readDB();
    let transactions = db.transactions;
    
    if (query.userId) {
      transactions = transactions.filter(t => t.userId === query.userId);
    }
    if (query.type) {
      transactions = transactions.filter(t => t.type === query.type);
    }
    if (query.category) {
      transactions = transactions.filter(t => t.category === query.category);
    }
    
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async findOne(query) {
    const db = readDB();
    return db.transactions.find(transaction => {
      return Object.keys(query).every(key => transaction[key] === query[key]);
    });
  },

  async create(transactionData) {
    const db = readDB();
    const newTransaction = {
      _id: Date.now().toString(),
      ...transactionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.transactions.push(newTransaction);
    writeDB(db);
    return newTransaction;
  },

  async findOneAndUpdate(query, updateData) {
    const db = readDB();
    const transactionIndex = db.transactions.findIndex(t => 
      Object.keys(query).every(key => t[key] === query[key])
    );
    
    if (transactionIndex === -1) return null;
    
    db.transactions[transactionIndex] = {
      ...db.transactions[transactionIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    writeDB(db);
    return db.transactions[transactionIndex];
  },

  async findOneAndDelete(query) {
    const db = readDB();
    const transactionIndex = db.transactions.findIndex(t => 
      Object.keys(query).every(key => t[key] === query[key])
    );
    
    if (transactionIndex === -1) return null;
    
    const deletedTransaction = db.transactions[transactionIndex];
    db.transactions.splice(transactionIndex, 1);
    writeDB(db);
    return deletedTransaction;
  }
};

// Initialize test user if not exists
async function initializeTestUser() {
  const existingUser = await UserDB.findOne({ username: 'user' });
  if (!existingUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    await UserDB.create({
      username: 'user',
      password: hashedPassword,
      monthlyBudget: 1000,
      budgetAlertThreshold: 80
    });
    
    console.log('Test user created: username=user, password=123456');
  }
}

module.exports = { UserDB, TransactionDB, initializeTestUser }; 