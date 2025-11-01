import React from 'react';
import { useFeedback } from '../hooks/useFeedback';
import { signOut } from '../lib/supabase';
import { Button } from './ui/Button';
import { StatsCards } from './dashboard/StatsCards';
import { ChartsSection } from './dashboard/ChartsSection';
import { FeedbackTable } from './dashboard/FeedbackTable';
import { AlertsPanel } from './dashboard/AlertsPanel';
import toast from 'react-hot-toast';
import { BarChart3, LogOut, RefreshCw } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { feedback, stats, alerts, loading, refetch } = useFeedback();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Data refreshed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Faculty Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Student Feedback Analytics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:space-x-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex-1 sm:flex-none"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Cards */}
          <StatsCards stats={stats} alertCount={alerts.length} />

          {/* Charts */}
          <ChartsSection stats={stats} />

          {/* Alerts and Feedback Table */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-1">
              <AlertsPanel alerts={alerts} />
            </div>
            <div className="xl:col-span-2">
              <FeedbackTable feedback={feedback} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};