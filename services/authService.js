const admin = require('firebase-admin');
const path = require('path');

// Firebase Admin SDK
const serviceAccountPath = process.env.FIREBASE_CREDENTIALS_PATH;
if (!serviceAccountPath) {
  throw new Error('FIREBASE_CREDENTIALS_PATH not defined in .env');
}
admin.initializeApp({
  credential: admin.credential.cert(require(path.resolve(serviceAccountPath))),
});

async function validateAccessToken(uid, token) {
  const decodedToken = await admin.auth().verifyIdToken(token);
  if (decodedToken.uid !== uid) {
    return false;
  } else {
    return decodedToken;
  }
}

module.exports = { validateAccessToken };
