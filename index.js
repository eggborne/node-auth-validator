require('dotenv').config();
console.log('Initial NODE_ENV:', process.env.NODE_ENV);
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const schemaRoutes = require('./routes/schemaRoutes');
const inventoryRoutes = require('./routes/InventoryRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Replace with your frontend URL
  methods: ['GET', 'POST', 'OPTIONS'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));
app.use(express.json()); // Parse JSON bodies

// Test database connection
sequelize
  .authenticate()
  .then(() => console.log('Database connected successfully.'))
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

// Routes
app.use('/api/schema', schemaRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});