import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ description: '', amount: '', category: '' });

  const API_URL = 'http://localhost:5000/api/expenses';

  // Fetch expenses from backend
  useEffect(() => {
    axios.get(API_URL)
      .then(res => setExpenses(res.data))
      .catch(err => console.error('Error fetching expenses:', err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.category) return;

    const newExpense = {
      ...form,
      amount: parseFloat(form.amount)
    };

    axios.post(API_URL, newExpense)
      .then(res => {
        setExpenses([res.data.expense, ...expenses]);
        setForm({ description: '', amount: '', category: '' });
      })
      .catch(err => console.error('Error adding expense:', err));
  };

  const handleDelete = (id) => {
  axios.delete(`${API_URL}/${id}`)
    .then(() => {
      setExpenses(prev => prev.filter(exp => exp._id !== id));
    })
    .catch(err => console.error('Error deleting expense:', err));
    alert('Expense deleted!');
};


  return (
    <div className="App">
      <h1>💸 Smart Expense Tracker</h1>

      <form onSubmit={handleSubmit}>
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} />
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select Category</option>
          <option>Food</option>
          <option>Rent</option>
          <option>Transport</option>
          <option>Shopping</option>
          <option>Others</option>
        </select>
        <button type="submit">Add Expense</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>₹ Amount</th>
            <th>Category</th>
            <th>🗑️</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp._id}>
              <td>{exp.description}</td>
              <td>{exp.amount}</td>
              <td>{exp.category}</td>
              <td><button onClick={() => handleDelete(exp._id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
