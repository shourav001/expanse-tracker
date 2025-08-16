import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaDollarSign, FaBell, FaSave, FaTimes } from 'react-icons/fa';
import './BudgetSettings.css';

const BudgetSettings = ({ isOpen, onClose }) => {
  const { user, updateBudget } = useAuth();
  const [formData, setFormData] = useState({
    monthlyBudget: user?.monthlyBudget || 0,
    budgetAlertThreshold: user?.budgetAlertThreshold || 80
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await updateBudget(
        parseFloat(formData.monthlyBudget),
        parseInt(formData.budgetAlertThreshold)
      );

      if (result.success) {
        setMessage('Budget settings updated successfully!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('An error occurred while updating budget settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content budget-modal">
        <span className="close" onClick={onClose}>&times;</span>
        
        <div className="budget-header">
          <h2>💰 Budget Settings</h2>
          <p>Set your monthly budget and alert preferences</p>
        </div>

        {message && (
          <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <FaDollarSign className="icon" />
              Monthly Budget
            </label>
            <input
              type="number"
              name="monthlyBudget"
              className="form-control"
              value={formData.monthlyBudget}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="Enter your monthly budget"
              required
            />
            <small>Set to 0 to disable budget tracking</small>
          </div>

          <div className="form-group">
            <label>
              <FaBell className="icon" />
              Alert Threshold (%)
            </label>
            <input
              type="number"
              name="budgetAlertThreshold"
              className="form-control"
              value={formData.budgetAlertThreshold}
              onChange={handleInputChange}
              min="1"
              max="100"
              placeholder="80"
              required
            />
            <small>Get notified when you reach this percentage of your budget</small>
          </div>

          <div className="budget-preview">
            <h4>Preview</h4>
            <div className="preview-item">
              <span>Monthly Budget:</span>
              <span className="amount">
                ${parseFloat(formData.monthlyBudget).toLocaleString()}
              </span>
            </div>
            <div className="preview-item">
              <span>Alert at:</span>
              <span className="amount">
                ${(parseFloat(formData.monthlyBudget) * parseFloat(formData.budgetAlertThreshold) / 100).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-between">
            <button 
              type="button" 
              className="btn btn-danger"
              onClick={onClose}
            >
              <FaTimes /> Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              <FaSave /> {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetSettings; 