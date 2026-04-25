const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname);
const dbPath = path.join(dbDir, 'cvbuilder.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initialize() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      google_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      photo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cvs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL DEFAULT 'Untitled CV',
      template TEXT NOT NULL DEFAULT 'modern',
      color_theme TEXT NOT NULL DEFAULT '#2563eb',
      font_family TEXT NOT NULL DEFAULT 'inter',
      data TEXT NOT NULL DEFAULT '{}',
      section_order TEXT NOT NULL DEFAULT '[]',
      enabled_sections TEXT NOT NULL DEFAULT '[]',
      share_token TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cover_letters (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL DEFAULT 'Untitled Cover Letter',
      cv_id TEXT,
      data TEXT NOT NULL DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (cv_id) REFERENCES cvs(id) ON DELETE SET NULL
    );

    CREATE TRIGGER IF NOT EXISTS update_cv_timestamp
    AFTER UPDATE ON cvs
    BEGIN
      UPDATE cvs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_cl_timestamp
    AFTER UPDATE ON cover_letters
    BEGIN
      UPDATE cover_letters SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);

  // Safe migrations (ignore if already exists)
  try {
    database.exec('ALTER TABLE cvs ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE');
  } catch {}

  try {
    database.exec('ALTER TABLE cover_letters ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE');
  } catch {}

  console.log('✅ Database initialized at', dbPath);
}

module.exports = { getDb, initialize };