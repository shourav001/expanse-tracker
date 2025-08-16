import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FaPlus, FaEdit, FaTrash, FaFilter, FaTimes, FaSignOutAlt, FaCog, FaBell } from 'react-icons/fa';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import BudgetSettings from './components/BudgetSettings';
import './App.css';

function App() {
  const { user, loading, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    totalTransactions: 0,
    monthlyExpenses: 0,
    monthlyBudget: 0,
    budgetAlert: null
  });
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    category: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showBudgetSettings, setShowBudgetSettings] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'other',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const categories = {
    expense: ['food', 'bills', 'transportation', 'entertainment', 'shopping', 'health', 'education', 'other'],
    income: ['salary', 'freelance', 'investment', 'other']
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchSummary();
    }
  }, [filters, user]);

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);
      
      const response = await axios.get(`http://localhost:5001/api/transactions?${params}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTransaction) {
        await axios.put(`http://localhost:5001/api/transactions/${editingTransaction._id}`, formData);
      } else {
        await axios.post('http://localhost:5001/api/transactions', formData);
      }
      
      resetForm();
      setShowModal(false);
      fetchTransactions();
      fetchSummary();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error saving transaction. Please try again.');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      title: transaction.title,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      date: format(new Date(transaction.date), 'yyyy-MM-dd')
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`http://localhost:5001/api/transactions/${id}`);
        fetchTransactions();
        fetchSummary();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error deleting transaction. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      type: 'expense',
      category: 'other',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setEditingTransaction(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      category: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Show loading screen
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <Login />;
  }

  return (
    <div className="App">
      <div className="container">
        <header className="text-center mb-20">
          <div className="header-content">
            <div>
              <h1>💰 Expense Tracker</h1>
              <p>Track your income and expenses with ease</p>
            </div>
            <div className="user-controls">
              <span className="welcome-text">Welcome, {user.username}!</span>
              <button 
                className="btn btn-success"
                onClick={() => setShowBudgetSettings(true)}
              >
                <FaCog /> Budget Settings
              </button>
              <button 
                className="btn btn-danger"
                onClick={logout}
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </header>

        {/* Budget Alert */}
        {summary.budgetAlert && (
          <div className={`alert ${summary.budgetAlert.isExceeded ? 'alert-error' : 'alert-warning'} mb-20`}>
            <FaBell className="alert-icon" />
            <strong>Budget Alert:</strong> {summary.budgetAlert.message}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-3 mb-20">
          <div className="card text-center">
            <h3>Total Balance</h3>
            <h2 className={summary.balance >= 0 ? 'income' : 'expense'}>
              {formatCurrency(summary.balance)}
            </h2>
          </div>
          <div className="card text-center">
            <h3>Total Income</h3>
            <h2 className="income">{formatCurrency(summary.totalIncome)}</h2>
          </div>
          <div className="card text-center">
            <h3>Total Expenses</h3>
            <h2 className="expense">{formatCurrency(summary.totalExpense)}</h2>
          </div>
        </div>

        {/* Monthly Budget Card */}
        {summary.monthlyBudget > 0 && (
          <div className="card mb-20">
            <h3 className="text-center mb-20">Monthly Budget Overview</h3>
            <div className="budget-overview">
              <div className="budget-item">
                <span>Monthly Budget:</span>
                <span className="amount">{formatCurrency(summary.monthlyBudget)}</span>
              </div>
              <div className="budget-item">
                <span>Spent This Month:</span>
                <span className="amount expense">{formatCurrency(summary.monthlyExpenses)}</span>
              </div>
              <div className="budget-item">
                <span>Remaining:</span>
                <span className={`amount ${summary.monthlyBudget - summary.monthlyExpenses >= 0 ? 'income' : 'expense'}`}>
                  {formatCurrency(summary.monthlyBudget - summary.monthlyExpenses)}
                </span>
              </div>
              <div className="budget-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.min((summary.monthlyExpenses / summary.monthlyBudget) * 100, 100)}%`,
                      backgroundColor: summary.monthlyExpenses >= summary.monthlyBudget ? '#ff6b6b' : '#667eea'
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {((summary.monthlyExpenses / summary.monthlyBudget) * 100).toFixed(1)}% used
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="card">
          <div className="flex flex-between">
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <FaPlus /> Add Transaction
            </button>
            <button 
              className="btn btn-success"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter /> {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-20">
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Type</label>
                  <select 
                    className="form-control"
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    className="form-control"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {filters.type === 'income' || !filters.type ? (
                      categories.income.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))
                    ) : null}
                    {filters.type === 'expense' || !filters.type ? (
                      categories.expense.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))
                    ) : null}
                  </select>
                </div>
              </div>
              <button 
                className="btn btn-danger"
                onClick={clearFilters}
              >
                <FaTimes /> Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Transactions List */}
        <div className="card">
          <h2>Transactions ({transactions.length})</h2>
          {transactions.length === 0 ? (
            <p className="text-center mt-20">No transactions found. Add your first transaction!</p>
          ) : (
            <div className="mt-20">
              {transactions.map(transaction => (
                <div 
                  key={transaction._id} 
                  className={`transaction-item ${transaction.type}`}
                >
                  <div className="flex flex-between">
                    <div>
                      <h3>{transaction.title}</h3>
                      <p className="text-muted">
                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </p>
                      <span className={`badge badge-${transaction.type}`}>
                        {transaction.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <h3 className={transaction.type === 'income' ? 'income' : 'expense'}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </h3>
                      <div className="mt-10">
                        <button 
                          className="btn btn-success"
                          onClick={() => handleEdit(transaction)}
                          style={{ marginRight: '10px' }}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDelete(transaction._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => {
              setShowModal(false);
              resetForm();
            }}>&times;</span>
            <h2>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    className="form-control"
                    value={formData.type}
                    onChange={(e) => setFormData({
                      ...formData, 
                      type: e.target.value,
                      category: categories[e.target.value][0]
                    })}
                    required
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    {categories[formData.type].map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div className="flex flex-between">
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTransaction ? 'Update' : 'Add'} Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Settings Modal */}
      <BudgetSettings 
        isOpen={showBudgetSettings}
        onClose={() => setShowBudgetSettings(false)}
      />
    </div>
  );
}

export default App; 