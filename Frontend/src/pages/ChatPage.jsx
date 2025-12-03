import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/StudentDashboard/Navbar';
import { StudentChat } from '../components/StudentChat/StudentChat';

const ChatPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  return (
    <div className="min-h-screen bg-[#202327]">
      <Navbar userName={user?.name || 'Student'} />
      
      <div className="h-[calc(100vh-64px)]">
        <StudentChat />
      </div>
    </div>
  );
};

export default ChatPage;
