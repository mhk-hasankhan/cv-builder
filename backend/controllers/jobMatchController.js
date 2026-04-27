const Groq = require('groq-sdk');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/db');

let groqClient = null;

function getGroq() {
  if (!groqClient) {
    const G = Groq.default || Groq;
    groqClient = new G({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

async function analyzeMatch(req, res) {
  const { cvText, jobDescription, cvFilename } = req.body;

  if (!cvText?.trim() || !jobDescription?.trim()) {
    return res.status(400).json({ error: 'CV text and job description are required' });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured on the server' });
  }

  const cvSnippet = cvText.trim().slice(0, 6000);
  const jdSnippet = jobDescription.trim().slice(0, 3000);

  const prompt = `You are an expert recruiter and CV analyst. Evaluate how well this CV matches the job description.

CV:
${cvSnippet}

Job Description:
${jdSnippet}

Return ONLY valid JSON (no markdown, no code fences) with exactly this structure:
{
  "jobTitle": "<extract the job title from the description, e.g. 'Senior React Developer'>",
  "score": <integer 0-100>,
  "strengths": ["<specific match>", ...],
  "gaps": ["<specific missing skill or experience>", ...],
  "suggestions": ["<concrete actionable improvement>", ...]
}

Scoring: 80-100 = excellent, 60-79 = good, 40-59 = moderate, 0-39 = poor.
Provide 3-5 specific, non-generic items in each array.`;

  try {
    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty response from Groq');

    const result = JSON.parse(raw);

    if (
      typeof result.score !== 'number' ||
      !Array.isArray(result.strengths) ||
      !Array.isArray(result.gaps) ||
      !Array.isArray(result.suggestions)
    ) {
      throw new Error('Unexpected response shape from LLM');
    }

    result.score = Math.max(0, Math.min(100, Math.round(result.score)));
    result.jobTitle = result.jobTitle?.trim() || 'Job Match';

    // Auto-save to DB
    const id = uuidv4();
    const db = getDb();
    db.prepare(`
      INSERT INTO job_matches (id, user_id, job_title, job_description, cv_filename, score, strengths, gaps, suggestions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      req.user.id,
      result.jobTitle,
      jobDescription.trim(),
      cvFilename || null,
      result.score,
      JSON.stringify(result.strengths),
      JSON.stringify(result.gaps),
      JSON.stringify(result.suggestions)
    );

    res.json({ id, ...result });
  } catch (err) {
    console.error('Job match error:', err.message);
    if (err.status === 429) {
      return res.status(429).json({ error: 'Rate limit hit — wait a moment and try again.' });
    }
    res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
}

function listMatches(req, res) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, job_title, cv_filename, score, strengths, gaps, suggestions, job_description, created_at
    FROM job_matches
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `).all(req.user.id);

  const matches = rows.map(row => ({
    id: row.id,
    jobTitle: row.job_title,
    cvFilename: row.cv_filename,
    score: row.score,
    strengths: JSON.parse(row.strengths),
    gaps: JSON.parse(row.gaps),
    suggestions: JSON.parse(row.suggestions),
    jobDescription: row.job_description,
    createdAt: row.created_at,
  }));

  res.json(matches);
}

function deleteMatch(req, res) {
  const db = getDb();
  const { id } = req.params;
  const result = db.prepare(
    'DELETE FROM job_matches WHERE id = ? AND user_id = ?'
  ).run(id, req.user.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json({ success: true });
}

module.exports = { analyzeMatch, listMatches, deleteMatch };
