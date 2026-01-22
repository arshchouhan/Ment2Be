import React, { useState } from 'react';
import { API_BASE_URL } from '../config/backendConfig';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || 'Failed to send message');
      }

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (error) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a0f0f] to-[#0d0d0d] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <LandingNavbar />
      
      {/* Contact Us Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
              Get in Touch
            </h1>
            <p className="text-2xl text-gray-300">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          {/* Contact Form */}
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-white font-semibold mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  placeholder="Your name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-white font-semibold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              {/* Subject Field */}
              <div>
                <label className="block text-white font-semibold mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  placeholder="What is this about?"
                />
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-white font-semibold mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-center">
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-center">
                  Something went wrong. Please try again.
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-white font-semibold mb-2">Email</h3>
              <p className="text-gray-400">arshchouhan004@gmail.com</p>
            </div>
            <div className="text-center">
              <h3 className="text-white font-semibold mb-2">Phone</h3>
              <p className="text-gray-400">+91 8544758216</p>
            </div>
            <div className="text-center">
              <h3 className="text-white font-semibold mb-2">Location</h3>
              <p className="text-gray-400">Phagwara, India</p>
            </div>
          </div>
        </div>
      </div>

      <LandingFooter />
      </div>
    </div>
  );
};

export default ContactUsPage;
