const express = require('express');
const { defineDynamicModel } = require('../models/dynamicModel');
const router = express.Router();

// Validate user
router.post('/validate', async (req, res) => {
  const { uid, displayName, email, photoURL, accessToken } = req.body;

  if (!uid || !accessToken) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const User = await defineDynamicModel('users'); // 'users' table is predefined
    const [user, created] = await User.upsert({
      uid,
      displayName,
      email,
      photoURL,
      accessToken,
    });

    res.status(200).json({
      message: 'User created or updated successfully',
      user,
      created,
    });
  } catch (error) {
    console.error('Error validating user:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Fetch user
router.post('/get', async (req, res) => {
  const { uid, accessToken } = req.body;

  if (!uid || !accessToken) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const User = await defineDynamicModel('users');
    const user = await User.findByPk(uid);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

module.exports = router;
