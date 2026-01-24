import React, { useState } from "react";
import { Link } from "react-router-dom";
import logoHat from "../assets/logo-hat.png";

const LandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showSocialsModal, setShowSocialsModal] = useState(false);

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link
            to="/"
            state={{ fromNavbar: true }}
            className="flex items-center space-x-2"
          >
            <img
              src={logoHat}
              alt="Ment2Be Logo"
              className="w-7 h-7 md:w-8 md:h-8 brightness-0 invert"
            />

            <span className="text-white text-xl font-semibold">Ment2Be</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Features Dropdown */}
            <div className="relative group">
              <Link
                to="/"
                state={{ fromNavbar: true }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
              >
                <span>Features</span>
                <svg
                  className="w-4 h-4"
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
              </Link>
              <div className="absolute top-full left-0 mt-2 w-80 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-xl p-4 space-y-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {/* Personal Dashboard */}
                <button
                  onClick={() => scrollToSection("dashboard-section")}
                  className="w-full flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group text-left"
                >
                  <div className="flex-shrink-0 mt-1">
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
                    <h4 className="text-white font-semibold text-sm">
                      Personal Dashboard
                    </h4>
                    <p className="text-gray-400 text-xs mt-1">
                      Track your progress and manage your learning journey
                    </p>
                  </div>
                </button>

                {/* Connect with Mentors */}
                <button
                  onClick={() => scrollToSection("connect-mentors-section")}
                  className="w-full flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group text-left"
                >
                  <div className="flex-shrink-0 mt-1">
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
                    <h4 className="text-white font-semibold text-sm">
                      Connect with Mentors
                    </h4>
                    <p className="text-gray-400 text-xs mt-1">
                      Build meaningful connections with expert mentors
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Solutions Dropdown */}
            <div className="relative group">
              <Link
                to="/solutions"
                state={{ fromNavbar: true }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
              >
                <span>Solutions</span>
                <svg
                  className="w-4 h-4"
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
              </Link>
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-xl p-4 space-y-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {/* For Students */}
                <Link
                  to="/solutions"
                  state={{ fromNavbar: true }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="flex-shrink-0 mt-1">
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
                    <h4 className="text-white font-semibold text-sm">
                      For Students
                    </h4>
                    <p className="text-gray-400 text-xs mt-1">
                      Get personalized guidance and track progress
                    </p>
                  </div>
                </Link>

                {/* For Mentors */}
                <Link
                  to="/solutions"
                  state={{ fromNavbar: true }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="flex-shrink-0 mt-1">
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
                    <h4 className="text-white font-semibold text-sm">
                      For Mentors
                    </h4>
                    <p className="text-gray-400 text-xs mt-1">
                      Share expertise and manage mentees
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("footer");
              }}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Our Socials
            </a>
            <Link
              to="/contact-us"
              state={{ fromNavbar: true }}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Contact Us
            </Link>
          </div>
          {/* Hamburger Button (Mobile Only) */}
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setIsOpen(!isOpen)}
          >
            ☰
          </button>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Copyright */}
            <div className="hidden lg:block text-gray-500 text-xs">
              © Arsh Chauhan
            </div>

            <Link
              to="/login"
              className="hidden md:block px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="px-3 py-1.5 md:px-5 md:py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors text-xs md:text-sm flex items-center space-x-2"
            >
              <span>Get Started</span>
              <svg
                className="w-4 h-4"
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
        <div className="md:hidden bg-[#0a0a0a] px-6 pb-4 space-y-4 border-t border-gray-800 text-gray-300">
          {/* FEATURES SECTION */}
          <div>
            <p className="text-white font-semibold mb-2">Features</p>
            <button
              onClick={() => {
                scrollToSection("dashboard-section");
                setIsOpen(false);
              }}
              className="block w-full text-left py-2"
            >
              Personal Dashboard
            </button>

            <button
              onClick={() => {
                scrollToSection("connect-mentors-section");
                setIsOpen(false);
              }}
              className="block w-full text-left py-2"
            >
              Connect with Mentors
            </button>
          </div>

          {/* SOLUTIONS SECTION */}
          <div>
            <p className="text-white font-semibold mb-2">Solutions</p>
            <Link
              to="/solutions"
              onClick={() => setIsOpen(false)}
              className="block py-2"
            >
              For Students
            </Link>
            <Link
              to="/solutions"
              onClick={() => setIsOpen(false)}
              className="block py-2"
            >
              For Mentors
            </Link>
          </div>

          {/* OTHER LINKS */}
          <button
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("footer");
              setIsOpen(false);
            }}
            className="block w-full text-left py-2"
          >
            Our Socials
          </button>

          <Link
            to="/contact-us"
            onClick={() => setIsOpen(false)}
            className="block py-2"
          >
            Contact Us
          </Link>

          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className="block py-2"
          >
            Log in
          </Link>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
