import React, { useEffect, useState } from "react";
import { Award, BarChart3, Users } from "lucide-react";

export function MenteesSidebar({ selectedMentee, onSelectMentee }) {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentees();
  }, []);

  const fetchMentees = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/bookings/mentor', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success && data.bookings) {
        // Process mentees from bookings
        const menteesMap = new Map();
        
        data.bookings.forEach(booking => {
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

        const menteesArray = Array.from(menteesMap.values());
        setMentees(menteesArray);
      }
    } catch (err) {
      console.error('Error fetching mentees:', err);
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
              <Users className="w-5 h-5 text-gray-400" />
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
                  selectedMentee === null ? "bg-gray-800 text-white font-medium" : "hover:bg-gray-800 text-gray-300"
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
                        ? "bg-gray-800 border-2 border-gray-600"
                        : "hover:bg-gray-800 border-2 border-transparent"
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
                            <Award className="w-3 h-3" />
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

      <div className="bg-gray-800 rounded-lg p-4 text-white shadow-sm border border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-5 h-5" />
          <h3 className="font-semibold">Analytics</h3>
        </div>
        <p className="text-sm text-gray-300 mb-3">Track mentee progress and identify areas for improvement.</p>
        <button className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
          View Analytics
        </button>
      </div>
    </div>
  );
}
