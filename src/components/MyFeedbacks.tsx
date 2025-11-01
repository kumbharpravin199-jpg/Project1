import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Feedback } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import toast from 'react-hot-toast';
import { MessageSquare, Eye, Clock, CheckCircle, ArrowLeft, Inbox } from 'lucide-react';
import { formatDate } from '../lib/utils';

interface MyFeedbacksProps {
  onBack: () => void;
  onViewDetail: (feedbackId: string) => void;
}

export const MyFeedbacks: React.FC<MyFeedbacksProps> = ({ onBack, onViewDetail }) => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadFeedbacks = async () => {
      try {
        const { data, error } = await supabase
          .from('feedback')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setFeedbacks(data || []);
      } catch (error) {
        console.error('Error loading feedbacks:', error);
        toast.error('Failed to load your feedbacks');
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedbacks();
  }, [user]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'danger';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your feedbacks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto mt-8">
        <Button onClick={onBack} variant="outline" className="mb-4 bg-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Submit Feedback
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Inbox className="w-6 h-6 mr-2" />
              My Feedback History
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              View all your submitted feedback (both anonymous and named) and responses from faculty
            </p>
          </CardHeader>
          <CardContent>
            {feedbacks.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No feedback submitted yet</p>
                <p className="text-sm text-gray-400">
                  Your feedback submissions will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {feedback.is_anonymous && (
                            <Badge variant="default">Anonymous</Badge>
                          )}
                          <Badge variant={getSentimentColor(feedback.sentiment) as any}>
                            {feedback.sentiment}
                          </Badge>
                          {feedback.topic && (
                            <Badge variant="info">{feedback.topic}</Badge>
                          )}
                          {feedback.viewed_at ? (
                            <Badge variant="success">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Viewed by Faculty
                            </Badge>
                          ) : (
                            <Badge variant="warning">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending Review
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          Submitted on {formatDate(feedback.created_at)}
                        </p>
                        <p className="text-gray-900 line-clamp-2">
                          {feedback.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => onViewDetail(feedback.id)}
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details & Messages
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {feedbacks.length > 0 && (
          <div className="mt-4 p-4 bg-white/50 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Click "View Details & Messages" to see if faculty has responded to your feedback and chat with them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
