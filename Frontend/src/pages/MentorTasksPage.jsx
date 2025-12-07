import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MentorNavbar from '../components/MentorDashboard/Navbar';
import { StatsCards } from '../components/TaskDashboard/StatsCards';
import { MenteesSidebar } from '../components/TaskDashboard/MenteesSidebar';
import { TasksSection } from '../components/TaskDashboard/TasksSection';
import { CreateTaskForm } from '../components/TaskDashboard/CreateTaskForm';

const MentorTasksPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const [selectedMentee, setSelectedMentee] = useState(null);
  
  // Check if we're in create mode
  const isCreateMode = searchParams.get('action') === 'create';

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleCreateTask = () => {
    navigate('/mentor/tasks?action=create');
  };

  if (isCreateMode) {
    return (
      <div className="min-h-screen bg-[#202327] pt-14">
        <MentorNavbar userName={user?.name || 'Mentor'} />
        <CreateTaskForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#202327] pt-14">
      <MentorNavbar userName={user?.name || 'Mentor'} />
      
      <main className="mx-auto px-6 sm:px-8 lg:px-12 py-6">
        <StatsCards />

        <div className="mt-6 flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/4">
            <MenteesSidebar selectedMentee={selectedMentee} onSelectMentee={setSelectedMentee} />
          </div>
          <div className="w-full lg:w-3/4">
            <TasksSection selectedMentee={selectedMentee} onCreateTask={handleCreateTask} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MentorTasksPage;
