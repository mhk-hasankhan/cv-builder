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
<<<<<<< HEAD
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
=======
    CREATE TABLE IF NOT EXISTS cvs (
      id TEXT PRIMARY KEY,
>>>>>>> 1e0424acaade213ab31886d5ec68cede14bf7c9d
      title TEXT NOT NULL DEFAULT 'Untitled CV',
      template TEXT NOT NULL DEFAULT 'modern',
      color_theme TEXT NOT NULL DEFAULT '#2563eb',
      font_family TEXT NOT NULL DEFAULT 'inter',
      data TEXT NOT NULL DEFAULT '{}',
      section_order TEXT NOT NULL DEFAULT '[]',
      enabled_sections TEXT NOT NULL DEFAULT '[]',
      share_token TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
<<<<<<< HEAD
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
=======
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
>>>>>>> 1e0424acaade213ab31886d5ec68cede14bf7c9d
    );

    CREATE TABLE IF NOT EXISTS cover_letters (
      id TEXT PRIMARY KEY,
<<<<<<< HEAD
      user_id TEXT,
=======
>>>>>>> 1e0424acaade213ab31886d5ec68cede14bf7c9d
      title TEXT NOT NULL DEFAULT 'Untitled Cover Letter',
      cv_id TEXT,
      data TEXT NOT NULL DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
<<<<<<< HEAD
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
=======
>>>>>>> 1e0424acaade213ab31886d5ec68cede14bf7c9d
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

<<<<<<< HEAD
  // Migrate existing tables to add user_id if not present
  try { database.exec('ALTER TABLE cvs ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE'); } catch {}
  try { database.exec('ALTER TABLE cover_letters ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE'); } catch {}

=======
>>>>>>> 1e0424acaade213ab31886d5ec68cede14bf7c9d
  console.log('✅ Database initialized at', dbPath);
}

module.exports = { getDb, initialize };
