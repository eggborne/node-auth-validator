require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models'); // Sequelize instance
const schemaRoutes = require('./routes/schemaRoutes'); // Schema-related routes
const inventoryRoutes = require('./routes/inventoryRoutes'); // Inventory-related routes
const userRoutes = require('./routes/userRoutes'); // User-related routes

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies

// Test database connection
sequelize
  .authenticate()
  .then(() => console.log('Database connected successfully.'))
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1); // Exit if the database connection fails
  });

// Routes
app.use('/api/schema', schemaRoutes); // Schema routes
app.use('/api/inventory', inventoryRoutes); // Inventory routes
app.use('/api/users', userRoutes); // User routes

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
