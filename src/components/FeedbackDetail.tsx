import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Feedback, Message } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Badge } from './ui/Badge';
import toast from 'react-hot-toast';
import { MessageSquare, Send, CheckCircle, Clock, ArrowLeft } from 'lucide-react';

interface FeedbackDetailProps {
  feedbackId: string;
  onBack: () => void;
}

export const FeedbackDetail: React.FC<FeedbackDetailProps> = ({ feedbackId, onBack }) => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!feedbackId || !user) return;

    const loadFeedback = async () => {
      try {
        // Load feedback details
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback')
          .select('*')
          .eq('id', feedbackId)
          .single();

        if (feedbackError) throw feedbackError;

        // Check if user owns this feedback
        if (feedbackData.student_id !== user.id) {
          toast.error('You do not have permission to view this feedback');
          onBack();
          return;
        }

        setFeedback(feedbackData);

        // Load messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('feedback_id', feedbackId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;
        setMessages(messagesData || []);

      } catch (error) {
        console.error('Error loading feedback:', error);
        toast.error('Failed to load feedback details');
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedback();

    // Subscribe to new messages
    const channel = supabase
      .channel(`feedback_${feedbackId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `feedback_id=eq.${feedbackId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [feedbackId, user, onBack]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;

    setIsSending(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          feedback_id: feedbackId,
          sender_id: user.id,
          sender_type: 'student',
          message: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback details...</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">Feedback not found</p>
            <Button onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto mt-8">
        <Button onClick={onBack} variant="outline" className="mb-4 bg-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Feedback Status */}
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Feedback</CardTitle>
              <div className="flex items-center gap-2">
                {feedback.is_anonymous && (
                  <Badge variant="default">Anonymous</Badge>
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Submitted on</p>
                <p className="text-gray-900">
                  {new Date(feedback.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Your Message</p>
                <p className="text-gray-900 whitespace-pre-wrap">{feedback.message}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-gray-500">Sentiment</p>
                  <Badge variant={
                    feedback.sentiment === 'positive' ? 'success' :
                    feedback.sentiment === 'negative' ? 'danger' :
                    'default'
                  }>
                    {feedback.sentiment}
                  </Badge>
                </div>
                {feedback.topic && (
                  <div>
                    <p className="text-sm text-gray-500">Topic</p>
                    <Badge variant="info">{feedback.topic}</Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              {feedback.is_anonymous ? 'Faculty Notes & Replies' : 'Conversation with Faculty'}
            </CardTitle>
            {feedback.is_anonymous && (
              <p className="text-sm text-gray-500 mt-1">
                Your identity is protected. Faculty can respond to your anonymous feedback here.
              </p>
            )}
          </CardHeader>
          <CardContent>
            {/* Messages List */}
            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No messages yet</p>
                  <p className="text-sm">Faculty will respond here if they have any questions</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === 'student' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender_type === 'student'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">
                        {msg.sender_type === 'student' ? 'You' : 'Faculty'}
                      </p>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender_type === 'student' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="space-y-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message to faculty..."
                className="min-h-[80px]"
                maxLength={2000}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {newMessage.length}/2000
                </span>
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  loading={isSending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
