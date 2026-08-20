import http from 'node:http';
import { URL } from 'node:url';

const PORT = Number(process.env.PORT) || 8787;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const ALLOWED_ORIGINS = (process.env.CLIENT_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const sendJson = (res, status, payload) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

const readJsonBody = (req) => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > 1_000_000) {
      reject(new Error('Payload too large'));
      req.destroy();
    }
  });
  req.on('end', () => {
    if (!body) {
      resolve({});
      return;
    }
    try {
      resolve(JSON.parse(body));
    } catch (error) {
      reject(error);
    }
  });
  req.on('error', reject);
});

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (origin && (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS.includes('*') ? '*' : origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', 'http://localhost');
  if (url.pathname !== '/api/groq') {
    sendJson(res, 404, { error: { message: 'Not found' } });
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: { message: 'Method not allowed' } });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    sendJson(res, 500, { error: { message: 'Groq API key not configured on server' } });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    sendJson(res, 400, { error: { message: 'Invalid JSON body' } });
    return;
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
    res.writeHead(upstreamResponse.status, { 'Content-Type': 'application/json' });
    res.end(text);
  } catch (error) {
    sendJson(res, 502, { error: { message: 'Failed to reach Groq API' } });
  }
});

server.listen(PORT, () => {
  console.log(`Groq proxy running on http://localhost:${PORT}`);
});
