require('dotenv').config();

// Crash server if essential environment variables are missing
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    console.error("FATAL ERROR: MONGODB_URI or JWT_SECRET is not defined in the .env file.");
    process.exit(1);
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const usersRoutes = require('./routes/users');
const problemsRoute = require('./routes/problems');

const app = express();

// Middleware
app.use(cors()); // Allow all origins for simplicity in development
app.use(express.json());
app.use(cookieParser());

// Add request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Database Connection
let isConnected = false;
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('✅ MongoDB connected');
    isConnected = true;
}).catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('⚠️  Please ensure MongoDB is running. Start it with: net start MongoDB (as Administrator)');
    isConnected = false;
});

// Check MongoDB connection status middleware
const checkDBConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ 
            message: 'Database connection unavailable. Please ensure MongoDB is running.',
            error: 'MongoDB not connected'
        });
    }
    next();
};

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Volunteer Management API Server',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      registrations: '/api/registrations',
      users: '/api/users',
      problems: '/api/problems'
    },
    frontend: 'http://localhost:3001'
  });
});

// Routes (with DB connection check)
app.use('/api/auth', checkDBConnection, authRoutes);
app.use('/api/events', checkDBConnection, eventRoutes);
app.use('/api/registrations', checkDBConnection, registrationRoutes);
app.use('/api/users', checkDBConnection, usersRoutes);
app.use('/api/problems', checkDBConnection, problemsRoute);


const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
