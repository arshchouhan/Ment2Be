import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/StudentDashboard/Navbar';

const JournalPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  return (
    <div className="min-h-screen bg-[#000000] text-gray-100 overflow-x-hidden pt-14">
      <Navbar userName={user?.name || 'Student'} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Journal</h1>
        <div className="bg-[#121212] rounded-lg border border-gray-800 p-6">
          <p className="text-gray-400">Journal page content coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default JournalPage;
