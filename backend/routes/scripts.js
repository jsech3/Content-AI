import { Router } from 'express';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

const router = Router();

const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

// POST /api/scripts/brainstorm - Analyze brainstorm notes and suggest script paths
router.post('/brainstorm', async (req, res) => {
  try {
    const { notes, topic } = req.body;
    if (!notes || !topic) {
      return res.status(400).json({ error: 'notes and topic are required' });
    }

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a YouTube content strategist. Analyze the user's brainstorm notes and suggest 3 different script approaches. For each approach, provide a title, description, predicted engagement score (0-100), and an outline with 5 sections. Each section should have a title, content description, and metrics (engagement, emotionalImpact, clarity — each 0-100).

Return valid JSON matching this schema:
{
  "suggestions": [
    {
      "title": "string",
      "description": "string",
      "predictedEngagement": number,
      "outline": {
        "title": "string",
        "sections": [
          {
            "title": "string",
            "content": "string",
            "metrics": { "engagement": number, "emotionalImpact": number, "clarity": number }
          }
        ]
      }
    }
  ]
}`
        },
        {
          role: 'user',
          content: `Topic: ${topic}\n\nBrainstorm Notes:\n${notes}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);
  } catch (error) {
    console.error('Brainstorm error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/scripts/generate - Generate a full script from an outline
router.post('/generate', async (req, res) => {
  try {
    const { topic, style, outline, toneLevel } = req.body;
    if (!topic || !outline) {
      return res.status(400).json({ error: 'topic and outline are required' });
    }

    const openai = getOpenAI();

    const toneDescription = toneLevel < 30 ? 'formal and professional'
      : toneLevel < 70 ? 'conversational and friendly'
      : 'casual and energetic';

    const styleDescriptions = {
      viral: 'MrBeast-style attention-grabbing with dramatic hooks and fast pacing',
      educational: 'Ali Abdaal-style structured breakdown with clear explanations',
      motivational: 'Inspirational storytelling with emotional hooks',
      podcast: 'Casual conversational tone, as if talking to a friend',
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional YouTube script writer. Write a complete video script based on the outline provided. The tone should be ${toneDescription}. ${style ? `Style: ${styleDescriptions[style] || style}.` : ''}

Include:
- A strong opening hook (first 10 seconds)
- Clear section transitions
- Engagement prompts (like/subscribe/comment reminders woven naturally)
- A compelling call to action at the end

Return valid JSON:
{
  "script": "the full script text",
  "metrics": {
    "engagement": number (0-100),
    "retention": number (0-100),
    "readability": number (0-100)
  },
  "keywords": ["suggested", "seo", "keywords"]
}`
        },
        {
          role: 'user',
          content: `Topic: ${topic}\n\nOutline:\n${JSON.stringify(outline, null, 2)}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Save to database
    const id = uuidv4();
    db.insertScript({
      id,
      topic,
      style: style || null,
      outline,
      content: result.script,
      metrics: result.metrics,
      keywords: result.keywords,
      status: 'generated',
    });

    res.json({ id, ...result });
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/scripts/improve - Improve an existing script
router.post('/improve', async (req, res) => {
  try {
    const { script, focus } = req.body;
    if (!script) {
      return res.status(400).json({ error: 'script is required' });
    }

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a script editor. Improve the given YouTube script by adding more engaging hooks, better examples, stronger transitions, and clearer calls to action. ${focus ? `Focus on improving: ${focus}` : ''}

Return valid JSON:
{
  "script": "the improved script",
  "metrics": {
    "engagement": number (0-100),
    "retention": number (0-100),
    "readability": number (0-100)
  },
  "changes": ["list of changes made"]
}`
        },
        { role: 'user', content: script }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);
  } catch (error) {
    console.error('Improve error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/scripts/improve-section - Improve a single section
router.post('/improve-section', async (req, res) => {
  try {
    const { section, context } = req.body;
    if (!section) {
      return res.status(400).json({ error: 'section is required' });
    }

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a script editor. Improve this section of a YouTube script outline by adding emotional hooks, clearer examples, and better engagement tactics.

Return valid JSON:
{
  "title": "section title",
  "content": "improved section content",
  "metrics": { "engagement": number, "emotionalImpact": number, "clarity": number }
}`
        },
        {
          role: 'user',
          content: `Section: ${section.title}\nContent: ${section.content}${context ? `\nOverall context: ${context}` : ''}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);
  } catch (error) {
    console.error('Improve section error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/scripts - List all saved scripts
router.get('/', (req, res) => {
  const scripts = db.getScripts();
  res.json(scripts.reverse());
});

// GET /api/scripts/:id - Get a single script
router.get('/:id', (req, res) => {
  const script = db.getScript(req.params.id);
  if (!script) return res.status(404).json({ error: 'Script not found' });
  res.json(script);
});

// PUT /api/scripts/:id - Update a script
router.put('/:id', (req, res) => {
  const { topic, style, content, status } = req.body;
  const updates = {};
  if (topic) updates.topic = topic;
  if (style) updates.style = style;
  if (content) updates.content = content;
  if (status) updates.status = status;

  const success = db.updateScript(req.params.id, updates);
  if (!success) return res.status(404).json({ error: 'Script not found' });
  res.json({ success: true });
});

// DELETE /api/scripts/:id - Delete a script
router.delete('/:id', (req, res) => {
  const success = db.deleteScript(req.params.id);
  if (!success) return res.status(404).json({ error: 'Script not found' });
  res.json({ success: true });
});

export default router;
