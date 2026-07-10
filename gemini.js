export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const GEMINI_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_KEY) {
    return res.status(500).json({ error: 'GEMINI_KEY not set in Vercel environment variables' });
  }
  const { prompt } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }
  try {
    let gemRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 400 }
        })
      }
    );
    if (!gemRes.ok) {
      gemRes = await fetch(
        'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + GEMINI_KEY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 400 }
          })
        }
      );
    }
    if (!gemRes.ok) {
      const errData = await gemRes.json().catch(function() { return {}; });
      return res.status(gemRes.status).json({ error: errData.error && errData.error.message ? errData.error.message : 'Gemini error ' + gemRes.status });
    }
    const data = await gemRes.json();
    const text = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] ? data.candidates[0].content.parts[0].text : '';
    return res.status(200).json({ text: text });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
