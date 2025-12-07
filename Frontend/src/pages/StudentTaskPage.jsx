import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Zap, Award, CheckCircle2, Trophy, Clock, Flame, TrendingUp, RefreshCw, Plus, Target, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/StudentDashboard/Navbar';
import { TaskCard } from '../components/StudentTasks/TaskCard';
import { fetchStudentTasks } from '../services/studentTasksApi';

const StudentTaskPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      
      if (!user._id) {
        setError('User ID not found');
        setLoading(false);
        return;
      }

      const data = await fetchStudentTasks(user._id);
      setTasks(data.tasks || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message || 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = (updatedTask) => {
    // Update the task in the local state
    setTasks(prevTasks =>
      prevTasks.map(task =>
        (task._id === updatedTask._id || task.id === updatedTask.id)
          ? updatedTask
          : task
      )
    );
  };

  // Filter tasks based on active filter
  const getFilteredTasks = () => {
    if (activeFilter === 'all') {
      return tasks;
    }
    return tasks.filter(task => task.status === activeFilter);
  };

  const filteredTasks = getFilteredTasks();

  // Get task counts by status
  const getTaskCount = (status) => {
    if (status === 'all') {
      return tasks.length;
    }
    return tasks.filter(task => task.status === status).length;
  };

  // Calculate stats
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
  const notStartedTasks = tasks.filter((t) => t.status === 'not-started');
  const pendingReviewTasks = tasks.filter((t) => t.status === 'pending-review');

  const totalPoints = tasks.reduce((acc, t) => acc + (t.points || 0), 0);
  const earnedPoints = completedTasks.reduce((acc, t) => acc + (t.points || 0), 0);
  const progressPercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const streak = 7; // Mock streak

  // Stats Card Component
  const StatsCard = ({ title, value, subtitle, icon: Icon, iconColor, iconBg }) => (
    <div className="overflow-hidden rounded-lg border border-gray-800 bg-[#121212]">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-white">{value}</span>
              <span className="text-sm text-gray-400">{subtitle}</span>
            </div>
          </div>
          <div className={`p-2.5 rounded-lg ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </div>
    </div>
  );

  // Empty State Component
  const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="text-center py-12 bg-[#121212] rounded-lg border border-dashed border-gray-700">
      <Icon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );

  // Scrollable Section Component
  const ScrollableSection = ({ tasks, title, icon: Icon, color, emptyIcon, emptyTitle, emptyDescription }) => {
    const scrollRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(tasks.length > 3);

    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    const scroll = (direction) => {
      if (scrollRef.current) {
        const scrollAmount = 400;
        scrollRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth'
        });
      }
    };

    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Icon className={`h-5 w-5 ${color}`} />
          <h2 className="text-lg font-semibold text-white">
            {title}
            <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 text-xs font-medium">
              {tasks.length}
            </span>
          </h2>
        </div>
        {tasks.length > 0 ? (
          <div className="relative group">
            {/* Left Arrow */}
            {showLeftArrow && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-800/80 hover:bg-gray-700 rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
            )}

            {/* Scrollable Container */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
              style={{ scrollBehavior: 'smooth' }}
            >
              {tasks.map((task) => (
                <div key={task._id || task.id} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3">
                  <TaskCard task={task} onTaskUpdate={handleTaskUpdate} />
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            {showRightArrow && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-800/80 hover:bg-gray-700 rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
            )}
          </div>
        ) : (
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
          />
        )}
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-[#000000] text-gray-100 overflow-x-hidden pt-14">
      <Navbar userName={user?.name || 'Student'} />
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Tasks</h1>
            <p className="text-sm text-gray-400">Track your progress and earn points</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Points"
            value={earnedPoints}
            subtitle={`/ ${totalPoints} points`}
            icon={Trophy}
            iconColor="text-amber-500"
            iconBg="bg-amber-50"
          />
          <StatsCard
            title="Completed"
            value={completedTasks.length}
            subtitle={`of ${tasks.length} tasks`}
            icon={CheckCircle2}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-50"
          />
          <StatsCard
            title="In Progress"
            value={inProgressTasks.length}
            subtitle="tasks active"
            icon={Clock}
            iconColor="text-blue-500"
            iconBg="bg-blue-50"
          />
          <StatsCard
            title="Day Streak"
            value={streak}
            subtitle="days in a row"
            icon={Flame}
            iconColor="text-orange-500"
            iconBg="bg-orange-50"
          />
        </div>

        {/* Task Sections */}
        <div className="space-y-8">
          {/* Completed Tasks */}
          <ScrollableSection
            tasks={completedTasks}
            title="Completed"
            icon={CheckCircle2}
            color="text-emerald-500"
            emptyIcon={CheckCircle2}
            emptyTitle="No completed tasks yet"
            emptyDescription="Complete your tasks to see them here"
          />

          {/* In Progress Tasks */}
          <ScrollableSection
            tasks={inProgressTasks}
            title="In Progress"
            icon={Clock}
            color="text-blue-500"
            emptyIcon={Zap}
            emptyTitle="No tasks in progress"
            emptyDescription="Start a task to see it here"
          />

          {/* Pending Review Tasks */}
          <ScrollableSection
            tasks={pendingReviewTasks}
            title="Pending Review"
            icon={Award}
            color="text-yellow-500"
            emptyIcon={AlertCircle}
            emptyTitle="No tasks pending review"
            emptyDescription="Submit your tasks for mentor review"
          />

          {/* Not Started Tasks */}
          <ScrollableSection
            tasks={notStartedTasks}
            title="Not Started"
            icon={Target}
            color="text-gray-400"
            emptyIcon={FileText}
            emptyTitle="No tasks to start"
            emptyDescription="Your mentor will assign tasks here"
          />
        </div>
      </main>
    </div>
  );
};

export default StudentTaskPage;
