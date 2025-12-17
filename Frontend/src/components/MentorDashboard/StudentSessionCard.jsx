"use client"

import { useState, useEffect } from "react"
import {
  FiCalendar,
  FiClock,
  FiBookOpen,
  FiMapPin,
  FiVideo,
  FiMoreHorizontal,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiMail,
  FiPhone,
  FiTrendingUp,
  FiStar,
} from "react-icons/fi"

// A simplified Dropdown for this context
const Dropdown = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-[#202327] border border-[#404040] rounded-lg shadow-lg z-10"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`block w-full text-left px-4 py-2 text-sm text-[#b3b3b3] hover:bg-[#2a2d32] hover:text-white ${className}`}
  >
    {children}
  </button>
);

// A simplified Dialog for this context
const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-[#404040] rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scroll">
        {children}
      </div>
    </div>
  );
};

export function StudentSessionCard({
  studentName,
  studentEmail,
  studentAvatar,
  studentPhone = "+1 (555) 123-4567",
  courseName,
  courseCode,
  sessionDate,
  sessionTime,
  duration,
  location,
  status,
  sessionType,
  totalSessions,
  completedSessions,
  cancelledSessions,
  missedSessions,
  totalHoursStudied,
  sessionHistory = [
    { id: "1", date: "Dec 1, 2025", course: "Mathematics 101", duration: "1.5 hrs", status: "completed", rating: 5 },
    { id: "2", date: "Nov 28, 2025", course: "Mathematics 101", duration: "1 hr", status: "completed", rating: 4 },
    { id: "3", date: "Nov 25, 2025", course: "Physics 201", duration: "2 hrs", status: "cancelled" },
    { id: "4", date: "Nov 22, 2025", course: "Mathematics 101", duration: "1.5 hrs", status: "completed", rating: 5 },
    { id: "5", date: "Nov 18, 2025", course: "Chemistry 101", duration: "1 hr", status: "missed" },
  ],
  averageRating = 4.7,
  enrollmentDate = "Sep 15, 2025",
  latestSession,
  onJoinSession,
  onConfirmSession,
  onRejectSession,
  onCancelSession,
  onSessionExpired,
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')
  const [sessionStatus, setSessionStatus] = useState(status)

  // Calculate countdown to session
  useEffect(() => {
    const calculateTimeLeft = () => {
      // Parse the session date and time
      const sessionDateTime = new Date(`${sessionDate} ${sessionTime}`)
      const now = new Date()
      const difference = sessionDateTime.getTime() - now.getTime()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`)
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`)
        } else {
          setTimeLeft(`${seconds}s`)
        }
      } else {
        setTimeLeft('Expired')
        setSessionStatus('expired')
        if (onSessionExpired && latestSession) {
          onSessionExpired(latestSession._id)
        }
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [sessionDate, sessionTime])

  const statusConfig = {
    scheduled: { label: "Scheduled", className: "bg-[#2a2d32] text-white border-[#404040]" },
    "in-progress": { label: "In Progress", className: "bg-[#2a2d32] text-white border-[#404040]" },
    completed: { label: "Completed", className: "bg-[#202327] text-[#535353] border-[#404040]" },
    cancelled: { label: "Cancelled", className: "bg-[#202327] text-[#535353] border-[#404040]" },
    confirmed: { label: "Confirmed", className: "bg-[#2a2d32] text-white border-[#404040]" },
    pending: { label: "Pending", className: "bg-[white] text-[#535353] border-[#404040]" },
  }

  const historyStatusConfig = {
    completed: { icon: FiCheckCircle, className: "text-white" },
    cancelled: { icon: FiXCircle, className: "text-white" },
    missed: { icon: FiAlertCircle, className: "text-white" },
  }

  const currentStatus = statusConfig[sessionStatus] || { label: sessionStatus || "Unknown", className: "bg-[#202327] text-[#535353] border-[#404040]" }
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

  return (
    <>
      <div className="w-full max-w-md overflow-hidden border border-[#404040] bg-[#121212] rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
        <div className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#404040]">
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11">
                <img src={studentAvatar || `https://avatar.vercel.sh/${studentEmail}.png`} alt={studentName} className="h-full w-full rounded-full object-cover border-2 border-[#404040]" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{studentName}</h3>
                <p className="text-xs text-[#535353]">{studentEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-1 rounded-md border ${currentStatus.className}`}>
                {currentStatus.label}
              </span>
              <Dropdown
                trigger={
                  <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[#2a2d32]">
                    <FiMoreHorizontal className="h-4 w-4 text-white" />
                    <span className="sr-only">More options</span>
                  </button>
                }
              >
                <DropdownItem onClick={() => setIsDetailsOpen(true)}>View Details</DropdownItem>
                <DropdownItem>Reschedule</DropdownItem>
                <DropdownItem>Send Reminder</DropdownItem>
                <DropdownItem className="text-[#b3b3b3]">Cancel Session</DropdownItem>
              </Dropdown>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="px-5 py-4 border-b border-[#404040]">
            <p className="text-xs font-medium text-[white] uppercase tracking-wide mb-3">Activity Stats</p>
            <div className="grid grid-cols-5 gap-2">
              {[ 
                { icon: FiBookOpen, value: totalSessions, label: 'Total', iconColor: 'text-white' },
                { icon: FiCheckCircle, value: completedSessions, label: 'Done', iconColor: 'text-white' },
                { icon: FiXCircle, value: cancelledSessions, label: 'Cancelled', iconColor: 'text-white' },
                { icon: FiAlertCircle, value: missedSessions, label: 'Missed', iconColor: 'text-white' },
                { icon: FiClock, value: totalHoursStudied, label: 'Hours', iconColor: 'text-white' },
              ].map(({ icon: Icon, value, label, iconColor }) => (
                <div key={label} className="flex flex-col items-center p-2 rounded-lg bg-[#202327]">
                  <Icon className={`h-5 w-5 ${iconColor} mb-1`} />
                  <span className="text-lg font-bold text-white">{value}</span>
                  <span className="text-[10px] text-[#535353] text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Info */}
          <div className="px-5 py-4 border-b border-[#404040] bg-[#121212]">
            <div className="flex items-center gap-2 mb-1">
              <FiBookOpen className="h-4 w-4 text-white" />
              <span className="text-xs font-medium text-[white] uppercase tracking-wide">{courseCode}</span>
            </div>
            <h4 className="font-semibold text-white">{courseName}</h4>
          </div>

          {/* Session Details */}
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiCalendar className="h-5 w-5 text-white" />
                <div>
                  <p className="text-xs text-[#535353]">Date</p>
                  <p className="text-sm font-medium text-white">{sessionDate}</p>
                </div>
              </div>
              {/* Session Countdown */}
              <div className="text-right">
                <p className="text-xs text-[#535353]">Time Until Session</p>
                <p className="text-sm font-medium text-white font-mono">
                  {timeLeft}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiClock className="h-5 w-5 text-white" />
              <div>
                <p className="text-xs text-[#535353]">Time & Duration</p>
                <p className="text-sm font-medium text-white">{sessionTime} · {duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {sessionType === "online" ? <FiVideo className="h-5 w-5 text-white" /> : <FiMapPin className="h-5 w-5 text-white" />}
              <div>
                <p className="text-xs text-[#535353]">{sessionType === "online" ? "Online Session" : "In-Person"}</p>
                <p className="text-sm font-medium text-white">{location}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 py-4 border-t border-[#404040] bg-[#202327] flex gap-2">
            {sessionStatus === 'expired' ? (
              <button 
                disabled
                className="flex-1 py-2 bg-gray-700 text-gray-400 text-sm font-semibold rounded-lg cursor-not-allowed"
              >
                Session Expired
              </button>
            ) : sessionStatus === 'pending' ? (
              <>
                <button 
                  onClick={() => onConfirmSession && latestSession && onConfirmSession(latestSession)}
                  className="flex-1 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Confirm Session
                </button>
                <button 
                  onClick={() => onRejectSession && latestSession && onRejectSession(latestSession)}
                  className="flex-1 py-2 bg-transparent border border-[#404040] text-[#b3b3b3] text-sm font-semibold rounded-lg hover:bg-[#2a2d32] hover:text-white transition-colors"
                >
                  Reject
                </button>
              </>
            ) : sessionStatus === 'confirmed' ? (
              <>
                <button 
                  onClick={() => onJoinSession && latestSession && onJoinSession(latestSession)}
                  className="flex-1 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Join Session
                </button>
                <button 
                  onClick={() => onCancelSession && latestSession && onCancelSession(latestSession)}
                  className="flex-1 py-2 bg-transparent border border-[#404040] text-[#b3b3b3] text-sm font-semibold rounded-lg hover:bg-[#2a2d32] hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => onJoinSession && latestSession && onJoinSession(latestSession)}
                  className="flex-1 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Join Session
                </button>
                <button className="flex-1 py-2 bg-transparent border border-[#404040] text-[#b3b3b3] text-sm font-semibold rounded-lg hover:bg-[#2a2d32] hover:text-white transition-colors">
                  View Details
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Student Details</h2>

          {/* Profile Section */}
          <div className="flex items-center gap-4 p-4 bg-[#202327] rounded-lg">
            <img src={studentAvatar || `https://avatar.vercel.sh/${studentEmail}.png`} alt={studentName} className="h-16 w-16 rounded-full object-cover border-2 border-[#404040]" />
            <div className="flex-1">
              <h3 className="font-semibold text-white text-lg">{studentName}</h3>
              <div className="flex items-center gap-2 text-sm text-[#535353] mt-1">
                <FiMail className="h-3.5 w-3.5 text-white" /><span>{studentEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#535353] mt-0.5">
                <FiPhone className="h-3.5 w-3.5 text-white" /><span>{studentPhone}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-3 bg-[#202327] rounded-lg border border-[#404040]">
              <FiTrendingUp className="h-4 w-4 text-white mb-1" />
              <span className="text-2xl font-bold text-white">{completionRate}%</span>
              <span className="text-xs text-[#535353]">Completion Rate</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-[#202327] rounded-lg border border-[#404040]">
              <FiStar className="h-4 w-4 text-white mb-1" />
              <span className="text-2xl font-bold text-white">{averageRating}</span>
              <span className="text-xs text-[#535353]">Avg Rating</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-[#202327] rounded-lg border border-[#404040]">
              <FiClock className="h-4 w-4 text-white mb-1" />
              <span className="text-2xl font-bold text-white">{totalHoursStudied}</span>
              <span className="text-xs text-[#535353]">Hours Studied</span>
            </div>
          </div>

          {/* Enrollment Info */}
          <div className="flex items-center justify-between p-3 bg-[#202327] rounded-lg">
            <div className="flex items-center gap-2">
              <FiCalendar className="h-4 w-4 text-white" />
              <span className="text-sm text-[#535353]">Enrolled Since</span>
            </div>
            <span className="text-sm font-medium text-white">{enrollmentDate}</span>
          </div>

          {/* Session History */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Recent Sessions</h4>
            <div className="space-y-2">
              {sessionHistory.map((session) => {
                const statusInfo = historyStatusConfig[session.status] || { icon: FiClock, className: "text-[#535353]" }
                const StatusIcon = statusInfo.icon
                return (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-[#202327] rounded-lg">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-4 w-4 ${statusInfo.className}`} />
                      <div>
                        <p className="text-sm font-medium text-white">{session.course}</p>
                        <p className="text-xs text-[#535353]">{session.date} · {session.duration}</p>
                      </div>
                    </div>
                    {session.rating && (
                      <div className="flex items-center gap-1">
                        <FiStar className="h-3.5 w-3.5 text-white" />
                        <span className="text-sm font-medium text-white">{session.rating}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button className="flex-1 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">Schedule Session</button>
            <button onClick={() => setIsDetailsOpen(false)} className="flex-1 py-2 bg-transparent border border-[#404040] text-[#b3b3b3] text-sm font-semibold rounded-lg hover:bg-[#2a2d32] hover:text-white transition-colors">Close</button>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default StudentSessionCard;
