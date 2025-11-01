export interface Feedback {
  id: string;
  message: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  topic: string;
  suggestions: string;
  is_anonymous: boolean;
  student_name: string | null;
  created_at: string;
}

export interface Alert {
  id: string;
  message_id: string;
  severity: 'low' | 'medium' | 'high';
  alert_type: string;
  created_at: string;
  feedback?: Feedback;
}

export interface DashboardStats {
  total_feedback: number;
  sentiment_distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  top_topics: Array<{
    topic: string;
    count: number;
  }>;
  recent_activity: Array<{
    date: string;
    count: number;
  }>;
}

export interface User {
  id: string;
  email: string;
  role: 'faculty' | 'student';
}

export interface GeminiAnalysis {
  topic: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  suggestions: string;
}