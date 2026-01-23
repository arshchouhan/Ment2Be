import React from 'react';
import { Link } from 'react-router-dom';
import logoHat from '../assets/logo-hat.png';

const LandingFooter = () => {
  return (
    <footer
      id="footer"
      className="relative z-10 bg-[#0a0a0a] border-t border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src={logoHat}
                alt="Ment2Be Logo"
                className="w-8 h-8 brightness-0 invert"
              />
              <span className="text-white text-lg font-semibold">
                Ment2Be
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Accessible and tailored mentorship experience for everyone.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  state={{ fromNavbar: true }}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  state={{ fromNavbar: true }}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Mentorship
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-white font-semibold mb-4">Solutions</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/solutions"
                  state={{ fromNavbar: true }}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  For Students
                </Link>
              </li>
              <li>
                <Link
                  to="/solutions"
                  state={{ fromNavbar: true }}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  For Mentors
                </Link>
              </li>
              <li>
                <Link
                  to="/solutions"
                  state={{ fromNavbar: true }}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  For Teams
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <h4 className="text-white font-semibold mb-4">Connect With Us</h4>

          <div className="flex justify-center space-x-6">
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/arshchouhan"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 Ment2Be. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
