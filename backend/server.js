// ============================================
// DEPENDENCIES
// ============================================
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ============================================
// M-PESA ROUTES (ADD THIS)
// ============================================
const mpesaRoutes = require('./routes/mpesa');
app.use('/api/mpesa', mpesaRoutes);

// ============================================
// YOUR EXISTING ROUTES
// ============================================
// Example: app.use('/api/auth', authRoutes);
// Example: app.get('/', (req, res) => { ... });

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📱 M-Pesa mock endpoint: http://localhost:${PORT}/api/mpesa/stkpush`);
});
