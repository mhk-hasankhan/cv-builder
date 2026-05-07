const { getDb } = require('../database/db');
const { v4: uuidv4 } = require('uuid');
const { DEFAULT_DATA, DEFAULT_SECTIONS } = require('../../shared/cvDefaults.json');

function parseCV(row) {
  return {
    ...row,
    data: JSON.parse(row.data),
    section_order: JSON.parse(row.section_order),
    enabled_sections: JSON.parse(row.enabled_sections)
  };
}

exports.list = (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT id, title, template, color_theme, font_family, created_at, updated_at
      FROM cvs
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `).all(req.user.id);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getOne = (req, res) => {
  try {
    const db = getDb();
    const row = db
      .prepare('SELECT * FROM cvs WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!row) return res.status(404).json({ error: 'CV not found' });
    res.json(parseCV(row));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.create = (req, res) => {
  try {
    const db = getDb();
    const id = uuidv4();
    const {
      title = 'Untitled CV',
      template = 'modern',
      color_theme = '#2563eb',
      font_family = 'inter'
    } = req.body;

    db.prepare(`
      INSERT INTO cvs (id, user_id, title, template, color_theme, font_family, data, section_order, enabled_sections)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      req.user.id,
      title,
      template,
      color_theme,
      font_family,
      JSON.stringify(DEFAULT_DATA),
      JSON.stringify(DEFAULT_SECTIONS),
      JSON.stringify(DEFAULT_SECTIONS)
    );

    const row = db.prepare('SELECT * FROM cvs WHERE id = ?').get(id);
    res.status(201).json(parseCV(row));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.update = (req, res) => {
  try {
    const db = getDb();
    const { title, template, color_theme, font_family, data, section_order, enabled_sections } = req.body;

    const existing = db
      .prepare('SELECT * FROM cvs WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!existing) return res.status(404).json({ error: 'CV not found' });

    db.prepare(`
      UPDATE cvs SET
        title = COALESCE(?, title),
        template = COALESCE(?, template),
        color_theme = COALESCE(?, color_theme),
        font_family = COALESCE(?, font_family),
        data = COALESCE(?, data),
        section_order = COALESCE(?, section_order),
        enabled_sections = COALESCE(?, enabled_sections)
      WHERE id = ? AND user_id = ?
    `).run(
      title || null,
      template || null,
      color_theme || null,
      font_family || null,
      data ? JSON.stringify(data) : null,
      section_order ? JSON.stringify(section_order) : null,
      enabled_sections ? JSON.stringify(enabled_sections) : null,
      req.params.id,
      req.user.id
    );

    const row = db.prepare('SELECT * FROM cvs WHERE id = ?').get(req.params.id);
    res.json(parseCV(row));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.remove = (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM cvs WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.id);

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.duplicate = (req, res) => {
  try {
    const db = getDb();

    const original = db
      .prepare('SELECT * FROM cvs WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!original) return res.status(404).json({ error: 'CV not found' });

    const newId = uuidv4();

    db.prepare(`
      INSERT INTO cvs (id, user_id, title, template, color_theme, font_family, data, section_order, enabled_sections)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      req.user.id,
      `${original.title} (Copy)`,
      original.template,
      original.color_theme,
      original.font_family,
      original.data,
      original.section_order,
      original.enabled_sections
    );

    const row = db.prepare('SELECT * FROM cvs WHERE id = ?').get(newId);
    res.status(201).json(parseCV(row));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};