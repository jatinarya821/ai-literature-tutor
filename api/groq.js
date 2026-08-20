const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const DEFAULT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

const sendJson = (res, status, payload) => {
  res.status(status).json(payload);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: { message: 'Method not allowed' } });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    sendJson(res, 500, { error: { message: 'Groq API key not configured on server' } });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      sendJson(res, 400, { error: { message: 'Invalid JSON body' } });
      return;
    }
  }

  const { messages, systemPrompt, model, temperature, max_completion_tokens, max_tokens } = body || {};
  if (!Array.isArray(messages)) {
    sendJson(res, 400, { error: { message: 'messages must be an array' } });
    return;
  }

  const upstreamBody = {
    model: model || DEFAULT_MODEL,
    temperature: typeof temperature === 'number' ? temperature : 0.7,
    max_completion_tokens: typeof max_completion_tokens === 'number' ? max_completion_tokens : (typeof max_tokens === 'number' ? max_tokens : 2048),
    messages: [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...messages,
    ],
  };

  try {
    const upstreamResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(upstreamBody),
    });

    const text = await upstreamResponse.text();
    res.status(upstreamResponse.status);
    res.setHeader('Content-Type', 'application/json');
    res.send(text);
  } catch {
    sendJson(res, 502, { error: { message: 'Failed to reach Groq API' } });
  }
}
