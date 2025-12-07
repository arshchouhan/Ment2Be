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
    <div className="h-screen bg-[#202327] flex flex-col pt-14">
      <Navbar userName={user?.name || 'Student'} />
      
      <div className="flex-1 overflow-hidden">
        <StudentChat />
      </div>
    </div>
  );
};

export default ChatPage;
