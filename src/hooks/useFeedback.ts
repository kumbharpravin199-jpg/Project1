import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Feedback, DashboardStats, Alert } from '../types';

export const useFeedback = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setFeedback(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: feedbackData, error } = await supabase
        .from('feedback')
        .select('sentiment, topic, created_at');

      if (error) throw error;

      const sentimentCounts = {
        positive: 0,
        negative: 0,
        neutral: 0
      };

      const topicCounts: Record<string, number> = {};
      const dailyActivity: Record<string, number> = {};

      feedbackData?.forEach(item => {
        // Count sentiments
        sentimentCounts[item.sentiment as keyof typeof sentimentCounts]++;
        
        // Count topics
        if (item.topic) {
          topicCounts[item.topic] = (topicCounts[item.topic] || 0) + 1;
        }
        
        // Count daily activity
        const date = new Date(item.created_at).toISOString().split('T')[0];
        dailyActivity[date] = (dailyActivity[date] || 0) + 1;
      });

      const topTopics = Object.entries(topicCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([topic, count]) => ({ topic, count }));

      const recentActivity = Object.entries(dailyActivity)
        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
        .slice(0, 7)
        .map(([date, count]) => ({ date, count }));

      setStats({
        total_feedback: feedbackData?.length || 0,
        sentiment_distribution: sentimentCounts,
        top_topics: topTopics,
        recent_activity: recentActivity
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          *,
          feedback (
            id,
            message,
            student_name,
            is_anonymous,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchFeedback(),
        fetchStats(),
        fetchAlerts()
      ]);
      setLoading(false);
    };

    loadData();

    // Set up real-time subscriptions
    const feedbackSubscription = supabase
      .channel('feedback_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'feedback'
      }, () => {
        fetchFeedback();
        fetchStats();
      })
      .subscribe();

    const alertsSubscription = supabase
      .channel('alerts_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'alerts'
      }, fetchAlerts)
      .subscribe();

    return () => {
      feedbackSubscription.unsubscribe();
      alertsSubscription.unsubscribe();
    };
  }, []);

  return {
    feedback,
    stats,
    alerts,
    loading,
    refetch: () => {
      fetchFeedback();
      fetchStats();
      fetchAlerts();
    }
  };
};