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
      
      {/* Task Dashboard Header */}
      <div className="bg-[#121212] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-white">Task Management</h1>
              <p className="text-sm text-gray-400">Manage and track mentee assignments</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Task
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
