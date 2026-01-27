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
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMenuOpen(false);
  }, [location.pathname]);

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
      isScrolled 
        ? 'bg-black/95 backdrop-blur-xl border-gray-800/50 shadow-xl shadow-black/30' 
        : 'bg-black/90 backdrop-blur-md border-[#1a1a1a]'
    }`} style={{
      backdropFilter: isScrolled ? 'blur(16px)' : 'blur(12px)',
      WebkitBackdropFilter: isScrolled ? 'blur(16px)' : 'blur(12px)'
    }}>
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Branding */}
          <Link to="/mentor/dashboard" className="flex items-center gap-3 group hover:opacity-90 transition-all duration-200">
            <div className="relative">
              <img
                src={LogoHat}
                alt="Ment2Be"
                className="h-9 w-9 transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-white/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="hidden sm:block text-white text-lg font-bold tracking-tight">Ment2Be</span>
          </Link>

          {/* Desktop Navigation Items */}
          <div className="hidden lg:flex items-center gap-2 flex-1 justify-start ml-8">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`px-4 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-200 group relative ${
                    isActive 
                      ? 'text-white bg-gradient-to-r from-gray-800 to-gray-700 shadow-lg shadow-black/30' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                  }`}
                  title={item.label}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl"></div>
                  )}
                  <Icon 
                    size={19} 
                    className={`relative z-10 transition-all duration-200 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`}
                  />
                  <span className={`relative z-10 text-sm font-semibold transition-all duration-200 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`}>
                    {item.label}
                  </span>
                  
                  {/* Badge for New */}
                  {item.badge && (
                    <span className="relative z-10 ml-1 px-2.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs rounded-full font-bold shadow-lg">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side - User Profile Sidebar */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <UserProfileSidebar userName={userName} />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
            >
              {isMenuOpen ? <X size={22} className="text-red-400" /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 pt-3 space-y-2 border-t border-gray-800/50 bg-black/95 backdrop-blur-xl">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-lg'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
                  <span className="font-semibold text-sm flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            
            {/* Mobile User Profile */}
            <div className="sm:hidden pt-3 border-t border-gray-800/50 mt-3">
              <UserProfileSidebar userName={userName} />
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-900/80 to-red-800/80 hover:from-red-800 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default MentorNavbar;
