import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, HelpCircle, X } from 'lucide-react';

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
    { label: 'Profile', icon: User, action: () => { setIsOpen(false); navigate(`/student/profile`); } },
    { label: 'Settings', icon: Settings, action: () => { setIsOpen(false); } },
    { label: 'Help', icon: HelpCircle, action: () => { setIsOpen(false); } },
  ];

  return (
    <>
      {/* User Name Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-medium text-gray-300 hover:text-cyan-400 transition-colors cursor-pointer"
      >
        {userName}
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
        className={`fixed top-0 right-0 h-screen w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500">{user?.email || 'email@example.com'}</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-6 py-3">
          <span className="inline-block px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded-full capitalize">
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
                className="w-full text-left px-6 py-3 flex items-center gap-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Icon size={18} className="text-gray-600" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full text-left px-6 py-3 flex items-center gap-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );
};

export default UserProfileSidebar;
