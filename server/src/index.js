const path = require('path');
const dotenv = require('dotenv');

// Load environment variables prior to loading internal modules
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const scanRoutes = require('./routes/scanRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { domainToASCII } = require('url');

const app = express();
const PORT = process.env.PORT || 5000;

// app.use(cors());
app.use(express.json());
// !allow cors for all domais 
app.use(cors({origin:"*"}));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date()
  });
});

// Mounting API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/admin', adminRoutes);

// Initialize DB and start listening
db.initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`🚀 Permanent QR Attendance API running on port ${PORT}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`===================================================`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database:', err.message);
    process.exit(1);
  });

