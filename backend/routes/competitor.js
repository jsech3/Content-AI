import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

// POST /api/competitor/analyze - AI-powered analysis of a video's performance
router.post('/analyze', async (req, res) => {
  try {
    const { title, description, channel, metrics } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a YouTube analytics expert. Analyze this video and provide actionable insights.

Return valid JSON:
{
  "strengths": ["list of what the video does well"],
  "opportunities": ["list of improvements"],
  "performanceFactors": [
    { "factor": "name", "impact": "high|medium|low", "description": "explanation" }
  ],
  "seoAnalysis": {
    "score": number (0-100),
    "titleOptimization": ["tips"],
    "descriptionOptimization": ["tips"],
    "tagRecommendations": ["suggested tags"],
    "optimizedTitle": "AI-suggested improved title",
    "optimizedDescription": "AI-suggested improved description"
  },
  "keywordSuggestions": ["relevant", "keywords"]
}`
        },
        {
          role: 'user',
          content: `Title: ${title}\nChannel: ${channel || 'Unknown'}\nDescription: ${description || 'None'}\nViews: ${metrics?.views || 'Unknown'}\nLikes: ${metrics?.likes || 'Unknown'}\nComments: ${metrics?.comments || 'Unknown'}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);
  } catch (error) {
    console.error('Competitor analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
