import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatDate, truncateText } from '../../lib/utils';
import type { Alert } from '../../types';
import { AlertTriangle, Bell, Shield } from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="danger">High</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium</Badge>;
      default:
        return <Badge variant="info">Low</Badge>;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <Bell className="w-5 h-5 text-yellow-500" />;
      default:
        return <Shield className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Active Alerts</span>
          {alerts.length > 0 && (
            <Badge variant="danger">{alerts.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-green-300 mx-auto mb-4" />
            <p className="text-gray-500">No active alerts</p>
            <p className="text-sm text-gray-400 mt-1">All feedback appears safe</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.slice(0, 10).map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex-shrink-0">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {alert.alert_type.replace(/[_-]/g, ' ')}
                    </p>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {formatDate(alert.created_at)}
                  </p>
                  {alert.feedback && (
                    <div className="bg-white p-3 rounded border text-sm">
                      <p className="text-gray-700">
                        {truncateText(alert.feedback.message, 150)}
                      </p>
                      {alert.feedback.student_name && !alert.feedback.is_anonymous && (
                        <p className="text-gray-500 mt-1 text-xs">
                          From: {alert.feedback.student_name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {alerts.length > 10 && (
              <div className="text-center py-2">
                <p className="text-sm text-gray-500">
                  And {alerts.length - 10} more alerts...
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};