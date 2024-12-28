const express = require('express');
const { defineDynamicModel } = require('../models/dynamicModel');
const { tokenValidationMiddleware } = require('../middleware/tokenValidation');
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
      message: 'User created / updated successfully',
      user,
      created,
    });
  } catch (error) {
    console.error('Error validating user:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

// Fetch user
router.post('/get', tokenValidationMiddleware, async (req, res) => {
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

router.post('/update', async (req, res) => {
  const { uid, accessToken, prop, newValue } = req.body;
  if (!uid || !accessToken || !prop || !newValue) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const User = await defineDynamicModel('users');
    const user = await User.findByPk(uid);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const parsedValue = typeof newValue === 'object' ? JSON.stringify(newValue) : newValue;


    user[prop] = parsedValue;
    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Database operation failed' });
  }
});

module.exports = router;
