import React from 'react';
import { GraduationCap } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GraduationCap className="w-8 h-8" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold">BSIET College Kolhapur</h1>
              <p className="text-xs md:text-sm text-blue-100">Student Feedback System</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
