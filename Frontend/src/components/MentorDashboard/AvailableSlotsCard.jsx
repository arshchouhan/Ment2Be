import React, { useState } from 'react';
import { FiCalendar, FiClock, FiEdit, FiCheck, FiX } from 'react-icons/fi';
import { saveAvailability } from '../../services/availabilityService';

// SlotCard component for individual time slots
const SlotCard = ({ slot }) => {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-700/50 bg-[#121212] p-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <FiCalendar className="h-4 w-4 text-white" />
          <span className="font-medium text-white">{slot.date}</span>
        </div>

        {slot.time && (
          <div className="flex items-center gap-2 text-gray-400">
            <FiClock className="h-4 w-4 text-white" />
            <span className="text-sm">{slot.time}</span>
          </div>
        )}

        <p className="text-xs text-gray-400">{slot.duration}</p>
      </div>
    </div>
  );
};

// DaySection component for grouping slots by day
const DaySection = ({ group }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-white" />
          <h3 className="font-medium text-white">{group.day}</h3>
        </div>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium text-black" style={{ backgroundColor: '#ffffff' }}>
          {group.availableCount} Available
        </span>
      </div>

      <div className="relative">
        {group.slots.length > 2 && (
          <>
            <button 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-700 p-1 rounded-full shadow-lg"
              onClick={(e) => {
                const container = e.target.closest('.relative').querySelector('.overflow-x-auto');
                container.scrollBy({ left: -150, behavior: 'smooth' });
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button 
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-700 p-1 rounded-full shadow-lg"
              onClick={(e) => {
                const container = e.target.closest('.relative').querySelector('.overflow-x-auto');
                container.scrollBy({ left: 150, behavior: 'smooth' });
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </>
        )}
        <div className="overflow-x-auto hide-scrollbar pb-1 px-4">
          <div className="flex space-x-2 py-1">
            {group.slots.map((slot) => (
              <div key={slot.id} className="flex-shrink-0 w-[130px]">
                <SlotCard slot={slot} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main AvailableSlotsCard component
export const AvailableSlotsCard = ({ className, data, onEdit, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [duration, setDuration] = useState('30');
  const totalAvailable = data.reduce((acc, group) => acc + group.availableCount, 0);

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const toggleTimeSlot = (time) => {
    if (selectedTimeSlots.includes(time)) {
      setSelectedTimeSlots(selectedTimeSlots.filter(slot => slot !== time));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, time]);
    }
  };

  const handleSaveAvailability = async () => {
    if (!selectedDate || selectedTimeSlots.length === 0) {
      alert('Please select a date and at least one time slot');
      return;
    }

    try {
      // Use availability service instead of direct fetch
      const data = await saveAvailability({
        date: selectedDate,
        timeSlots: selectedTimeSlots,
        duration: parseInt(duration)
      });
      
      if (data.success) {
        alert('✅ Availability saved successfully!');
        setSelectedDate('');
        setSelectedTimeSlots([]);
        setIsEditing(false);
        if (onSave) onSave();
      } else {
        alert(data.message || 'Failed to save availability');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Failed to save availability');
    }
  };

  if (isEditing) {
    return (
      <div className={`bg-[#121212] border border-gray-700 rounded-xl shadow-lg overflow-hidden ${className || ''}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FiClock className="w-6 h-6 text-white" />
              <h3 className="text-lg font-semibold text-white">Set Your Availability</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-[#2a2d32] text-white px-2 py-1 rounded-full border border-[#404040]">Active</span>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                title="Close"
              >
                <FiX className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>

          {/* Select Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Select Date</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-[#202327] border border-[#404040] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            />
          </div>

          {/* Available Time Slots */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">Available Time Slots</label>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => toggleTimeSlot(time)}
                  className={`px-3 py-2 ${
                    selectedTimeSlots.includes(time)
                      ? 'bg-white border-white text-black'
                      : 'bg-[#202327] border-[#404040] text-white hover:bg-[#2a2d32]'
                  } border rounded-lg transition-all text-sm font-medium`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Session Duration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Session Duration</label>
            <select 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-[#202327] border border-[#404040] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent appearance-none"
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </div>

          {/* Save Button */}
          <button 
            type="button"
            onClick={handleSaveAvailability}
            className="w-full bg-white hover:bg-gray-200 text-black py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <FiCheck className="w-4 h-4" />
            Save Availability
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden border border-gray-700/50 rounded-lg bg-[#121212] ${className || ''}`}>
      <div className="border-b border-gray-700/50 bg-[#121212] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <FiCalendar className="h-5 w-5 text-white" />
            <div>
              <h3 className="text-base font-semibold text-white">Your Available Slots</h3>
              <p className="text-xs text-gray-400">Select a time that works for you</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="rounded-full bg-[#2a2d32] px-3 py-1 text-xs font-semibold text-white flex items-center gap-1 hover:bg-[#3a3d42] transition-colors"
          >
            <FiEdit className="h-3 w-3 text-white" />
            Edit
          </button>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {data.map((group) => (
          <DaySection key={group.day} group={group} />
        ))}
      </div>
    </div>
  );
};
