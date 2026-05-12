const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');
const { v4: uuidv4 } = require('uuid');
const requireAuth = require('../middleware/auth');

router.post('/generate/:id', requireAuth, (req, res) => {
  const db = getDb();
  const token = uuidv4();
  const result = db.prepare('UPDATE cvs SET share_token = ? WHERE id = ? AND user_id = ?')
    .run(token, req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'CV not found' });
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.json({ token, url: `${frontendUrl}/share/${token}` });
});

router.get('/:token', (req, res) => {
  const db = getDb();
  const cv = db.prepare('SELECT * FROM cvs WHERE share_token = ?').get(req.params.token);
  if (!cv) return res.status(404).json({ error: 'CV not found' });
  res.json({ ...cv, data: JSON.parse(cv.data), section_order: JSON.parse(cv.section_order), enabled_sections: JSON.parse(cv.enabled_sections) });
});

module.exports = router;
