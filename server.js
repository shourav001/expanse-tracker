const path = require('path')
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/connectDb');
const userRoutes = require('./routes/userRoute');
const transactionRoutes = require('./routes/transactionRoute');


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/transactions', transactionRoutes);

// === Serve Frontend (after APIs) ===
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

