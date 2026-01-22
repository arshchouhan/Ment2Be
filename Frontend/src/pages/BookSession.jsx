import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiClock, FiUser, FiDollarSign } from 'react-icons/fi';
import { API_BASE_URL } from '../config/backendConfig';
import { getBackendUrl } from '../utils/apiUrl.js';
import Navbar from '../components/StudentDashboard/Navbar';
import { getAvailableSlots } from '../services/availabilityService';
import { toast } from 'react-toastify';

const BookSession = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mentorName = searchParams.get('mentor');
  const mentorId = searchParams.get('mentorId');
  
  const [loading, setLoading] = useState(false);
  const [mentorData, setMentorData] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    sessionTitle: '',
    sessionDescription: '',
    sessionType: 'one-on-one',
    sessionDate: '',
    sessionTime: '',
    duration: 60,
    topics: [],
    studentNotes: ''
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [bookedTimeSlots, setBookedTimeSlots] = useState([]);
  const [feePaid, setFeePaid] = useState(false);
  const [payingFee, setPayingFee] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchMentorData = async () => {
      if (!mentorName || !mentorId) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/mentors`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (data.success && data.mentors) {
          const mentor = data.mentors.find(m => m._id === mentorId);
          if (mentor) {
            setMentorData({
              id: mentor._id,
              name: mentor.name,
              title: mentor.headline || mentor.mentorProfile?.headline || 'Mentor',
              company: mentor.company || mentor.mentorProfile?.company || 'N/A',
              profileImage: mentor.profilePicture || mentor.mentorProfile?.profilePicture || null,
              hourlyRate: mentor.hourlyRate || mentor.mentorProfile?.hourlyRate || 0,
              skills: Array.isArray(mentor.skills)
                ? mentor.skills.map((skill) => (typeof skill === 'string' ? skill : skill?.name)).filter(Boolean)
                : []
            });
            
            // Set default session title
            setFormData(prev => ({
              ...prev,
              sessionTitle: `Mentoring Session with ${mentor.name}`,
              topics: mentor.skills?.slice(0, 3) || []
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching mentor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorData();
  }, [mentorName, mentorId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setFormData(prev => ({ ...prev, sessionDate: date }));
    setSelectedTimeSlot(''); // Reset time slot when date changes
    
    // Fetch available time slots for this date from mentor's availability using service
    try {
      // Use availability service instead of direct fetch
      const data = await getAvailableSlots(mentorId, date);
      
      console.log('📅 Availability API Response:', data);
      console.log('📋 Available slots:', data.availableSlots);
      
      // Get only the available (not booked) slots from mentor's availability
      if (data.success && data.availableSlots && Array.isArray(data.availableSlots)) {
        // availableSlots is an array of start times like ['09:00 AM', '10:00 AM']
        setAvailableTimeSlots(data.availableSlots);
      } else {
        // No availability set for this date
        setAvailableTimeSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableTimeSlots([]);
    }
  };

  const handleTimeSlotSelect = (time) => {
    setSelectedTimeSlot(time);
    setFormData(prev => ({ ...prev, sessionTime: time }));
  };

  const handlePayFee = () => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const startPayment = async () => {
      if (payingFee || feePaid) return;

      try {
        setPayingFee(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const ok = await loadRazorpay();
        if (!ok) {
          toast.error('Failed to load payment gateway. Please try again.');
          return;
        }

        const platformFeePaise = 9900;

        const orderRes = await fetch(`${API_BASE_URL}/payments/razorpay/order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: platformFeePaise,
            currency: 'INR',
            receipt: `booking_fee_${Date.now()}`,
            notes: {
              mentorId,
              mentorName
            }
          })
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok || !orderData?.success) {
          if ((orderData?.message || '').toLowerCase().includes('keys not configured')) {
            toast.info("Payments will be integrated in version 2. Continue with booking it's free");
          } else {
            toast.error(orderData?.message || 'Failed to initiate payment');
          }
          return;
        }

        const { keyId, order } = orderData;

        const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Ment2Be',
          description: 'Platform Fee',
          order_id: order.id,
          handler: async function (response) {
            try {
              const verifyRes = await fetch(`${apiBase}/payments/razorpay/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(response)
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData?.success) {
                setFeePaid(true);
                toast.success('Payment successful.');
              } else {
                toast.error(verifyData?.message || 'Payment verification failed');
              }
            } catch (err) {
              console.error('Verify payment error:', err);
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || ''
          },
          theme: {
            color: '#4b5563'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function () {
          toast.error('Payment failed.');
        });
        rzp.open();
      } catch (err) {
        console.error('Payment init error:', err);
        toast.error('Failed to start payment');
      } finally {
        setPayingFee(false);
      }
    };

    startPayment();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTimeSlot) {
      alert('Please select date and time');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const bookingData = {
        mentorId: mentorId,
        sessionTitle: formData.sessionTitle,
        sessionDescription: formData.sessionDescription,
        sessionType: formData.sessionType,
        sessionDate: selectedDate,
        sessionTime: selectedTimeSlot,
        duration: formData.duration,
        topics: formData.topics,
        studentNotes: formData.studentNotes
      };

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Booking created successfully!');
        navigate('/student/sessions');
      } else {
        alert(data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions for calendar
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleMonthChange = (e) => {
    setCurrentMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setCurrentYear(parseInt(e.target.value));
  };

  const generateCalendar = () => {
    const today = new Date();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      // Create date string manually to avoid timezone issues
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
      const isPast = date < today;
      
      days.push({
        day,
        date: dateString,
        isToday,
        isPast,
        isSelected: selectedDate === dateString
      });
    }
    
    return days;
  };

  // All possible time slots - will be filtered based on mentor's availability
  const allTimeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar userName={user?.name || 'Student'} />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000]">
      <Navbar userName={user?.name || 'Student'} />
      
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors text-sm"
        >
          <FiArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-3">Book a Session</h1>
          {mentorData && (
            <div className="flex items-center space-x-3 bg-[#121212] rounded-lg p-3 shadow-sm border border-gray-700">
              {mentorData.profileImage ? (
                <img
                  src={mentorData.profileImage}
                  alt={mentorData.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div>
                <p className="text-white font-semibold text-base">{mentorData.name}</p>
                <p className="text-gray-400 text-sm">{mentorData.title}</p>
                <p className="text-gray-500 text-xs">{mentorData.company}</p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left Column - Session Details Form */}
            <div className="bg-[#121212] rounded-lg shadow-sm border border-gray-700 p-4">
              <h3 className="text-base font-semibold text-white mb-4">Session Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Session Title</label>
                  <input
                    type="text"
                    name="sessionTitle"
                    value={formData.sessionTitle}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 text-sm bg-[#202327] border border-gray-700 rounded text-white placeholder-gray-500 focus:border-gray-600 focus:outline-none"
                    placeholder="Enter session title"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Session Type</label>
                  <select
                    name="sessionType"
                    value={formData.sessionType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm bg-[#202327] border border-gray-700 rounded text-white focus:border-gray-600 focus:outline-none"
                  >
                    <option value="one-on-one">One-on-One</option>
                    <option value="group">Group Session</option>
                    <option value="workshop">Workshop</option>
                    <option value="webinar">Webinar</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Duration</label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm bg-[#202327] border border-gray-700 rounded text-white focus:border-gray-600 focus:outline-none"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Description (Optional)</label>
                  <textarea
                    name="sessionDescription"
                    value={formData.sessionDescription}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 text-sm bg-[#202327] border border-gray-700 rounded text-white placeholder-gray-500 focus:border-gray-600 focus:outline-none"
                    placeholder="Describe what you'd like to learn or discuss..."
                  />
                </div>

                {/* Price Display */}
                {mentorData && (
                  <div className="bg-[#202327] rounded-lg p-3 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs flex items-center">
                        <FiDollarSign className="w-3.5 h-3.5 mr-1" />
                        Session Price:
                      </span>
                      {mentorData.hourlyRate > 0 ? (
                        <span className="text-white font-bold text-base">
                          {`$${mentorData.hourlyRate}`}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handlePayFee}
                          disabled={feePaid || payingFee}
                          className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-xs ${
                            feePaid
                              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                              : payingFee
                              ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                              : 'bg-gray-600 hover:bg-gray-700 text-white'
                          }`}
                        >
                          {feePaid ? 'Paid' : payingFee ? 'Processing...' : 'Pay Fee'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Additional Notes (Optional)</label>
                  <textarea
                    name="studentNotes"
                    value={formData.studentNotes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 text-sm bg-[#202327] border border-gray-700 rounded text-white placeholder-gray-500 focus:border-gray-600 focus:outline-none"
                    placeholder="Any specific topics or questions you'd like to discuss..."
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Date & Time Selection */}
            <div className="bg-[#121212] rounded-lg shadow-sm border border-gray-700 p-4">
              <h3 className="text-base font-semibold text-white mb-4">Select Date & Time</h3>
              
              <div className="space-y-4">
                {/* Date Selection */}
                <div>
                  <label className="text-xs text-gray-400 block mb-2">
                    <FiCalendar className="inline w-3.5 h-3.5 mr-1" />
                    Select Date
                  </label>
                  
                  <p className="text-gray-400 text-xs mb-3">Choose a date for the mentorship session</p>
                  <div className="bg-[#202327] rounded-lg p-3 border border-gray-700">
                    {/* Calendar Header with Month/Year Navigation */}
                    <div className="flex items-center justify-between mb-3">
                      <button
                        type="button"
                        onClick={goToPreviousMonth}
                        className="p-0.5 hover:bg-gray-700 rounded transition-colors"
                      >
                        <FiArrowLeft className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      
                      <div className="flex items-center space-x-1.5">
                        <select
                          value={currentMonth}
                          onChange={handleMonthChange}
                          className="px-1.5 py-0.5 border border-gray-600 bg-[#121212] text-white rounded text-[11px] focus:outline-none focus:border-gray-500"
                        >
                          {[
                            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                          ].map((month, index) => (
                            <option key={index} value={index}>{month}</option>
                          ))}
                        </select>
                        
                        <input
                          type="number"
                          value={currentYear}
                          onChange={(e) => setCurrentYear(parseInt(e.target.value) || new Date().getFullYear())}
                          min="2020"
                          max="2050"
                          className="px-1.5 py-0.5 border border-gray-600 bg-[#121212] text-white rounded text-[11px] focus:outline-none focus:border-gray-500 w-14"
                          placeholder="Year"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={goToNextMonth}
                        className="p-0.5 hover:bg-gray-700 rounded transition-colors"
                      >
                        <FiArrowLeft className="w-3.5 h-3.5 rotate-180 text-gray-400" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] mb-1.5">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="p-1 font-medium text-gray-500">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
                      {generateCalendar().map((dayObj, index) => (
                        <div key={index} className="p-0.5">
                          {dayObj && (
                            <button
                              type="button"
                              onClick={() => !dayObj.isPast && handleDateSelect(dayObj.date)}
                              disabled={dayObj.isPast}
                              className={`w-7 h-7 rounded transition-colors text-[11px] ${
                                dayObj.isSelected
                                  ? 'bg-gray-600 text-white'
                                  : dayObj.isPast
                                  ? 'text-gray-600 cursor-not-allowed'
                                  : dayObj.isToday
                                  ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                                  : 'text-gray-300 hover:bg-gray-700'
                              }`}
                            >
                              {dayObj.day}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <label className="text-xs text-gray-400 block mb-2">
                    <FiClock className="inline w-3.5 h-3.5 mr-1" />
                    Select Time
                  </label>
                  
                  <p className="text-gray-400 text-xs mb-3">Choose a time slot for the mentorship session</p>
                  
                  {/* Preset Time Slots */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {allTimeSlots.map((time) => {
                      // Check if this time is in the mentor's available slots for the selected date
                      const isAvailable = selectedDate && availableTimeSlots.includes(time);
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => isAvailable && handleTimeSlotSelect(time)}
                          disabled={!isAvailable}
                          className={`p-2 text-center border rounded transition-all text-xs ${
                            selectedTimeSlot === time && isAvailable
                              ? 'bg-gray-600 text-white border-gray-600'
                              : isAvailable
                              ? 'bg-[#202327] text-gray-300 border-gray-700 hover:border-gray-600 hover:bg-gray-700/30 cursor-pointer'
                              : 'bg-[#202327] text-gray-500 border-gray-700 opacity-50 cursor-not-allowed'
                          }`}
                          title={!isAvailable && selectedDate ? 'Not available' : ''}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                  {!selectedDate && (
                    <p className="text-gray-500 text-xs text-center mt-2">Select a date to see available times</p>
                  )}
                  {selectedDate && availableTimeSlots.length === 0 && (
                    <div className="mt-3 p-2 bg-gray-700/30 border border-gray-600/50 rounded-lg">
                      <p className="text-yellow-400 text-xs text-center">⚠️ No available time slots for this date</p>
                      <p className="text-yellow-300 text-[11px] text-center mt-1">Please select a different date</p>
                    </div>
                  )}
                  {selectedDate && availableTimeSlots.length > 0 && (
                    <div className="mt-3 p-2 bg-gray-700/30 border border-gray-600/50 rounded-lg">
                      <p className="text-gray-300 text-xs text-center">✓ {availableTimeSlots.length} available slot(s) for this date</p>
                    </div>
                  )}
                </div>

                {/* Selected Date & Time Display */}
                {(selectedDate || selectedTimeSlot) && (
                  <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-3">
                    <h4 className="text-gray-300 font-medium mb-1.5 text-xs">Selected Session</h4>
                    {selectedDate && (
                      <p className="text-gray-400 text-[11px]">
                        Date: {(() => {
                          const [year, month, day] = selectedDate.split('-').map(Number);
                          const date = new Date(year, month - 1, day);
                          return date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          });
                        })()}
                      </p>
                    )}
                    {selectedTimeSlot && (
                      <p className="text-gray-400 text-[11px]">Time: {selectedTimeSlot}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button - Full Width Below Both Columns */}
          <div className="mt-5 pt-4 border-t border-gray-700">
            <button
              type="submit"
              disabled={loading || !selectedDate || !selectedTimeSlot}
              className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors text-sm ${
                loading || !selectedDate || !selectedTimeSlot
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {loading ? 'Creating Booking...' : 'Book Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookSession;