import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Users, CheckSquare, MessageCircle, UserPlus, Menu, X, Home, LogOut, BookOpen } from 'lucide-react';
import UserProfileSidebar from '../UserProfileSidebar';
import LogoHat from '../../assets/logo-hat.png';

const MentorNavbar = ({ userName = 'Mentor' }) => {
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
    { label: 'Home', href: '/mentor/dashboard', icon: Home, color: 'text-white' },
    { label: 'My Mentees', href: '/mentor/mentees', icon: Users, color: 'text-white' },
    { label: 'My Tasks', href: '/mentor/tasks', icon: CheckSquare, color: 'text-white' },
    { label: 'Messages', href: '/mentor/messages', icon: MessageCircle, color: 'text-white' },
    { label: 'Get Mentees', href: '/mentor/get-mentees', icon: UserPlus, color: 'text-white' },
    { label: 'Journal', href: '/mentor/journal', icon: BookOpen, color: 'text-white', badge: 'New' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 supports-backdrop-blur:bg-black/80 border-b border-[#121212] shadow-lg ${isScrolled ? 'bg-black/80 backdrop-blur-lg shadow-white/20' : 'bg-black shadow-white/10'}`} style={{
      backdropFilter: isScrolled ? 'blur(12px)' : 'none',
      WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none'
    }}>
      <div className="px-0">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo and Branding */}
          <Link to="/mentor/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity pl-4">
            <img
              src={LogoHat}
              alt="Ment2Be"
              className="h-8 w-8"
            />
          </Link>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center gap-3 flex-1 justify-start ml-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                    isActive 
                      ? 'text-white' 
                      : 'bg-gray-800/40 text-gray-300 hover:bg-gray-700/60 hover:text-white'
                  }`}
                  style={isActive ? { backgroundColor: '#2a2d32' } : {}}
                  title={item.label}
                >
                  <Icon 
                    size={18} 
                    className={item.color} 
                  />
                  <span className={`text-xs font-medium ${
                    isActive ? 'text-white' : 'text-gray-300'
                  }`}>
                    {item.label}
                  </span>
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
              {isMenuOpen ? <X size={20} className="text-red-400" /> : <Menu size={20} className="text-gray-400" />}
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
                  className={`w-full block px-3 py-2 rounded-lg transition-colors text-xs ${
                    location.pathname === item.href
                      ? 'text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-cyan-400'
                  }`}
                  style={location.pathname === item.href ? { backgroundColor: '#2a2d32' } : {}}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} className={item.color} />
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
