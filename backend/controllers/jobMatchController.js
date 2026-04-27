const Groq = require('groq-sdk');

let groqClient = null;

function getGroq() {
  if (!groqClient) {
    const G = Groq.default || Groq;
    groqClient = new G({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

async function analyzeMatch(req, res) {
  const { cvText, jobDescription } = req.body;

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
  "score": <integer 0-100>,
  "strengths": ["<specific match>", ...],
  "gaps": ["<specific missing skill or experience>", ...],
  "suggestions": ["<concrete actionable improvement>", ...]
}

Scoring guide: 80-100 = excellent, 60-79 = good, 40-59 = moderate, 0-39 = poor.
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
    res.json(result);
  } catch (err) {
    console.error('Job match error:', err.message);
    if (err.status === 429) {
      return res.status(429).json({ error: 'Rate limit hit — wait a moment and try again.' });
    }
    res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
}

module.exports = { analyzeMatch };
