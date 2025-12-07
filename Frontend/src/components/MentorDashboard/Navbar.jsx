import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Users, CheckSquare, MessageCircle, UserPlus, Menu, X, Home, LogOut } from 'lucide-react';
import UserProfileSidebar from '../UserProfileSidebar';
import Logo from '../../assets/Logo.png';

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
    { label: 'Home', href: '/mentor/dashboard', icon: Home },
    { label: 'My Mentees', href: '/mentor/mentees', icon: Users },
    { label: 'My Tasks', href: '/mentor/tasks', icon: CheckSquare },
    { label: 'Messages', href: '/mentor/messages', icon: MessageCircle },
    { label: 'Get Mentees', href: '/mentor/get-mentees', icon: UserPlus },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 supports-backdrop-blur:bg-black/80 border-b border-[#121212] ${isScrolled ? 'bg-black/80 backdrop-blur-lg' : 'bg-black'}`} style={{
      backdropFilter: isScrolled ? 'blur(12px)' : 'none',
      WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo */}
          <Link to="/mentor/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
            <img src={Logo} alt="MentorLink Logo" className="h-8 w-auto brightness-0 invert" />
          </Link>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`p-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                    location.pathname === item.href 
                      ? 'bg-gray-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-cyan-400'
                  }`}
                  title={item.label}
                >
                  <Icon 
                    size={18} 
                    className={location.pathname === item.href ? 'text-white' : 'text-gray-300 hover:text-cyan-400'} 
                  />
                  <span className={`text-xs font-medium ${
                    location.pathname === item.href ? 'text-white' : 'text-gray-300 hover:text-cyan-400'
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
                  className={`w-full block px-3 py-2 rounded-lg transition-colors text-xs ${
                    location.pathname === item.href
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-cyan-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} className={location.pathname === item.href ? 'text-white' : 'text-gray-300'} />
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
