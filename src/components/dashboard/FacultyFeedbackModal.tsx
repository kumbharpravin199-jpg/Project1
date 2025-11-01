import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Feedback, Message } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import toast from 'react-hot-toast';
import { MessageSquare, Send, X, CheckCircle } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface FacultyFeedbackModalProps {
  feedback: Feedback;
  onClose: () => void;
}

export const FacultyFeedbackModal: React.FC<FacultyFeedbackModalProps> = ({ feedback, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!feedback.id) return;

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('feedback_id', feedback.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`feedback_${feedback.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `feedback_id=eq.${feedback.id}`
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
  }, [feedback.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMarkAsViewed = async () => {
    if (!user) return;
    
    setIsMarking(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .update({
          viewed_at: new Date().toISOString(),
          viewed_by: user.id
        })
        .eq('id', feedback.id);

      if (error) throw error;
      toast.success('Marked as viewed');
    } catch (error) {
      console.error('Error marking as viewed:', error);
      toast.error('Failed to mark as viewed');
    } finally {
      setIsMarking(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;

    setIsSending(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          feedback_id: feedback.id,
          sender_id: user.id,
          sender_type: 'faculty',
          message: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      toast.success('Message sent!');

      // Auto-mark as viewed when faculty responds
      if (!feedback.viewed_at) {
        await handleMarkAsViewed();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Badge variant="success">Positive</Badge>;
      case 'negative':
        return <Badge variant="danger">Negative</Badge>;
      default:
        return <Badge variant="default">Neutral</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Feedback Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Feedback Info */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Status:</span>
                    {feedback.viewed_at ? (
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Viewed
                      </Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </div>
                  {!feedback.viewed_at && (
                    <Button
                      size="sm"
                      onClick={handleMarkAsViewed}
                      disabled={isMarking}
                    >
                      Mark as Viewed
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date Submitted</p>
                    <p className="text-gray-900">{formatDate(feedback.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Student</p>
                    <p className="text-gray-900">
                      {feedback.is_anonymous ? (
                        <Badge variant="default">Anonymous</Badge>
                      ) : (
                        feedback.student_name || 'N/A'
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sentiment</p>
                    {getSentimentBadge(feedback.sentiment)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Topic</p>
                    <Badge variant="info">{feedback.topic}</Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Message</p>
                  <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                    {feedback.message}
                  </p>
                </div>

                {feedback.suggestions && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">AI Suggestions</p>
                    <p className="text-gray-900 whitespace-pre-wrap bg-blue-50 p-3 rounded-lg text-sm">
                      {feedback.suggestions}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages Section - Available for all feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                {feedback.is_anonymous ? 'Internal Notes' : 'Conversation with Student'}
              </CardTitle>
              {feedback.is_anonymous && (
                <p className="text-sm text-gray-500 mt-1">
                  These notes are for faculty reference only. The student cannot view them.
                </p>
              )}
            </CardHeader>
            <CardContent>
                {/* Messages List */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      {feedback.is_anonymous 
                        ? 'No notes yet. Add internal notes for faculty reference.'
                        : 'No messages yet. Start the conversation!'
                      }
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_type === 'faculty' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.sender_type === 'faculty'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-xs font-medium mb-1">
                            {msg.sender_type === 'faculty' ? 'You (Faculty)' : 'Student'}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender_type === 'faculty' ? 'text-blue-100' : 'text-gray-500'
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
                    placeholder={feedback.is_anonymous 
                      ? "Add internal notes (not visible to student)..."
                      : "Type your message to the student..."
                    }
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
                      {feedback.is_anonymous ? 'Add Note' : 'Send Message'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};
