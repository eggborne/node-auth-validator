const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors'); // Import cors

const serviceAccount = require('./visionary-tools-firebase-adminsdk-z2eiz-06adf2629d.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

app.use(cors({
  origin: '*',
  methods: ['POST'],             // Allow POST requests
  allowedHeaders: ['Content-Type'], // Allow specific headers
}));

app.use(bodyParser.json());

app.post('/api/auth/verify-token', async (req, res) => {
  const { uid, idToken } = req.body;

  if (!uid || !idToken) {
    return res.status(400).json({ error: 'Missing uid or idToken' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (decodedToken.uid !== uid) {
      return res.status(401).json({ error: 'Invalid UID or token mismatch' });
    }

    return res.status(200).json({ valid: true, uid: decodedToken.uid });
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Auth validator running on http://localhost:${PORT}`);
});