const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { getDb } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleSignIn = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Missing credential' });

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: google_id, email, name, picture } = ticket.getPayload();

    const db = getDb();
    let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(google_id);
    if (!user) {
      const id = uuidv4();
      db.prepare('INSERT INTO users (id, google_id, email, name, photo_url) VALUES (?, ?, ?, ?, ?)').run(id, google_id, email, name, picture);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, photo_url: user.photo_url },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, photo_url: user.photo_url } });
  } catch (e) {
    console.error('Auth error:', e);
    res.status(401).json({ error: 'Authentication failed' });
  }
};
