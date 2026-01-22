import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/backendConfig';
import StudentProfileCompletion from '../components/StudentProfileCompletion';
import Navbar from '../components/StudentDashboard/Navbar';

const ProfileCompletionPage = () => {
  const navigate = useNavigate();

  const handleComplete = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        // Update local storage with new user data
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...user, ...data.user }));
        
        // Navigate back to dashboard
        navigate('/dashboard');
      } else {
        console.error('Error updating profile:', data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <StudentProfileCompletion onComplete={handleComplete} />
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionPage;
