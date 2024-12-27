const express = require('express');
const { defineDynamicModel } = require('../models/dynamicModel');
const router = express.Router();

// Fetch inventory
router.post('/get', async (req, res) => {
  const { databaseName, uid, accessToken } = req.body;

  if (!databaseName || !uid || !accessToken) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const DynamicModel = await defineDynamicModel(databaseName);
    const rows = await DynamicModel.findAll();

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Add inventory
router.post('/create', async (req, res) => {
  const { databaseName, uid, accessToken, item } = req.body;

  if (!databaseName || !uid || !accessToken || !item) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const DynamicModel = await defineDynamicModel(databaseName);
    const newItem = await DynamicModel.create(item);

    res.status(200).json({ message: 'Item added successfully', item: newItem });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

module.exports = router;
