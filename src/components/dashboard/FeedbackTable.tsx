import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate, truncateText, exportToCSV } from '../../lib/utils';
import type { Feedback } from '../../types';
import { Download, Eye, Search, Filter } from 'lucide-react';
import { Input } from '../ui/Input';

interface FeedbackTableProps {
  feedback: Feedback[];
}

export const FeedbackTable: React.FC<FeedbackTableProps> = ({ feedback }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.student_name && item.student_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = sentimentFilter === 'all' || item.sentiment === sentimentFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleExport = () => {
    const exportData = filteredFeedback.map(item => ({
      Date: formatDate(item.created_at),
      Student: item.is_anonymous ? 'Anonymous' : (item.student_name || 'Anonymous'),
      Topic: item.topic,
      Sentiment: item.sentiment,
      Message: item.message,
      Suggestions: item.suggestions
    }));
    
    exportToCSV(exportData, `feedback-export-${new Date().toISOString().split('T')[0]}.csv`);
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
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle>Recent Feedback</CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={filteredFeedback.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFeedback.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No feedback matches your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Topic</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Sentiment</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Message</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedback.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {item.is_anonymous ? (
                          <Badge variant="default">Anonymous</Badge>
                        ) : (
                          item.student_name || 'N/A'
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {item.topic}
                      </td>
                      <td className="py-3 px-4">
                        {getSentimentBadge(item.sentiment)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 max-w-xs">
                        {truncateText(item.message, 100)}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFeedback(item)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Feedback Details</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(selectedFeedback.created_at)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFeedback(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Student</h4>
                  {selectedFeedback.is_anonymous ? (
                    <Badge variant="default">Anonymous</Badge>
                  ) : (
                    <p className="text-gray-900">{selectedFeedback.student_name || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Topic & Sentiment</h4>
                  <div className="flex space-x-2">
                    <Badge variant="info">{selectedFeedback.topic}</Badge>
                    {getSentimentBadge(selectedFeedback.sentiment)}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Message</h4>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                    {selectedFeedback.message}
                  </p>
                </div>

                {selectedFeedback.suggestions && (
                  <div>
                    <h4 className="font-medium mb-2">AI Suggestions</h4>
                    <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">
                      {selectedFeedback.suggestions}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};