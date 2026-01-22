import React, { useState } from "react";

const RegisterForm = ({ onSubmit, onSwitchToLogin, role, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+1",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const countryCodes = [
    { code: "+1", country: "US/CA", flag: "🇺🇸", format: "(555) 123-4567" },
    { code: "+91", country: "India", flag: "🇮🇳", format: "98765 43210" },
    { code: "+44", country: "UK", flag: "🇬🇧", format: "7400 123456" },
    { code: "+61", country: "Australia", flag: "🇦🇺", format: "412 345 678" },
    { code: "+86", country: "China", flag: "🇨🇳", format: "138 0013 8000" },
    { code: "+81", country: "Japan", flag: "🇯🇵", format: "90 1234 5678" },
    { code: "+49", country: "Germany", flag: "🇩🇪", format: "151 23456789" },
    { code: "+33", country: "France", flag: "🇫🇷", format: "6 12 34 56 78" },
    { code: "+971", country: "UAE", flag: "🇦🇪", format: "50 123 4567" },
    { code: "+65", country: "Singapore", flag: "🇸🇬", format: "8123 4567" },
  ];
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    // Combine country code and phone number
    const fullPhoneNumber = formData.countryCode + formData.phoneNumber;
    onSubmit({ ...formData, phoneNumber: fullPhoneNumber, role });
  };

  return (
    <div className="w-full max-w-md mx-auto text-left">
      {/* Back Button */}
      <button
        onClick={onSwitchToLogin}
        className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </button>

      <h1 className="text-2xl font-bold text-white mb-2">Join as a {role}</h1>

      <p className="text-gray-400 mb-6">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-blue-400 hover:text-blue-300 font-medium"
        >
          Log in
        </button>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-300 block mb-2">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-3 py-2.5 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-300 block mb-2">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-3 py-2.5 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-300 block mb-2">
            Phone Number
          </label>
          <div className="flex gap-2">
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              className="w-28 px-2 py-2.5 bg-gray-800 border border-gray-700 rounded text-white focus:border-blue-500 focus:outline-none text-sm"
            >
              {countryCodes.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.code}
                </option>
              ))}
            </select>
            <input
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="flex-1 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              placeholder={
                countryCodes.find((c) => c.code === formData.countryCode)
                  ?.format || "(555) 123-4567"
              }
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-300 block mb-2">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({ ...prev, password: value }));

                if (value.length < 8) {
                  setPasswordError(
                    "Password must be at least 8 characters long",
                  );
                } else {
                  setPasswordError("");
                }
              }}
              required
              className="w-full pl-10 pr-12 py-2.5 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-300 block mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-12 py-2.5 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
            >
              {showConfirmPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || passwordError}
          className={`w-full py-2.5 rounded font-semibold transition-colors ${
            isLoading || passwordError
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-gray-600 hover:bg-gray-700"
          } text-white`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Signing up...
            </div>
          ) : (
            `Sign up as ${role}`
          )}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
