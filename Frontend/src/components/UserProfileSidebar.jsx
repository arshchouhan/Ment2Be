import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, HelpCircle, X, ChevronDown } from 'lucide-react';

const UserProfileSidebar = ({ userName = 'User' }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const menuItems = [
    { label: 'Profile', icon: User, action: () => { setIsOpen(false); navigate(`/student/profile`); }, color: 'text-white' },
    { label: 'Help', icon: HelpCircle, action: () => { setIsOpen(false); }, color: 'text-white' },
  ];

  return (
    <>
      {/* User Profile Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg border border-white/20 hover:bg-gray-700/50 hover:border-white/30 transition-colors flex items-center gap-1"
        title="Profile Menu"
      >
        <User size={18} className="text-white" />
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in Sidebar from Right */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-screen w-80 bg-[#121212] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-700 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-400">{user?.email || 'email@example.com'}</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-6 py-3">
          <span className="inline-block px-3 py-1 bg-gray-800/60 text-gray-200 text-xs font-medium rounded-full capitalize border border-gray-700/60">
            {user?.role || 'user'}
          </span>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full text-left px-6 py-3 flex items-center gap-3 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors"
              >
                <Icon size={18} className={item.color} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700"></div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full text-left px-6 py-3 flex items-center gap-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors font-medium"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );
};

export default UserProfileSidebar;
