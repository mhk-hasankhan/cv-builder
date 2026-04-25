require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({
  origin: ['http://localhost:5173', 'https://cv-builder-co.netlify.app'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(uploadsDir));

// Initialize DB
const db = require('./database/db');
db.initialize();

// Routes
app.use('/api/auth', require('./routes/auth')); // REQUIRED for login
app.use('/api/cvs', require('./routes/cvs'));
app.use('/api/cover-letters', require('./routes/coverLetters'));
app.use('/api/export', require('./routes/export'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/share', require('./routes/share'));

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

app.listen(PORT, () => {
  console.log(`✅ CV Builder API running on http://localhost:${PORT}`);
});