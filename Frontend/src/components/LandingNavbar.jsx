import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logoHat from "../assets/logo-hat.png";

const LandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showSocialsModal, setShowSocialsModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpenDropdown(null);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
      isScrolled 
        ? 'bg-[#0a0a0a]/98 backdrop-blur-xl border-gray-700/50 shadow-lg shadow-black/20' 
        : 'bg-[#0a0a0a]/95 backdrop-blur-md border-gray-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo - Left */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              state={{ fromNavbar: true }}
              className="flex items-center space-x-3 group"
            >
              <div className="relative">
                <img
                  src={logoHat}
                  alt="Ment2Be Logo"
                  className="w-8 h-8 md:w-9 md:h-9 brightness-0 invert transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-white/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="text-white text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Ment2Be</span>
            </Link>
          </div>

          {/* Navigation Links - Center */}
          <div className="hidden lg:flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
            {/* Features Dropdown */}
            <div className="relative group">
              <button
                className="px-4 py-2.5 text-gray-300 hover:text-white transition-all duration-200 flex items-center space-x-1.5 rounded-lg hover:bg-white/5 group"
              >
                <span className="font-medium">Features</span>
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-3 w-80 bg-[#1a1a1a]/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl shadow-black/50 p-3 space-y-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 -translate-y-2">
                {/* Personal Dashboard */}
                <button
                  onClick={() => scrollToSection("dashboard-section")}
                  className="w-full flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/70 transition-all duration-200 group/item text-left border border-transparent hover:border-gray-700/50"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="w-5 h-5 text-white transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-sm group-hover/item:text-gray-100 transition-colors">
                      Personal Dashboard
                    </h4>
                    <p className="text-gray-400 text-xs mt-1 group-hover/item:text-gray-300 transition-colors leading-relaxed">
                      Track your progress and manage your learning journey
                    </p>
                  </div>
                </button>

                {/* Connect with Mentors */}
                <button
                  onClick={() => scrollToSection("connect-mentors-section")}
                  className="w-full flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/70 transition-all duration-200 group/item text-left border border-transparent hover:border-gray-700/50"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="w-5 h-5 text-white transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-sm group-hover/item:text-gray-100 transition-colors">
                      Connect with Mentors
                    </h4>
                    <p className="text-gray-400 text-xs mt-1 group-hover/item:text-gray-300 transition-colors leading-relaxed">
                      Build meaningful connections with expert mentors
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Solutions Dropdown */}
            <div className="relative group">
              <button
                className="px-4 py-2.5 text-gray-300 hover:text-white transition-all duration-200 flex items-center space-x-1.5 rounded-lg hover:bg-white/5 group"
              >
                <span className="font-medium">Solutions</span>
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-3 w-72 bg-[#1a1a1a]/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl shadow-black/50 p-3 space-y-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 -translate-y-2">
                {/* For Students */}
                <Link
                  to="/solutions"
                  state={{ fromNavbar: true }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/70 transition-all duration-200 group/item border border-transparent hover:border-gray-700/50"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-sm group-hover/item:text-gray-100 transition-colors">
                      For Students
                    </h4>
                    <p className="text-gray-400 text-xs mt-1 group-hover/item:text-gray-300 transition-colors leading-relaxed">
                      Get personalized guidance and track progress
                    </p>
                  </div>
                </Link>

                {/* For Mentors */}
                <Link
                  to="/solutions"
                  state={{ fromNavbar: true }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/70 transition-all duration-200 group/item border border-transparent hover:border-gray-700/50"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-sm group-hover/item:text-gray-100 transition-colors">
                      For Mentors
                    </h4>
                    <p className="text-gray-400 text-xs mt-1 group-hover/item:text-gray-300 transition-colors leading-relaxed">
                      Share expertise and manage mentees
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("footer");
              }}
              className="px-4 py-2.5 text-gray-300 hover:text-white transition-all duration-200 font-medium rounded-lg hover:bg-white/5"
            >
              Our Socials
            </button>
            <Link
              to="/contact-us"
              state={{ fromNavbar: true }}
              className="px-4 py-2.5 text-gray-300 hover:text-white transition-all duration-200 font-medium rounded-lg hover:bg-white/5"
            >
              Contact Us
            </Link>
          </div>
          
          {/* Mobile Hamburger Menu Button */}
          <button
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
            <Link
              to="/login"
              className="px-5 py-2.5 text-gray-300 hover:text-white transition-all duration-200 font-medium rounded-lg hover:bg-white/5"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="px-6 py-2.5 bg-gradient-to-r from-white to-gray-100 text-black font-semibold rounded-lg hover:from-gray-100 hover:to-white transition-all duration-200 shadow-lg shadow-white/20 hover:shadow-white/30 hover:scale-105 flex items-center space-x-2"
            >
              <span>Get Started</span>
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-[#0a0a0a]/98 backdrop-blur-xl px-4 sm:px-6 pb-6 pt-4 space-y-6 border-t border-gray-800 animate-slideDown">
          {/* FEATURES SECTION */}
          <div className="space-y-3">
            <p className="text-white font-bold text-sm uppercase tracking-wider">Features</p>
            <div className="space-y-1 pl-2">
              <button
                onClick={() => {
                  scrollToSection("dashboard-section");
                  setIsOpen(false);
                }}
                className="block w-full text-left py-2.5 px-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
              >
                Personal Dashboard
              </button>

              <button
                onClick={() => {
                  scrollToSection("connect-mentors-section");
                  setIsOpen(false);
                }}
                className="block w-full text-left py-2.5 px-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
              >
                Connect with Mentors
              </button>
            </div>
          </div>

          {/* SOLUTIONS SECTION */}
          <div className="space-y-3">
            <p className="text-white font-bold text-sm uppercase tracking-wider">Solutions</p>
            <div className="space-y-1 pl-2">
              <Link
                to="/solutions"
                onClick={() => setIsOpen(false)}
                className="block py-2.5 px-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
              >
                For Students
              </Link>
              <Link
                to="/solutions"
                onClick={() => setIsOpen(false)}
                className="block py-2.5 px-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
              >
                For Mentors
              </Link>
            </div>
          </div>

          {/* OTHER LINKS */}
          <div className="space-y-1">
            <button
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("footer");
                setIsOpen(false);
              }}
              className="block w-full text-left py-2.5 px-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
            >
              Our Socials
            </button>

            <Link
              to="/contact-us"
              onClick={() => setIsOpen(false)}
              className="block py-2.5 px-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
            >
              Contact Us
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-gray-800">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block w-full py-3 px-4 text-center text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-200 font-medium"
            >
              Log in
            </Link>
            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="block w-full py-3 px-4 text-center bg-gradient-to-r from-white to-gray-100 text-black font-semibold rounded-lg hover:from-gray-100 hover:to-white transition-all duration-200 shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
