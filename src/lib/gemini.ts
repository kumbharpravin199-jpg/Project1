import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GeminiAnalysis } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!API_KEY) {
  console.warn('Gemini API key not configured. AI analysis will be simulated.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

const ANALYSIS_PROMPT = `Analyze this student feedback and return ONLY valid JSON with no additional text:

Feedback: "{{feedback_text}}"

Required JSON format:
{
  "topic": "brief topic category (max 50 chars)",
  "sentiment": "positive|negative|neutral",
  "suggestions": "2-3 actionable improvement suggestions (max 300 chars)"
}`;

const ALERT_KEYWORDS = [
  'harassment', 'discrimination', 'unsafe', 'bullying', 'threat', 
  'inappropriate', 'unfair treatment', 'racism', 'sexism', 'abuse'
];

export const analyzeFeedback = async (feedback: string): Promise<GeminiAnalysis> => {
  if (!API_KEY) {
    // Simulate AI analysis for demo purposes
    return simulateAnalysis(feedback);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = ANALYSIS_PROMPT.replace('{{feedback_text}}', feedback);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const analysis = JSON.parse(text.trim());
    
    // Validate response structure
    if (!analysis.topic || !analysis.sentiment || !analysis.suggestions) {
      throw new Error('Invalid analysis response format');
    }
    
    return {
      topic: analysis.topic.substring(0, 50),
      sentiment: ['positive', 'negative', 'neutral'].includes(analysis.sentiment) 
        ? analysis.sentiment 
        : 'neutral',
      suggestions: analysis.suggestions.substring(0, 300)
    };
    
  } catch (error) {
    console.error('Gemini API error:', error);
    return simulateAnalysis(feedback);
  }
};

const simulateAnalysis = (feedback: string): GeminiAnalysis => {
  const words = feedback.toLowerCase();
  
  // Simple sentiment analysis
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'like', 'helpful', 'clear'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'confusing', 'difficult', 'boring', 'poor'];
  
  const positiveCount = positiveWords.reduce((count, word) => 
    count + (words.includes(word) ? 1 : 0), 0);
  const negativeCount = negativeWords.reduce((count, word) => 
    count + (words.includes(word) ? 1 : 0), 0);
  
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (positiveCount > negativeCount) sentiment = 'positive';
  else if (negativeCount > positiveCount) sentiment = 'negative';
  
  // Simple topic extraction
  const topics = ['teaching', 'course content', 'assignments', 'facilities', 'support', 'general'];
  const topic = topics[Math.floor(Math.random() * topics.length)];
  
  // Generate suggestions based on sentiment
  const suggestions = sentiment === 'positive' 
    ? 'Continue current practices and consider expanding successful approaches.'
    : sentiment === 'negative'
    ? 'Review feedback areas and implement targeted improvements.'
    : 'Gather more specific feedback to identify improvement opportunities.';
  
  return { topic, sentiment, suggestions };
};

export const detectAlerts = (feedback: string): Array<{ type: string; severity: 'low' | 'medium' | 'high' }> => {
  const alerts = [];
  const lowerFeedback = feedback.toLowerCase();
  
  for (const keyword of ALERT_KEYWORDS) {
    if (lowerFeedback.includes(keyword)) {
      const severity = ['threat', 'abuse', 'harassment'].includes(keyword) ? 'high' : 'medium';
      alerts.push({
        type: keyword,
        severity
      });
    }
  }
  
  return alerts;
};