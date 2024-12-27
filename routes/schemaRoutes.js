const express = require('express');
const { MetadataModel } = require('../models/MetadataModel');
const router = express.Router();

// Fetch schema details for a specific table
router.post('/get', async (req, res) => {
  const { tableName } = req.body;

  if (!tableName) {
    return res.status(400).json({ error: 'Missing required field: tableName' });
  }

  try {
    const schema = await MetadataModel.findAll({
      where: { table_name: tableName },
      order: [['created_at', 'ASC']], // Optional: order by creation time
    });

    res.status(200).json(schema);
  } catch (error) {
    console.error('Error fetching table schema:', error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
