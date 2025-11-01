import React, { useState } from 'react';
import { signIn, signUpFaculty } from '../lib/supabase';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';

interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up as faculty
        await signUpFaculty(email, password);
        toast.success('Faculty account created! Please check your email to verify.');
        setIsSignUp(false);
      } else {
        // Sign in
        await signIn(email, password);
        toast.success('Signed in successfully');
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mx-auto mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <CardTitle>Faculty {isSignUp ? 'Sign Up' : 'Login'}</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            {isSignUp ? 'Create a faculty account' : 'Access the feedback dashboard'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="faculty@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button 
              type="submit" 
              className="w-full" 
              loading={isLoading}
            >
              {isSignUp ? 'Create Faculty Account' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isSignUp ? 'Already have an account? Login' : 'Need a faculty account? Sign up'}
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-gray-500">
              Faculty members can view all feedback and analytics
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};