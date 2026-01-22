import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../../config/backendConfig';

const Step1 = ({ formData, handleChange, nextStep }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">
        Complete your profile
      </h2>
      <p className="text-gray-600">
        Help mentees get to know you better by completing your profile.
      </p>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company/School
        </label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your title
        </label>
        <input
          type="text"
          name="headline"
          value={formData.headline}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Years of professional experience
        </label>
        <input
          type="number"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          LinkedIn URL
        </label>
        <input
          type="url"
          name="linkedinProfile"
          value={formData.linkedinProfile}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
    </div>

    <button
      type="button"
      onClick={nextStep}
      className="w-full px-6 py-3 bg-blue-600 text-white rounded-md"
    >
      Continue <ArrowRight className="ml-2 inline h-4 w-4" />
    </button>
  </div>
);

const Step2 = ({ formData, handleChange, prevStep, isSubmitting }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">
        Tell us about yourself
      </h2>
    </div>

    <textarea
      name="bio"
      value={formData.bio}
      onChange={handleChange}
      rows={4}
      className="w-full px-4 py-2 border rounded-lg"
    />

    <div className="flex justify-between">
      <button
        type="button"
        onClick={prevStep}
        className="px-6 py-3 border rounded-md"
      >
        Back
      </button>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-3 bg-blue-600 text-white rounded-md"
      >
        {isSubmitting ? 'Saving...' : 'Complete Profile'}
        {!isSubmitting && <Check className="ml-2 inline h-4 w-4" />}
      </button>
    </div>
  </div>
);

const MentorProfileForm = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    company: '',
    headline: '',
    experience: '',
    linkedinProfile: '',
    bio: ''
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    // Get the authentication token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    // Convert experience to a number
    const experience = parseFloat(formData.experience) || 0;

    // Prepare the data to be sent to the backend
    const profileData = {
      company: formData.company,
      headline: formData.headline,
      experience: experience,
      linkedinProfile: formData.linkedinProfile,
      bio: formData.bio,
      isProfileComplete: true
    };

    // Send the data to the backend
    const response = await fetch(`${API_BASE_URL}/mentors/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to save profile');
    }

    // Show success message
    alert('Profile saved successfully!');
    
    // If we have an onComplete callback, call it with the response data
    if (onComplete) {
      onComplete(responseData.data);
    }
    
    // Navigate to dashboard or another page if needed
    navigate('/mentor/dashboard');
  } catch (error) {
    console.error('Error saving profile:', error);
    alert(`Error: ${error.message}`);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm"
    >
      {step === 1 ? (
        <Step1
          formData={formData}
          handleChange={handleChange}
          nextStep={() => setStep(2)}
        />
      ) : (
        <Step2
          formData={formData}
          handleChange={handleChange}
          prevStep={() => setStep(1)}
          isSubmitting={isSubmitting}
        />
      )}
    </form>
  );
};

export default MentorProfileForm;
