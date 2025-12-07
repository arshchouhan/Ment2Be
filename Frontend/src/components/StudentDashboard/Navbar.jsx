import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Home, Compass, BookOpen, MessageCircle, Clock, ListChecks, Menu, X, LogOut } from 'lucide-react';
import UserProfileSidebar from '../UserProfileSidebar';

const Navbar = ({ userName = 'Student' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { label: 'Home', href: '/student/dashboard', icon: Home },
    { label: 'Explore', href: '/student/explore', icon: Compass },
    { label: 'Journal', href: '/student/journal', icon: BookOpen, badge: 'New' },
    { label: 'Messages', href: '/student/chat', icon: MessageCircle },
    { label: 'Bookings', href: '/student/sessions', icon: Clock },
    { label: 'My Tasks', href: '/student/tasks', icon: ListChecks },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 supports-backdrop-blur:bg-black/80 border-b border-[#121212] ${isScrolled ? 'bg-black/80 backdrop-blur-lg' : 'bg-black'}`} style={{
      backdropFilter: isScrolled ? 'blur(12px)' : 'none',
      WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/student/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center border border-gray-600">
              <span className="text-gray-200 font-bold text-xs">U</span>
            </div>
            <span className="text-lg font-bold text-white">UpLoom</span>
          </Link>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="relative group">
                  {item.href === '#' ? (
                    <button
                      className="p-1.5 rounded-lg hover:bg-gray-800 flex items-center gap-1.5 transition-colors relative"
                      title={item.label}
                    >
                      <Icon size={18} className="text-gray-400 group-hover:text-white" />
                      <span className="text-xs font-medium text-gray-300 group-hover:text-white">{item.label}</span>

                      {/* Badge for New */}
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 bg-gray-700 border border-gray-600 text-gray-200 text-xs px-1 py-0.5 rounded-full font-semibold text-xxs">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      className={`p-2 rounded-lg flex items-center gap-1.5 transition-colors relative ${
                        location.pathname === item.href 
                          ? 'bg-gray-800 text-white' 
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                      title={item.label}
                    >
                      <Icon size={18} className={location.pathname === item.href ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                      <span className={`text-xs font-medium ${location.pathname === item.href ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                        {item.label}
                      </span>

                      {/* Badge for New */}
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 bg-gray-700 border border-gray-600 text-gray-200 text-xs px-1 py-0.5 rounded-full font-semibold text-xxs">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </div>
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
              className="md:hidden p-1.5"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-3 space-y-1 border-t border-gray-700">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label}>
                  {item.href === '#' ? (
                    <button
                      className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                      <Icon size={16} />
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={16} />
                        {item.label}
                      </div>
                    </Link>
                  )}
                </div>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 bg-red-900 hover:bg-red-800 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm mt-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
