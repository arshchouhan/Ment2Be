import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Home, Compass, BookOpen, MessageCircle, Clock, ListChecks, Menu, X, LogOut, MessageSquare } from 'lucide-react';
import UserProfileSidebar from '../UserProfileSidebar';
import LogoHat from '../../assets/logo-hat.png';

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
    { label: 'Ask Questions', href: '/student/forum', icon: MessageSquare },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 supports-backdrop-blur:bg-black/80 border-b border-[#121212] shadow-lg ${isScrolled ? 'bg-black/80 backdrop-blur-lg shadow-white/30' : 'bg-black shadow-white/15'}`} style={{
      backdropFilter: isScrolled ? 'blur(12px)' : 'none',
      WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none'
    }}>
      <div className="px-0">
        <div className="flex items-center justify-between h-14">

          {/* Logo and Branding */}
          <Link to="/student/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity pl-4">
            <img src={LogoHat} alt="Ment2Be" className="h-8 w-8" />
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
                    className={isActive ? 'text-white' : 'text-gray-300'}
                  />
                  <span className={`text-xs font-medium ${
                    isActive ? 'text-white' : 'text-gray-300'
                  }`}>
                    {item.label}
                  </span>
                  
                  {/* Badge for New */}
                  {item.badge && (
                    <span className="ml-1 px-2 py-0.5 bg-gray-700 text-gray-200 text-xs rounded-full font-semibold">
                      {item.badge}
                    </span>
                  )}
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
