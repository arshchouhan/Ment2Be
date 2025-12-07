import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MentorNavbar from '../components/MentorDashboard/Navbar';
import { MentorshipChat } from '../components/Chat/MentorshipChat';

const MentorMessagesPage = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="h-screen bg-[#121212] overflow-hidden pt-14">
      <MentorNavbar userName={user?.name || 'Mentor'} />
      
      {/* Full-height chat interface */}
      <div className="h-[calc(100vh-64px)] overflow-hidden"> {/* Subtract navbar height */}
        <MentorshipChat />
      </div>
      
    </div>
  );
};

export default MentorMessagesPage;
