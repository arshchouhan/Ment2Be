import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/StudentDashboard/Navbar';

const StudentTaskPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-[#000000]">
      <Navbar userName={user?.name || 'Student'} />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">My Tasks</h1>
        </div>
        
        <div className="bg-[#121212] rounded-lg shadow-sm border border-gray-700 p-8 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Coming Soon</h2>
          <p className="text-gray-400">
            We're working hard to bring you an amazing task management experience.
            Check back soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentTaskPage;
