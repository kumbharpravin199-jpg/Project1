import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import type { DashboardStats } from '../../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartsSectionProps {
  stats: DashboardStats | null;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const sentimentData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [
          stats.sentiment_distribution.positive,
          stats.sentiment_distribution.neutral,
          stats.sentiment_distribution.negative
        ],
        backgroundColor: [
          '#10B981', // green-500
          '#6B7280', // gray-500
          '#EF4444'  // red-500
        ],
        borderWidth: 0,
      }
    ]
  };

  const topicsData = {
    labels: stats.top_topics.map(t => t.topic),
    datasets: [
      {
        label: 'Feedback Count',
        data: stats.top_topics.map(t => t.count),
        backgroundColor: '#3B82F6', // blue-500
        borderRadius: 4,
      }
    ]
  };

  const activityData = {
    labels: stats.recent_activity.map(a => {
      const date = new Date(a.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }).reverse(),
    datasets: [
      {
        label: 'Daily Feedback',
        data: stats.recent_activity.map(a => a.count).reverse(),
        borderColor: '#06B6D4', // cyan-500
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    indexAxis: 'y' as const,
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Doughnut data={sentimentData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar data={topicsData} options={barOptions} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={activityData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};