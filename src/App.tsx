import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { FeedbackForm } from './components/FeedbackForm';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { Button } from './components/ui/Button';
import { Toaster } from 'react-hot-toast';
import { Users, BarChart3 } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();
  const [viewMode, setViewMode] = useState<'student' | 'faculty'>('student');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show dashboard
  if (user) {
    return (
      <>
        <Dashboard />
        <Toaster position="top-right" />
      </>
    );
  }

  // Show landing page with view mode selection
  if (viewMode === 'student') {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            onClick={() => setViewMode('faculty')}
            className="bg-white shadow-lg"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Faculty Login
          </Button>
        </div>
        <FeedbackForm />
        <Toaster position="top-right" />
      </>
    );
  }

  // Show faculty login
  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          onClick={() => setViewMode('student')}
          className="bg-white shadow-lg"
        >
          <Users className="w-4 h-4 mr-2" />
          Student View
        </Button>
      </div>
      <LoginForm onSuccess={() => setViewMode('student')} />
      <Toaster position="top-right" />
    </>
  );
}

export default App;