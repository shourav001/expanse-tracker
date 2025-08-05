import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: token }
        });
        setUser(userRes.data);

        const txRes = await axios.get('http://localhost:5000/api/transactions', {
          headers: { Authorization: token }
        });
        setTransactions(txRes.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load user or transactions');
      }
    };

    fetchData();
  }, [navigate, token]);

  if (!user) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container mt-5">
      <h2>Welcome, {user.username}!</h2>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>

      <hr />

      <h4>Your Transactions</h4>
      {error && <div className="alert alert-danger">{error}</div>}
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table className="table table-bordered table-striped mt-3">
          <thead className="table-dark">
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id}>
                <td>{tx.title}</td>
                <td>{tx.type}</td>
                <td>{tx.category}</td>
                <td>${tx.amount}</td>
                <td>{new Date(tx.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Home;
