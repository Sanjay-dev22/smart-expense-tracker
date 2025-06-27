const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Apply CORS *before* any routes
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// ✅ Other middlewares
app.use(bodyParser.json());

// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Routes (CORS applies here now)
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/budget', require('./routes/budget')); // ⬅️ moved here

// ✅ Test Route
app.get('/', (req, res) => {
  res.send('API is running ✅');
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
