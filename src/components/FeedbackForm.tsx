import React, { useState } from 'react';
import { supabase, signOut } from '../lib/supabase';
import { analyzeFeedback, detectAlerts } from '../lib/gemini';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Input } from './ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import toast from 'react-hot-toast';
import { User, UserX, Send, Eye, LogOut, History } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface FeedbackFormProps {
  onViewMyFeedbacks?: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ onViewMyFeedbacks }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [studentName, setStudentName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false); // Default to non-anonymous since user is logged in
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedFeedbackId, setSubmittedFeedbackId] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    if (message.length > 2000) {
      toast.error('Feedback must be less than 2000 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      // Analyze feedback with AI
      const analysis = await analyzeFeedback(message);
      const alerts = detectAlerts(message);

      // Insert feedback - Always include student_id when user is logged in
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .insert({
          message: message.trim(),
          sentiment: analysis.sentiment,
          topic: analysis.topic,
          suggestions: analysis.suggestions,
          is_anonymous: isAnonymous,
          student_name: isAnonymous ? null : studentName.trim() || null,
          student_id: user?.id || null
        })
        .select()
        .single();

      if (feedbackError) throw feedbackError;

      // Store feedback ID for viewing later
      if (feedbackData) {
        setSubmittedFeedbackId(feedbackData.id);
        localStorage.setItem(`feedback_${feedbackData.id}`, 'true');
      }

      // Insert alerts if any
      if (alerts.length > 0 && feedbackData) {
        const alertInserts = alerts.map(alert => ({
          message_id: feedbackData.id,
          severity: alert.severity,
          alert_type: alert.type
        }));

        const { error: alertError } = await supabase
          .from('alerts')
          .insert(alertInserts);

        if (alertError) {
          console.error('Error inserting alerts:', alertError);
        }
      }

      toast.success('Thank you for your feedback!');
      setMessage('');
      setStudentName('');
      setIsAnonymous(true);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const characterCount = message.length;
  const characterLimit = 2000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto mt-8">
        {/* User info, my feedbacks, and logout */}
        {user && (
          <div className="mb-4 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm">
              <span className="text-gray-600">Logged in as: </span>
              <span className="font-medium text-gray-900">{user.email}</span>
            </div>
            <div className="flex gap-2">
              {onViewMyFeedbacks && (
                <Button
                  onClick={onViewMyFeedbacks}
                  variant="outline"
                  size="sm"
                >
                  <History className="w-4 h-4 mr-2" />
                  My Feedbacks
                </Button>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}

        {/* Show "See Your Feedback" button if user submitted non-anonymous feedback */}
        {submittedFeedbackId && !isAnonymous && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 mb-3 font-medium">✓ Feedback submitted successfully!</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => {
                  window.location.pathname = `/feedback/${submittedFeedbackId}`;
                  window.location.reload();
                }}
                variant="outline"
                className="bg-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                View This Feedback
              </Button>
              {onViewMyFeedbacks && (
                <Button
                  onClick={onViewMyFeedbacks}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <History className="w-4 h-4 mr-2" />
                  View All My Feedbacks
                </Button>
              )}
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Submit Your Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Textarea
                  label="Your Feedback"
                  placeholder="Share your thoughts, suggestions, or concerns about the course, teaching methods, facilities, or any other aspect of your educational experience..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                  maxLength={characterLimit}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-sm ${characterCount > characterLimit * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
                    {characterCount}/{characterLimit} characters
                  </span>
                  {characterCount > characterLimit * 0.9 && (
                    <span className="text-sm text-red-500">
                      Approaching limit
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Submission Options</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(true)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                        isAnonymous
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <UserX className="w-5 h-5" />
                      <span>Anonymous</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(false)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                        !isAnonymous
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <User className="w-5 h-5" />
                      <span>Include Name</span>
                    </button>
                  </div>

                  {!isAnonymous && (
                    <div>
                      <Input
                        label="Your Name (Optional)"
                        placeholder="Enter your name"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                      />
                      {user && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ Logged in as {user.email}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  loading={isSubmitting}
                  disabled={!message.trim()}
                  className="w-full sm:w-auto"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-white/50 rounded-lg backdrop-blur-sm">
          <h3 className="font-medium text-gray-900 mb-2">How your feedback helps:</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Improve teaching methods and course content</li>
            <li>• Enhance campus facilities and resources</li>
            <li>• Address student concerns promptly</li>
            <li>• Create a better learning environment for everyone</li>
            {!isAnonymous && (
              <li className="text-blue-600 font-medium mt-2">• Track your feedback status and chat with faculty</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};