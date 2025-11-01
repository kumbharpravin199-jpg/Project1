import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { FeedbackForm } from './components/FeedbackForm';
import { FeedbackDetail } from './components/FeedbackDetail';
import { MyFeedbacks } from './components/MyFeedbacks';
import { LoginForm } from './components/LoginForm';
import { StudentAuth } from './components/StudentAuth';
import { Dashboard } from './components/Dashboard';
import { Navbar } from './components/Navbar';
import { Button } from './components/ui/Button';
import { Toaster } from 'react-hot-toast';
import { Users, BarChart3 } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();
  const [viewMode, setViewMode] = useState<'student' | 'faculty'>('student');
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [showMyFeedbacks, setShowMyFeedbacks] = useState(false);

  // Determine if user is faculty based on user metadata or specific email domains
  // Faculty can be identified by:
  // 1. Having role='faculty' in user metadata
  // 2. Email containing specific faculty domain patterns
  const userRole = (user as any)?.user_metadata?.role;
  const isFaculty = userRole === 'faculty' || user?.email?.toLowerCase().includes('faculty') || user?.email?.toLowerCase().includes('admin');
  const isStudent = user && !isFaculty;

  // Check if there's a feedback ID in the URL
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/feedback\/([a-f0-9-]+)$/);
    if (match) {
      setFeedbackId(match[1]);
    }
  }, []);

  // Update URL when feedback ID changes
  useEffect(() => {
    if (feedbackId) {
      window.history.pushState({}, '', `/feedback/${feedbackId}`);
    } else if (window.location.pathname.startsWith('/feedback/')) {
      window.history.pushState({}, '', '/');
    }
  }, [feedbackId]);

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

  // If user is authenticated, check if they're viewing feedback detail
  if (user && feedbackId) {
    return (
      <>
        <Navbar />
        <FeedbackDetail feedbackId={feedbackId} onBack={() => setFeedbackId(null)} />
        <Toaster position="top-right" />
      </>
    );
  }

  // If user is authenticated and is faculty, show dashboard
  if (user && isFaculty) {
    return (
      <>
        <Navbar />
        <Dashboard />
        <Toaster position="top-right" />
      </>
    );
  }

  // If user is authenticated and is student, show feedback form or my feedbacks
  if (user && isStudent) {
    // Show My Feedbacks list
    if (showMyFeedbacks) {
      return (
        <>
          <Navbar />
          <MyFeedbacks 
            onBack={() => setShowMyFeedbacks(false)} 
            onViewDetail={(id) => {
              setFeedbackId(id);
              setShowMyFeedbacks(false);
            }}
          />
          <Toaster position="top-right" />
        </>
      );
    }

    // Show Feedback Form
    return (
      <>
        <Navbar />
        <FeedbackForm onViewMyFeedbacks={() => setShowMyFeedbacks(true)} />
        <Toaster position="top-right" />
      </>
    );
  }

  // Show landing page with view mode selection (not logged in)
  if (viewMode === 'student') {
    return (
      <>
        <Navbar />
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
        <StudentAuth onSuccess={() => {}} />
        <Toaster position="top-right" />
      </>
    );
  }

  // Show faculty login
  return (
    <>
      <Navbar />
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