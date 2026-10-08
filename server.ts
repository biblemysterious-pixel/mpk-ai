import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'MPK AI',
    tagline: 'Your AI. Your World.',
    model: 'gemini-3.8-flash',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Chat endpoint supporting Server-Sent Events (SSE) streaming
app.post('/api/chat', async (req, res) => {
  console.log('[MPK AI Server] Received /api/chat request');
  const { messages, languagePreference } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Valid messages array is required.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please check your environment configuration.',
    });
    return;
  }

  // System instruction for MPK AI
  let systemInstruction = `You are MPK AI, a premier intelligent AI assistant whose mission and core philosophy is "Your AI. Your World."
You are built to assist users with thoughtful analysis, coding, problem-solving, writing, creative ideation, learning, and daily productivity.

Core Guidelines:
- Identity: You are MPK AI. Never identify as "Bible AI" or any other assistant.
- Multilingual Natural Adaptability:
  * If the user asks in Hindi, answer naturally in Hindi (or Hinglish if they use Latin script).
  * If the user asks in Hinglish (mix of Hindi and English written in Latin script), respond in natural, friendly Hinglish.
  * If the user asks in English, respond in clear, fluent English.
  * Seamlessly match the linguistic tone and nuances of the user.
- Clarity & Structure: Use clean Markdown formatting with clear headings, bullet points, numbered steps, bold text for key insights, and tables when presenting structured information.
- Code Blocks: For code, always use triple backticks with the language identifier (e.g., \`\`\`typescript, \`\`\`python, \`\`\`html) and include helpful inline comments.
- Helpful & Direct: Be concise when appropriate, and deep/thorough when asked for comprehensive explanations or deep dives.`;

  if (languagePreference === 'hi') {
    systemInstruction += '\n[Language Override: The user has selected Hindi preference. Provide your response in natural Hindi.]';
  } else if (languagePreference === 'hinglish') {
    systemInstruction += '\n[Language Override: The user has selected Hinglish preference. Provide your response in conversational Hinglish (Hindi-English mix in Latin script).]';
  } else if (languagePreference === 'en') {
    systemInstruction += '\n[Language Override: The user has selected English preference. Provide your response in English.]';
  }

  // Format messages for the Gemini API
  const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const msg of messages) {
    if (!msg || typeof msg.content !== 'string' || !msg.content.trim()) continue;
    const role: 'user' | 'model' = msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user';
    formattedContents.push({
      role,
      parts: [{ text: msg.content.trim() }],
    });
  }

  if (formattedContents.length === 0) {
    res.status(400).json({ error: 'No valid message content provided.' });
    return;
  }

  // Ensure first message is user
  if (formattedContents[0].role !== 'user') {
    formattedContents.shift();
  }

  // Setup Server-Sent Events headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  let isAborted = false;
  res.on('close', () => {
    if (!res.writableEnded) {
      isAborted = true;
    }
  });

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Candidate models: gemini-3.1-flash-lite is high-speed and responsive, with gemini-3.8-flash as alternative
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let streamSuccess = false;
  let lastErrorMessage = '';

  for (const model of candidateModels) {
    if (isAborted) break;

    try {
      const responseStream = await ai.models.generateContentStream({
        model,
        contents: formattedContents,
        config: {
          systemInstruction,
        },
      });

      for await (const chunk of responseStream) {
        if (isAborted) break;
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
          if (typeof (res as unknown as { flush?: () => void }).flush === 'function') {
            (res as unknown as { flush: () => void }).flush();
          }
        }
      }

      streamSuccess = true;
      break;
    } catch (err: unknown) {
      let errMsg = err instanceof Error ? err.message : String(err);
      try {
        const parsed = JSON.parse(errMsg);
        if (parsed?.error?.message) {
          errMsg = parsed.error.message;
        }
      } catch {
        // use raw
      }

      console.warn(`Attempt with ${model} failed: ${errMsg}. Trying fallback if available.`);
      lastErrorMessage = errMsg;
    }
  }

  if (streamSuccess && !isAborted) {
    res.write('data: [DONE]\n\n');
    res.end();
  } else if (!isAborted) {
    let cleanMessage = lastErrorMessage || 'Unable to generate response at this moment.';
    if (cleanMessage.includes('high demand') || cleanMessage.includes('503')) {
      cleanMessage = 'The AI service is currently experiencing temporary high demand. Please try sending your message again in a moment.';
    }
    res.write(`data: ${JSON.stringify({ error: cleanMessage })}\n\n`);
    res.end();
  }
});

// Mount Vite in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MPK AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start MPK AI server:', err);
  process.exit(1);
});
