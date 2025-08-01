import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

function ExpenseLineChart({ expenses }) {
  // Prepare data by date
  const dailyData = expenses.reduce((acc, item) => {
    const date = new Date(item.createdAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date, amount: 0 };
    }
    acc[date].amount += Number(item.amount);
    return acc;
  }, {});

  const chartData = Object.values(dailyData).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <div style={{ height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ExpenseLineChart;