import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({ title: '', amount: '', category: '', type: 'expense' });
  const [editId, setEditId] = useState(null);
  const token = localStorage.getItem('token');

  // Fetch transactions
  const loadTransactions = async () => {
    const res = await axios.get('http://localhost:5000/api/v1/transactions', {
      headers: { Authorization: token },
    });
    setTransactions(res.data);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await axios.put(`http://localhost:5000/api/v1/transactions/${editId}`, formData, {
        headers: { Authorization: token },
      });
    } else {
      await axios.post('http://localhost:5000/api/v1/transactions', formData, {
        headers: { Authorization: token },
      });
    }
    setFormData({ title: '', amount: '', category: '', type: 'expense' });
    setEditId(null);
    loadTransactions();
  };

  const handleEdit = (tx) => {
    setFormData(tx);
    setEditId(tx._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      await axios.delete(`http://localhost:5000/api/v1/transactions/${id}`, {
        headers: { Authorization: token },
      });
      loadTransactions();
    }
  };

  return (
    <div className="container mt-4">
      <h2>Dashboard</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-2">
          <div className="col">
            <input name="title" value={formData.title} onChange={handleChange} className="form-control" placeholder="Title" required />
          </div>
          <div className="col">
            <input name="amount" value={formData.amount} onChange={handleChange} type="number" className="form-control" placeholder="Amount" required />
          </div>
          <div className="col">
            <input name="category" value={formData.category} onChange={handleChange} className="form-control" placeholder="Category" required />
          </div>
          <div className="col">
            <select name="type" value={formData.type} onChange={handleChange} className="form-control">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="col">
            <button className="btn btn-primary w-100">{editId ? 'Update' : 'Add'}</button>
          </div>
        </div>
      </form>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Title</th><th>Amount</th><th>Category</th><th>Type</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx._id}>
              <td>{tx.title}</td>
              <td>{tx.amount}</td>
              <td>{tx.category}</td>
              <td>{tx.type}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(tx)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(tx._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
