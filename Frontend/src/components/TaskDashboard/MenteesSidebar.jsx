import React, { useEffect, useState } from "react";
import { Award, BarChart3, Users } from "lucide-react";
import { API_BASE_URL } from "../../config/backendConfig";

export function MenteesSidebar({ selectedMentee, onSelectMentee }) {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenteesAndTasks();
  }, []);

  const fetchMenteesAndTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      
      // Fetch mentees from bookings
      const bookingsResponse = await fetch(`${API_BASE_URL}/bookings/mentor`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const bookingsData = await bookingsResponse.json();
      
      if (!bookingsResponse.ok || !bookingsData.success || !bookingsData.bookings) {
        setLoading(false);
        return;
      }

      // Fetch tasks from configured backend
      const tasksResponse = await fetch(TASK_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      let allTasks = [];
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        allTasks = tasksData.tasks || (Array.isArray(tasksData) ? tasksData : []);
      }

      // Process mentees from bookings with task stats
      const menteesMap = new Map();
      
      bookingsData.bookings.forEach(booking => {
        if (!booking.student) return;
        
        const studentId = booking.student._id;
        if (!menteesMap.has(studentId)) {
          const initials = booking.student.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

          menteesMap.set(studentId, {
            id: studentId,
            name: booking.student.name,
            initials: initials,
            activeTasks: 0,
            completed: 0,
            total: 0,
            streak: 0,
            profilePicture: booking.student.profilePicture
          });
        }
      });

      // Calculate task stats for each mentee
      allTasks.forEach(task => {
        if (task.menteeId) {
          // Convert menteeId to string for comparison (handles both ObjectId and String)
          const menteeIdStr = typeof task.menteeId === 'object' ? task.menteeId._id || task.menteeId.toString() : task.menteeId.toString();
          
          if (menteesMap.has(menteeIdStr)) {
            const mentee = menteesMap.get(menteeIdStr);
            mentee.total += 1;
            
            if (task.status === 'completed') {
              mentee.completed += 1;
            } else if (task.status === 'in-progress') {
              mentee.activeTasks += 1;
            }
          }
        }
      });

      const menteesArray = Array.from(menteesMap.values());
      setMentees(menteesArray);
    } catch (err) {
      console.error('Error fetching mentees and tasks:', err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      <div className="bg-[#121212] rounded-lg shadow-sm border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-white" />
              <h2 className="font-semibold text-white">Mentees</h2>
            </div>
            <span className="bg-gray-700 text-gray-300 text-xs font-medium px-2 py-1 rounded-full">
              {mentees.length}
            </span>
          </div>
        </div>

        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
            </div>
          ) : mentees.length > 0 ? (
            <>
              <button
                onClick={() => onSelectMentee(null)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                  selectedMentee === null ? "bg-[#2a3038] text-white font-medium" : "hover:bg-[#2a3038]/40 text-gray-300"
                }`}
              >
                All Mentees
              </button>

              <div className="mt-2 space-y-1">
                {mentees.map((mentee) => (
                  <button
                    key={mentee.id}
                    onClick={() => onSelectMentee(mentee.id)}
                    className={`w-full p-3 rounded-lg transition-all ${
                      selectedMentee === mentee.id
                        ? "bg-[#2a3038] border-2 border-gray-600"
                        : "hover:bg-[#2a3038]/40 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {mentee.profilePicture ? (
                        <img 
                          src={mentee.profilePicture}
                          alt={mentee.name}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0" style={{display: mentee.profilePicture ? 'none' : 'flex'}}>
                        {mentee.initials}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-medium text-white truncate">{mentee.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">{mentee.activeTasks} active tasks</span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs text-gray-300">
                            {mentee.completed}/{mentee.total} completed
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Award className="w-3 h-3 text-white" />
                            <span>{mentee.streak}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No mentees found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
