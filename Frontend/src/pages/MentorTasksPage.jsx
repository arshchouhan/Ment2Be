import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MentorNavbar from '../components/MentorDashboard/Navbar';
import { Header } from '../components/TaskDashboard/Header';
import { StatsCards } from '../components/TaskDashboard/StatsCards';
import { MenteesSidebar } from '../components/TaskDashboard/MenteesSidebar';
import { TasksSection } from '../components/TaskDashboard/TasksSection';
import { CreateTaskModal } from '../components/TaskDashboard/CreateTaskModal';

const MentorTasksPage = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#202327]">
      <MentorNavbar userName={user?.name || 'Mentor'} />
      
      <main className="mx-auto px-6 sm:px-8 lg:px-12 py-6">
        <StatsCards />

        <div className="mt-6 flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/4">
            <MenteesSidebar selectedMentee={selectedMentee} onSelectMentee={setSelectedMentee} />
          </div>
          <div className="w-full lg:w-3/4">
            <TasksSection selectedMentee={selectedMentee} />
          </div>
        </div>
      </main>

      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default MentorTasksPage;
