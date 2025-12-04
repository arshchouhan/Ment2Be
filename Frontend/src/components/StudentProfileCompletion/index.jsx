import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X, ArrowLeft, ArrowRight, Check, User, BookOpen, Briefcase, Link2, MapPin, Globe, ChevronDown } from 'lucide-react';

const StudentProfileCompletion = ({ onComplete = () => {} }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const stepFromUrl = parseInt(searchParams.get('step') || '1', 10);
  const [currentStep, setCurrentStep] = useState(stepFromUrl || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    education: [
      { institution: '', degree: '', field: '', startYear: '', endYear: '' }
    ],
    experience: [
      { company: '', position: '', description: '', startDate: '', endDate: '' }
    ],
    skills: [],
    interests: [],
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
      portfolio: ''
    },
    location: {
      city: '',
      country: ''
    },
    profilePicture: null
  });

  const [errors, setErrors] = useState({});

  // Steps configuration
  const steps = [
    { id: 1, name: 'Personal Info', icon: <User size={16} /> },
    { id: 2, name: 'Education', icon: <BookOpen size={16} /> },
    { id: 3, name: 'Experience', icon: <Briefcase size={16} /> },
    { id: 4, name: 'Skills & Interests', icon: <Link2 size={16} /> },
    { id: 5, name: 'Social & Location', icon: <MapPin size={16} /> }
  ];

  // Sync step with URL
  useEffect(() => {
    if (stepFromUrl >= 1 && stepFromUrl <= steps.length) {
      setCurrentStep(stepFromUrl);
    }
  }, [stepFromUrl, steps.length]);

  // Update URL when step changes
  const updateStepInUrl = (step) => {
    setSearchParams({ step });
  };

  // Handle navigation
  const goToStep = (step) => {
    const newStep = Math.max(1, Math.min(step, steps.length));
    setCurrentStep(newStep);
    updateStepInUrl(newStep);
  };

  // Handle form close
  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'profilePicture') {
      setFormData(prev => ({
        ...prev,
        profilePicture: files[0]
      }));
    } else if (name.includes('.')) {
      // Handle nested objects (e.g., socialLinks.linkedin)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name.includes('[') && name.includes(']')) {
      // Handle array fields (e.g., education[0].institution)
      const match = name.match(/(\w+)\[(\d+)\]\.(\w+)/);
      if (match) {
        const [_, arrayName, index, field] = match;
        const updatedArray = [...formData[arrayName]];
        updatedArray[index] = {
          ...updatedArray[index],
          [field]: value
        };
        setFormData(prev => ({
          ...prev,
          [arrayName]: updatedArray
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle adding new education/experience entry
  const handleAddEntry = (type) => {
    const newEntry = type === 'education' 
      ? { institution: '', degree: '', field: '', startYear: '', endYear: '' }
      : { company: '', position: '', description: '', startDate: '', endDate: '' };
    
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], newEntry]
    }));
  };

  // Handle removing education/experience entry
  const handleRemoveEntry = (type, index) => {
    if (formData[type].length > 1) {
      setFormData(prev => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index)
      }));
    }
  };

  // Handle adding a skill
  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const newSkill = e.target.value.trim();
      if (!formData.skills.includes(newSkill)) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, newSkill]
        }));
        e.target.value = '';
      }
    }
  };

  // Handle removing a skill
  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // Handle adding an interest
  const handleAddInterest = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const newInterest = e.target.value.trim();
      if (!formData.interests.includes(newInterest)) {
        setFormData(prev => ({
          ...prev,
          interests: [...prev.interests, newInterest]
        }));
        e.target.value = '';
      }
    }
  };

  // Handle removing an interest
  const handleRemoveInterest = (interestToRemove) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Personal Info
        if (!formData.fullName?.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email?.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
        break;
      case 2: // Education
        formData.education.forEach((edu, index) => {
          if (!edu.institution?.trim()) newErrors[`education[${index}].institution`] = 'Institution is required';
          if (!edu.degree?.trim()) newErrors[`education[${index}].degree`] = 'Degree is required';
          if (!edu.field?.trim()) newErrors[`education[${index}].field`] = 'Field of study is required';
          if (!edu.startYear) newErrors[`education[${index}].startYear`] = 'Start year is required';
        });
        break;
      case 3: // Experience
        formData.experience.forEach((exp, index) => {
          if (!exp.company?.trim()) newErrors[`experience[${index}].company`] = 'Company is required';
          if (!exp.position?.trim()) newErrors[`experience[${index}].position`] = 'Position is required';
          if (!exp.startDate) newErrors[`experience[${index}].startDate`] = 'Start date is required';
        });
        break;
      // Steps 4 and 5 don't have required fields
      default:
        break;
    }

    setErrors(newErrors);
    return newErrors;
  };

  // Handle next button click
  const handleNext = () => {
    const currentErrors = validateStep(currentStep);
    if (Object.keys(currentErrors).length === 0) {
      goToStep(currentStep + 1);
    }
  };

  // Handle previous button click
  const handlePrevious = () => {
    goToStep(currentStep - 1);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate all steps before submission
      let hasErrors = false;
      for (let i = 1; i <= steps.length; i++) {
        const stepErrors = validateStep(i);
        if (Object.keys(stepErrors).length > 0) {
          hasErrors = true;
          break;
        }
      }

      if (!hasErrors) {
        await onComplete(formData);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-200 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                  {formData.profilePicture ? (
                    <img 
                      src={URL.createObjectURL(formData.profilePicture)} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="profilePicture"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="profilePicture"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-200 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {formData.profilePicture ? 'Change Photo' : 'Upload Photo'}
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-200 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.fullName ? 'border-red-500' : 'border-gray-600'} rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="John Doe"
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-600'} rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="john@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-200 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-600'} rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-200 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {formData.education.map((edu, index) => (
              <div key={index} className="border border-gray-700 rounded-lg p-4 relative">
                {formData.education.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEntry('education', index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    title="Remove education"
                  >
                    <X size={16} />
                  </button>
                )}
                <h3 className="text-lg font-medium text-white mb-4">
                  Education {formData.education.length > 1 ? index + 1 : ''}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label 
                      htmlFor={`education[${index}].institution`} 
                      className="block text-sm font-medium text-gray-200 mb-1"
                    >
                      Institution <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`education[${index}].institution`}
                      name={`education[${index}].institution`}
                      value={edu.institution}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors[`education[${index}].institution`] ? 'border-red-500' : 'border-gray-600'} rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="University of Example"
                    />
                    {errors[`education[${index}].institution`] && (
                      <p className="mt-1 text-sm text-red-500">{errors[`education[${index}].institution`]}</p>
                    )}
                  </div>
                  <div>
                    <label 
                      htmlFor={`education[${index}].degree`} 
                      className="block text-sm font-medium text-gray-200 mb-1"
                    >
                      Degree <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`education[${index}].degree`}
                      name={`education[${index}].degree`}
                      value={edu.degree}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors[`education[${index}].degree`] ? 'border-red-500' : 'border-gray-600'} rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Bachelor of Science"
                    />
                    {errors[`education[${index}].degree`] && (
                      <p className="mt-1 text-sm text-red-500">{errors[`education[${index}].degree`]}</p>
                    )}
                  </div>
                  <div>
                    <label 
                      htmlFor={`education[${index}].field`} 
                      className="block text-sm font-medium text-gray-200 mb-1"
                    >
                      Field of Study <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`education[${index}].field`}
                      name={`education[${index}].field`}
                      value={edu.field}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors[`education[${index}].field`] ? 'border-red-500' : 'border-gray-600'} rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Computer Science"
                    />
                    {errors[`education[${index}].field`] && (
                      <p className="mt-1 text-sm text-red-500">{errors[`education[${index}].field`]}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label 
                        htmlFor={`education[${index}].startYear`} 
                        className="block text-sm font-medium text-gray-200 mb-1"
                      >
                        Start Year <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id={`education[${index}].startYear`}
                        name={`education[${index}].startYear`}
                        value={edu.startYear}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${errors[`education[${index}].startYear`] ? 'border-red-500' : 'border-gray-600'} rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="2018"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                      {errors[`education[${index}].startYear`] && (
                        <p className="mt-1 text-sm text-red-500">{errors[`education[${index}].startYear`]}</p>
                      )}
                    </div>
                    <div>
                      <label 
                        htmlFor={`education[${index}].endYear`} 
                        className="block text-sm font-medium text-gray-200 mb-1"
                      >
                        End Year (or expected)
                      </label>
                      <input
                        type="number"
                        id={`education[${index}].endYear`}
                        name={`education[${index}].endYear`}
                        value={edu.endYear}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="2022"
                        min="1900"
                        max="2100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddEntry('education')}
              className="inline-flex items-center px-4 py-2 border border-dashed border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Education
            </button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {formData.experience.map((exp, index) => (
              <div key={index} className="border border-gray-700 rounded-lg p-4 relative">
                {formData.experience.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEntry('experience', index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    title="Remove experience"
                  >
                    <X size={16} />
                  </button>
                )}
                <h3 className="text-lg font-medium text-white mb-4">
                  Experience {formData.experience.length > 1 ? index + 1 : ''}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label 
                      htmlFor={`experience[${index}].company`} 
                      className="block text-sm font-medium text-gray-200 mb-1"
                    >
                      Company <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`experience[${index}].company`}
                      name={`experience[${index}].company`}
                      value={exp.company}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors[`experience[${index}].company`] ? 'border-red-500' : 'border-gray-600'} rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Tech Corp Inc."
                    />
                    {errors[`experience[${index}].company`] && (
                      <p className="mt-1 text-sm text-red-500">{errors[`experience[${index}].company`]}</p>
                    )}
                  </div>
                  <div>
                    <label 
                      htmlFor={`experience[${index}].position`} 
                      className="block text-sm font-medium text-gray-200 mb-1"
                    >
                      Position <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`experience[${index}].position`}
                      name={`experience[${index}].position`}
                      value={exp.position}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors[`experience[${index}].position`] ? 'border-red-500' : 'border-gray-600'} rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Software Engineer"
                    />
                    {errors[`experience[${index}].position`] && (
                      <p className="mt-1 text-sm text-red-500">{errors[`experience[${index}].position`]}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label 
                      htmlFor={`experience[${index}].description`} 
                      className="block text-sm font-medium text-gray-200 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id={`experience[${index}].description`}
                      name={`experience[${index}].description`}
                      rows="3"
                      value={exp.description}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your role and responsibilities..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label 
                        htmlFor={`experience[${index}].startDate`} 
                        className="block text-sm font-medium text-gray-200 mb-1"
                      >
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="month"
                        id={`experience[${index}].startDate`}
                        name={`experience[${index}].startDate`}
                        value={exp.startDate}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${errors[`experience[${index}].startDate`] ? 'border-red-500' : 'border-gray-600'} rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors[`experience[${index}].startDate`] && (
                        <p className="mt-1 text-sm text-red-500">{errors[`experience[${index}].startDate`]}</p>
                      )}
                    </div>
                    <div>
                      <label 
                        htmlFor={`experience[${index}].endDate`} 
                        className="block text-sm font-medium text-gray-200 mb-1"
                      >
                        End Date (or present)
                      </label>
                      <input
                        type="month"
                        id={`experience[${index}].endDate`}
                        name={`experience[${index}].endDate`}
                        value={exp.endDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddEntry('experience')}
              className="inline-flex items-center px-4 py-2 border border-dashed border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Experience
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-100"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-800 text-blue-200 hover:bg-blue-700 focus:outline-none"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                onKeyDown={handleAddSkill}
                placeholder="Type a skill and press Enter"
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Interests
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.interests.map((interest, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-900 text-purple-100"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-purple-800 text-purple-200 hover:bg-purple-700 focus:outline-none"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                onKeyDown={handleAddInterest}
                placeholder="Type an interest and press Enter"
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Social Links</h3>
              <div className="space-y-4">
                <div>
                  <label 
                    htmlFor="socialLinks.linkedin" 
                    className="block text-sm font-medium text-gray-200 mb-1"
                  >
                    LinkedIn
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Linkedin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      id="socialLinks.linkedin"
                      name="socialLinks.linkedin"
                      value={formData.socialLinks.linkedin}
                      onChange={handleChange}
                      className="w-full pl-10 px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="socialLinks.github" 
                    className="block text-sm font-medium text-gray-200 mb-1"
                  >
                    GitHub
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Github className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      id="socialLinks.github"
                      name="socialLinks.github"
                      value={formData.socialLinks.github}
                      onChange={handleChange}
                      className="w-full pl-10 px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="socialLinks.twitter" 
                    className="block text-sm font-medium text-gray-200 mb-1"
                  >
                    Twitter
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Twitter className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      id="socialLinks.twitter"
                      name="socialLinks.twitter"
                      value={formData.socialLinks.twitter}
                      onChange={handleChange}
                      className="w-full pl-10 px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="socialLinks.portfolio" 
                    className="block text-sm font-medium text-gray-200 mb-1"
                  >
                    Portfolio Website
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      id="socialLinks.portfolio"
                      name="socialLinks.portfolio"
                      value={formData.socialLinks.portfolio}
                      onChange={handleChange}
                      className="w-full pl-10 px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-4">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label 
                    htmlFor="location.city" 
                    className="block text-sm font-medium text-gray-200 mb-1"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="location.city"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label 
                    htmlFor="location.country" 
                    className="block text-sm font-medium text-gray-200 mb-1"
                  >
                    Country
                  </label>
                  <div className="relative">
                    <select
                      id="location.country"
                      name="location.country"
                      value={formData.location.country}
                      onChange={handleChange}
                      className="w-full px-3 py-2 appearance-none border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    >
                      <option value="">Select a country</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="India">India</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
              <button 
                onClick={handleClose}
                className="text-gray-400 hover:text-white focus:outline-none"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-400">
              Step {currentStep} of {steps.length}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-4 pb-2">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="px-6 py-4 border-b border-gray-700">
            <nav className="flex items-center justify-center" aria-label="Progress">
              <ol className="flex items-center space-x-4">
                {steps.map((step, index) => (
                  <li key={step.id} className="flex items-center">
                    {index < currentStep - 1 ? (
                      <>
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600">
                          <Check className="w-5 h-5 text-white" />
                        </span>
                        {index < steps.length - 1 && (
                          <div className="w-12 h-0.5 bg-blue-600"></div>
                        )}
                      </>
                    ) : index === currentStep - 1 ? (
                      <>
                        <span className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-blue-500 bg-blue-900">
                          <span className="text-blue-100">{step.id}</span>
                        </span>
                        {index < steps.length - 1 && (
                          <div className="w-12 h-0.5 bg-gray-600"></div>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-600 text-gray-400">
                          {step.id}
                        </span>
                        {index < steps.length - 1 && (
                          <div className="w-12 h-0.5 bg-gray-600"></div>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          {/* Form Content */}
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between border-t border-gray-700 pt-6">
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="inline-flex items-center px-4 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-200 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <ArrowLeft size={18} className="mr-2" />
                      Previous
                    </button>
                  )}
                </div>
                
                <div>
                  {currentStep < steps.length ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Next
                      <ArrowRight size={18} className="ml-2" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Profile'}
                      <Check size={18} className="ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileCompletion;
