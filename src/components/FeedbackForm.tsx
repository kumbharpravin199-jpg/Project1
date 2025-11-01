import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { analyzeFeedback, detectAlerts } from '../lib/gemini';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Input } from './ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import toast from 'react-hot-toast';
import { MessageSquare, User, UserX, Send } from 'lucide-react';

export const FeedbackForm: React.FC = () => {
  const [message, setMessage] = useState('');
  const [studentName, setStudentName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Insert feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .insert({
          message: message.trim(),
          sentiment: analysis.sentiment,
          topic: analysis.topic,
          suggestions: analysis.suggestions,
          is_anonymous: isAnonymous,
          student_name: isAnonymous ? null : studentName.trim() || null
        })
        .select()
        .single();

      if (feedbackError) throw feedbackError;

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
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 mt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Feedback</h1>
          <p className="text-gray-600">
            Share your thoughts and help us improve your learning experience
          </p>
        </div>

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
                    <Input
                      label="Your Name (Optional)"
                      placeholder="Enter your name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                    />
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
          </ul>
        </div>
      </div>
    </div>
  );
};