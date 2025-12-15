require('dotenv').config();
const compression = require('compression');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const app = express();

// Middleware
app.use(cors());
app.use(compression());
app.use(morgan('dev'));

// Body Parsers - Essential for req.body to work
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Fixed: 'extends' changed to 'extended'

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};
// Connect to DB
connectDB();

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

// Ensure './v1' exists in your project structure
app.use('/api', require('./v1'));

// handling errors
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  return res.status(status).json({
    status: 'error',
    code: status,
    // Note: This logic hides the stack if DEV is true.
    // Usually you want: process.env.DEV ? error.stack : null
    stack: !process.env.DEV && error.stack,
    message: error.message || 'Internal Server Error',
  });
});

// Start the server locally
if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Export the app (Vercel) and the handler (Netlify)
module.exports = app;
module.exports.handler = serverless(app);
