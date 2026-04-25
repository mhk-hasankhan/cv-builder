const { getDb } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

const DEFAULT_DATA = {
  recipientName: '',
  recipientTitle: '',
  companyName: '',
  companyAddress: '',
  date: new Date().toISOString().split('T')[0],
  subject: '',
  salutation: 'Dear Hiring Manager,',
  body: '',
  closing: 'Sincerely,',
  senderName: '',
  senderEmail: '',
  senderPhone: ''
};

function parseCL(row) {
  return { ...row, data: JSON.parse(row.data) };
}

exports.list = (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT id, title, cv_id, created_at, updated_at FROM cover_letters WHERE user_id = ? ORDER BY updated_at DESC').all(req.user.id);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getOne = (req, res) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM cover_letters WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ error: 'Cover letter not found' });
    res.json(parseCL(row));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.create = (req, res) => {
  try {
    const db = getDb();
    const id = uuidv4();
    const { title = 'Untitled Cover Letter', cv_id = null } = req.body;
    db.prepare('INSERT INTO cover_letters (id, user_id, title, cv_id, data) VALUES (?, ?, ?, ?, ?)').run(id, req.user.id, title, cv_id, JSON.stringify(DEFAULT_DATA));
    const row = db.prepare('SELECT * FROM cover_letters WHERE id = ?').get(id);
    res.status(201).json(parseCL(row));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.update = (req, res) => {
  try {
    const db = getDb();
    const { title, cv_id, data } = req.body;
    const existing = db.prepare('SELECT * FROM cover_letters WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Cover letter not found' });
    db.prepare(`
      UPDATE cover_letters SET
        title = COALESCE(?, title),
        cv_id = COALESCE(?, cv_id),
        data = COALESCE(?, data)
      WHERE id = ? AND user_id = ?
    `).run(title || null, cv_id || null, data ? JSON.stringify(data) : null, req.params.id, req.user.id);
    const row = db.prepare('SELECT * FROM cover_letters WHERE id = ?').get(req.params.id);
    res.json(parseCL(row));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.remove = (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM cover_letters WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
