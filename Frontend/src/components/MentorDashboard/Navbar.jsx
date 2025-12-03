import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, CheckSquare, MessageCircle, UserPlus, Menu, X, Home, LogOut } from 'lucide-react';
import UserProfileSidebar from '../UserProfileSidebar';

const MentorNavbar = ({ userName = 'Mentor' }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { label: 'Home', href: '/mentor/dashboard', icon: Home },
    { label: 'My Mentees', href: '/mentor/mentees', icon: Users },
    { label: 'My Tasks', href: '/mentor/tasks', icon: CheckSquare },
    { label: 'Messages', href: '/mentor/messages', icon: MessageCircle },
    { label: 'Get Mentees', href: '/mentor/get-mentees', icon: UserPlus },
  ];

  return (
    <nav className="bg-[#121212] border-b border-gray-700 rounded-b-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo */}
          <Link to="/mentor/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">U</span>
            </div>
            <span className="text-lg font-bold text-white">UpLoom</span>
          </Link>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className="p-1.5 rounded-lg hover:bg-gray-700 flex items-center gap-1.5 transition-colors"
                  title={item.label}
                >
                  <Icon size={18} className="text-gray-300 hover:text-cyan-400" />
                  <span className="text-xs font-medium text-gray-300 hover:text-cyan-400">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side - User Profile Sidebar */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <UserProfileSidebar userName={userName} />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-3 space-y-1 border-t border-gray-200">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};

export default MentorNavbar;
