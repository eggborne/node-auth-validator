require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();

const serviceAccountPath = process.env.FIREBASE_CREDENTIALS_PATH;
if (!serviceAccountPath) {
  throw new Error('FIREBASE_CREDENTIALS_PATH not defined in .env');
}

admin.initializeApp({
  credential: admin.credential.cert(require(path.resolve(serviceAccountPath))),
});

app.use(cors({
  origin: '*',
  methods: ['POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(bodyParser.json());

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

const { sequelize } = require('./models'); // Import Sequelize instance
sequelize
  .authenticate()
  .then(() => console.log('Database connected successfully.'))
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1); // Exit the app if the database connection fails
  });

const validateFirebaseToken = async (req, res, next) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'Missing accessToken' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(accessToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token validation failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// app.post('/api/users/validate', validateFirebaseToken, async (req, res) => {
//   const { uid, displayName, email, photoURL, accessToken } = req.body;

//   if (!uid || !accessToken) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   try {
//     const connection = await mysql.createConnection({
//       ...dbConfig,
//       namedPlaceholders: true,
//     });

//     const query = `
//       INSERT INTO users (uid, displayName, email, photoURL, accessToken)
//       VALUES (:uid, :displayName, :email, :photoURL, :accessToken)
//       ON DUPLICATE KEY UPDATE 
//         accessToken = VALUES(accessToken),
//         updated_at = CURRENT_TIMESTAMP;
//     `;

//     await connection.execute(query, { uid, displayName, email, photoURL, accessToken });

//     const [rows] = await connection.execute(
//       `SELECT authorizations FROM users WHERE uid = :uid`,
//       { uid }
//     );

//     await connection.end();

//     let authorizations = null;
//     if (rows.length > 0 && rows[0].authorizations) {
//       try {
//         authorizations = JSON.parse(rows[0].authorizations);
//       } catch (err) {
//         console.warn('Failed to parse authorizations JSON:', err);
//         authorizations = rows[0].authorizations; // Return as is if parsing fails
//       }
//     }

//     return res.status(200).json({
//       message: 'User created or updated successfully',
//       uid,
//       displayName,
//       email,
//       photoURL,
//       authorizations
//     });
//   } catch (error) {
//     console.error('Database error:', error);
//     return res.status(500).json({ error: 'Database operation failed' });
//   }
// });

const { User } = require('./models');

app.post('/api/users/validate', validateFirebaseToken, async (req, res) => {
  const { uid, displayName, email, photoURL, accessToken } = req.body;

  try {
    const [user] = await User.upsert({
      uid,
      displayName,
      email,
      photoURL,
      accessToken,
    });

    return res.status(200).json({ message: 'User created or updated successfully', user });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database operation failed' });
  }
});


app.post('/api/users/get', validateFirebaseToken, async (req, res) => {
  const { uid, accessToken } = req.body;

  if (!uid || !accessToken) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const connection = await mysql.createConnection({
      ...dbConfig,
      namedPlaceholders: true,
    });

    const query = `
      SELECT uid, displayName, email, photoURL, authorizations, preferences 
      FROM users 
      WHERE uid = :uid
    `;

    const [rows] = await connection.execute(query, { uid });

    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    let user = rows[0];
    if (user.authorizations) {
      try {
        user.authorizations = JSON.parse(user.authorizations);
      } catch (err) {
        console.warn('Failed to parse authorizations JSON:', err);
      }
    }
    if (user.preferences) {
      try {
        user.preferences = JSON.parse(user.preferences);
      } catch (err) {
        console.warn('Failed to parse preferences JSON:', err);
      }
    }

    return res.status(200).json(user);

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database operation failed' });
  }
});

app.post('/api/users/update', validateFirebaseToken, async (req, res) => {
  const { uid, accessToken, prop, newValue } = req.body;
  if (!uid || !accessToken || !prop || !newValue) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const connection = await mysql.createConnection({
      ...dbConfig,
    });

    const query = `
      UPDATE users 
      SET ${mysql.escapeId(prop)} = ? 
      WHERE uid = ?
    `;

    const parsedValue = typeof newValue === 'object' ? JSON.stringify(newValue) : newValue;

    await connection.execute(query, [parsedValue, uid]);

    await connection.end();

    return res.status(200).json({ message: 'User updated successfully' });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database operation failed' });
  }
});

app.post('/api/inventory/get', validateFirebaseToken, async (req, res) => {
  const { inventoryName, uid, accessToken } = req.body;

  if (!inventoryName || !uid || !accessToken) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const connection = await mysql.createConnection({
      ...dbConfig,
      namedPlaceholders: true,
    });

    const query = `SELECT * FROM ${inventoryName}`;

    const [rows] = await connection.execute(query, { uid });
    await connection.end();
    return res.status(200).json(rows);

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database operation failed' });
  }
});

app.post('/api/inventory/create', validateFirebaseToken, async (req, res) => {
  const { inventoryName, uid, accessToken, item } = req.body;

  if (!inventoryName || !uid || !accessToken || !item) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  for (const key in item) {
    if (item[key] === undefined) {
      console.log('Changing undefined value at key:', key, 'to null');
      item[key] = null;
    }
  }

  try {
    const connection = await mysql.createConnection({
      ...dbConfig,
      namedPlaceholders: true,
    });

    const placeholders = Object.keys(item)
      .map(key => `\`${key}\` = :${key}`)
      .join(', ');
    const query = `INSERT INTO \`${inventoryName}\` SET ${placeholders}`;

    await connection.execute(query, item);
    await connection.end();

    return res.status(200).json({ message: 'Item added successfully' });

  } catch (error) {
    console.log('error?', error);
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database operation failed' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});