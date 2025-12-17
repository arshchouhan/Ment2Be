import Availability from '../models/availability.model.js';

// Helper to normalize various date inputs to 'YYYY-MM-DD'
const normalizeDateString = (input) => {
  if (!input) return '';
  // If already in YYYY-MM-DD keep as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const dateObj = new Date(input);
  if (Number.isNaN(dateObj.getTime())) return input; // fallback – let original value go through
  return dateObj.toISOString().substring(0, 10);
};
import User from '../models/user.model.js';

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return Number.POSITIVE_INFINITY;
  const parts = timeStr.trim().split(' ');
  if (parts.length < 2) return Number.POSITIVE_INFINITY;

  const time = parts[0];
  const period = parts[1].toUpperCase();
  const [hhRaw, mmRaw] = time.split(':');

  const hh = Number(hhRaw);
  const mm = Number(mmRaw);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return Number.POSITIVE_INFINITY;

  let hour24 = hh;
  if (period === 'PM' && hh !== 12) hour24 += 12;
  if (period === 'AM' && hh === 12) hour24 = 0;

  return hour24 * 60 + mm;
};

// Save or update mentor availability
export const saveAvailability = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { date, timeSlots, duration } = req.body;

    // Normalize & validate date
    const formattedDateStr = normalizeDateString(date);

    // Validate required fields
    if (!formattedDateStr || !timeSlots || timeSlots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Date and time slots are required'
      });
    }

    // Validate mentor exists
    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    // Convert time slots to proper format if they're strings
    const formattedTimeSlots = timeSlots.map(slot => {
      // If slot is already an object with startTime/endTime, use it as is
      if (typeof slot === 'object' && slot.startTime && slot.endTime) {
        return {
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBooked: slot.isBooked || false,
          bookingId: slot.bookingId || null
        };
      }
      
      // If slot is a string like "09:00 AM", convert to object format
      if (typeof slot === 'string') {
        // Calculate end time based on duration
        const slotDuration = duration || 60;
        const endTime = calculateEndTime(slot, slotDuration);
        
        return {
          startTime: slot,
          endTime: endTime,
          isBooked: false,
          bookingId: null
        };
      }
      
      // Invalid format
      throw new Error(`Invalid time slot format: ${JSON.stringify(slot)}`);
    });

    // Check if availability already exists for this date
    let availability = await Availability.findOne({
      mentor: mentorId,
      date: formattedDateStr
    });

    if (availability) {
      // Update existing availability
      availability.timeSlots = formattedTimeSlots;
      availability.duration = duration || 60;
      availability.isActive = true;
      await availability.save();
      
      console.log(`[AVAILABILITY] Updated availability for mentor ${mentorId} on ${date}`);
    } else {
      // Create new availability
      availability = new Availability({
        mentor: mentorId,
        date: formattedDateStr,
        timeSlots: formattedTimeSlots,
        duration: duration || 60,
        isActive: true
      });
      await availability.save();
      
      console.log(`[AVAILABILITY] Created new availability for mentor ${mentorId} on ${date}`);
    }

    res.status(201).json({
      success: true,
      data: availability,
      message: 'Availability saved successfully'
    });
  } catch (error) {
    console.error('Error saving availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save availability',
      error: error.message
    });
  }
};

// Helper function to calculate end time
function calculateEndTime(startTime, durationMinutes) {
  // Parse start time (e.g., "09:00 AM")
  const [time, period] = startTime.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  // Convert to 24-hour format
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hours === 12) {
    hour24 = 0;
  }
  
  // Add duration
  const totalMinutes = hour24 * 60 + minutes + durationMinutes;
  const endHour24 = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  
  // Convert back to 12-hour format
  const endHour12 = endHour24 === 0 ? 12 : endHour24 > 12 ? endHour24 - 12 : endHour24;
  const endPeriod = endHour24 >= 12 ? 'PM' : 'AM';
  
  return `${endHour12}:${String(endMinutes).padStart(2, '0')} ${endPeriod}`;
}

// Get available time slots for a mentor on a specific date
export const getAvailableSlots = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { date } = req.query;
    const formattedDateStr = normalizeDateString(date);

    // Validate required parameters
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    // Find availability for the mentor on the specified date
    const availability = await Availability.findOne({
      mentor: mentorId,
      date: formattedDateStr,
      isActive: true
    });

    if (!availability) {
      return res.status(200).json({
        success: true,
        availableSlots: [],
        message: 'No availability found for this date'
      });
    }

    console.log(`[AVAILABILITY] Retrieved slots for mentor ${mentorId} on ${date}`);

    // Filter out booked slots and return only available ones
    // Return as array of startTime strings for frontend compatibility
    const availableSlots = availability.timeSlots
      .filter(slot => !slot.isBooked)
      .map(slot => slot.startTime);

    res.status(200).json({
      success: true,
      availableSlots: availableSlots,
      duration: availability.duration,
      message: 'Available slots retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available slots',
      error: error.message
    });
  }
};

// Get latest availability for a mentor (for dashboard display)
export const getLatestAvailability = async (req, res) => {
  try {
    const { mentorId } = req.params;

    // Find the latest availability for this mentor
    const availability = await Availability.findOne({
      mentor: mentorId,
      isActive: true
    }).sort({ date: -1 });

    if (!availability) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No availability found'
      });
    }

    console.log(`[AVAILABILITY] Retrieved latest availability for mentor ${mentorId}`);

    res.status(200).json({
      success: true,
      data: {
        date: availability.date,
        timeSlots: availability.timeSlots,
        duration: availability.duration
      },
      message: 'Latest availability retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching latest availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch availability',
      error: error.message
    });
  }
};

// Get all availability for authenticated mentor
export const getAvailability = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const availabilities = await Availability.find({
      mentor: mentorId,
      isActive: true
    }).sort({ date: -1 });

    console.log(`[AVAILABILITY] Retrieved ${availabilities.length} availability records for mentor ${mentorId}`);

    res.status(200).json({
      success: true,
      data: availabilities,
      message: 'Availability records retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch availability',
      error: error.message
    });
  }
};

// Get next (earliest upcoming) available slot for a mentor (public)
export const getNextAvailableSlot = async (req, res) => {
  try {
    const { mentorId } = req.params;

    const todayStr = new Date().toISOString().substring(0, 10);

    const availabilities = await Availability.find({
      mentor: mentorId,
      isActive: true,
      date: { $gte: todayStr }
    }).sort({ date: 1 });

    if (!availabilities || availabilities.length === 0) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No upcoming availability found'
      });
    }

    for (const availability of availabilities) {
      const unbooked = (availability.timeSlots || []).filter((slot) => slot && slot.isBooked !== true);
      if (unbooked.length === 0) continue;

      const sorted = [...unbooked].sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
      const first = sorted[0];

      return res.status(200).json({
        success: true,
        data: {
          date: availability.date,
          startTime: first.startTime,
          endTime: first.endTime,
          duration: availability.duration
        },
        message: 'Next available slot retrieved successfully'
      });
    }

    return res.status(200).json({
      success: true,
      data: null,
      message: 'No unbooked slots found'
    });
  } catch (error) {
    console.error('Error fetching next available slot:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch next available slot',
      error: error.message
    });
  }
};

// Delete availability
export const deleteAvailability = async (req, res) => {
  try {
    const { availabilityId } = req.params;
    const mentorId = req.user.id;

    // Find and verify ownership
    const availability = await Availability.findById(availabilityId);
    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability not found'
      });
    }

    if (availability.mentor.toString() !== mentorId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this availability'
      });
    }

    // Soft delete by marking as inactive
    availability.isActive = false;
    await availability.save();

    console.log(`[AVAILABILITY] Deleted availability ${availabilityId} for mentor ${mentorId}`);

    res.status(200).json({
      success: true,
      message: 'Availability deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete availability',
      error: error.message
    });
  }
};

// Quick setup - Set default availability for multiple dates
export const quickSetupAvailability = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { dates, timeSlots, duration } = req.body;

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dates array is required'
      });
    }

    if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Time slots array is required'
      });
    }

    const results = [];
    const errors = [];

    for (let rawDate of dates) {
      const date = normalizeDateString(rawDate);
      try {
        // Format time slots
        const formattedTimeSlots = timeSlots.map(slot => {
          if (typeof slot === 'string') {
            const slotDuration = duration || 60;
            return {
              startTime: slot,
              endTime: calculateEndTime(slot, slotDuration),
              isBooked: false,
              bookingId: null
            };
          }
          return slot;
        });

        // Check if availability exists
        let availability = await Availability.findOne({
          mentor: mentorId,
          date: date
        });

        if (availability) {
          availability.timeSlots = formattedTimeSlots;
          availability.duration = duration || 60;
          availability.isActive = true;
          await availability.save();
        } else {
          availability = new Availability({
            mentor: mentorId,
            date: date,
            timeSlots: formattedTimeSlots,
            duration: duration || 60,
            isActive: true
          });
          await availability.save();
        }

        results.push({ date, success: true });
      } catch (error) {
        errors.push({ date, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Availability set for ${results.length} date(s)`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error in quick setup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup availability',
      error: error.message
    });
  }
};
