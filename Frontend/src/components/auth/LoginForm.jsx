import React, { useState, useEffect } from 'react';
import ProfileCarousel from "./ProfileCarousel"
import { useGoogleLogin } from '@react-oauth/google';

const LoginForm = ({ onSubmit, onNavigateToRegister, onGoogleAuth, isLoading }) => {
  const [role, setRole] = useState("student");
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [captchaValue, setCaptchaValue] = useState(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    onSubmit({ ...formData, role });
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
      const selectedRole = sessionStorage.getItem('selectedRole');
      onGoogleAuth(codeResponse.code, selectedRole);
    },
    flow: 'auth-code',
    ux_mode: 'redirect',
    redirect_uri: window.location.origin,
    onError: (error) => console.error('Login Failed:', error)
  });

  const handleGoogleButtonClick = () => {
    // Use the currently selected role from the tabs
    console.log("Google button clicked, selected role:", role);
    sessionStorage.setItem('selectedRole', role);
    console.log("Role stored in sessionStorage:", sessionStorage.getItem('selectedRole'));
    handleGoogleLogin(); // Trigger Google OAuth with selected role
  };

  return (
    <div className="w-full max-w-md mx-auto text-center max-h-screen overflow-y-auto">
      {!showEmailForm ? (
        <>
          {/* Main Heading */}
          <h1 className="text-3xl font-bold text-white mb-2">Log into Uploom</h1>
          
          {/* Subtitle */}
          <p className="text-gray-400 mb-8">
            New to Uploom? Sign up as a{" "}
            <button 
              onClick={() => onNavigateToRegister('student')}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              student
            </button>
            <br />
            or apply to be a{" "}
            <button 
              onClick={() => onNavigateToRegister('mentor')}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              mentor
            </button>
          </p>

          {/* Role Toggle */}
          <div className="flex text-gray-400 font-medium text-sm mb-6">
            <button
              onClick={() => setRole("student")}
              className={`px-4 pb-2 ${role === "student" ? "border-b-2 border-blue-500 text-white" : "text-gray-500"}`}
            >
              I'm a student
            </button>
            <button
              onClick={() => setRole("mentor")}
              className={`px-4 pb-2 ${role === "mentor" ? "border-b-2 border-blue-500 text-white" : "text-gray-500"}`}
            >
              I'm a mentor
            </button>
          </div>

          {/* Login Buttons */}
          <div className="space-y-3">
            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded border border-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Log in with Google
            </button>

            {/* GitHub Login */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded border border-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Log in with GitHub
            </button>

            {/* Bottom Row - Email and SSO */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded border border-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </button>
              
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded border border-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Mobile number
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Email Login Form */}
          <div className="text-left">
            {/* Back Button */}
            <button
              onClick={() => setShowEmailForm(false)}
              className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {/* Main Heading */}
            <h1 className="text-3xl font-bold text-white mb-2">Log into Uploom</h1>
            
            {/* Subtitle */}
            <p className="text-gray-400 mb-8">
              New to Uploom? Sign up as a{" "}
              <button 
                onClick={() => onNavigateToRegister('student')}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                student
              </button>{" "}
              or apply to be a{" "}
              <button 
                onClick={() => onNavigateToRegister('mentor')}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                mentor
              </button>
            </p>

            {/* Role Toggle */}
            <div className="flex text-gray-400 font-medium text-sm mb-6">
              <button
                onClick={() => setRole("student")}
                className={`px-4 pb-2 ${role === "student" ? "border-b-2 border-blue-500 text-white" : "text-gray-500"}`}
              >
                I'm a student
              </button>
              <button
                onClick={() => setRole("mentor")}
                className={`px-4 pb-2 ${role === "mentor" ? "border-b-2 border-blue-500 text-white" : "text-gray-500"}`}
              >
                I'm a mentor
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm text-gray-300 block mb-2">Email or username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    name="email"
                    type="text"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-300 block mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded font-semibold transition-colors ${
                  isLoading 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-gray-600 hover:bg-gray-700'
                } text-white`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Logging in...
                  </div>
                ) : (
                  'Log in'
                )}
              </button>


              <div className="flex justify-between text-sm mt-3">
                <a href="#" className="text-blue-400 hover:text-blue-300">Forgot password?</a>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default LoginForm;
