import React, { useState } from "react";
import { StudentChatHeader } from "./StudentChatHeader";
import { StudentChatMessages } from "./StudentChatMessages";
import { StudentChatInput } from "./StudentChatInput";
import { StudentContextSidebar } from "./StudentContextSidebar";
import { MentorList } from "./MentorList";

const sampleMentors = [
  {
    id: "1",
    name: "Sarah Mitchell",
    avatar: "",
    role: "Senior Product Manager",
    company: "Google",
    expertise: ["Product Strategy", "User Research", "Roadmapping"],
    lastMessage: "I want you to conduct 3 user interviews using the JTBD framework...",
    lastMessageTime: new Date(Date.now() - 3200000),
    unreadCount: 0,
    isOnline: true,
    sessionsCompleted: 8,
    totalSessions: 12,
  },
  {
    id: "2",
    name: "David Park",
    avatar: "",
    role: "Tech Lead",
    company: "Stripe",
    expertise: ["System Design", "API Architecture", "Team Leadership"],
    lastMessage: "Great progress on the system design module!",
    lastMessageTime: new Date(Date.now() - 86400000),
    unreadCount: 2,
    isOnline: true,
    sessionsCompleted: 4,
    totalSessions: 10,
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    avatar: "",
    role: "VP Engineering",
    company: "Airbnb",
    expertise: ["Engineering Management", "Scaling Teams", "Technical Vision"],
    lastMessage: "Let's schedule our next session for Friday",
    lastMessageTime: new Date(Date.now() - 172800000),
    unreadCount: 0,
    isOnline: false,
    sessionsCompleted: 2,
    totalSessions: 8,
  },
  {
    id: "4",
    name: "Michael Chen",
    avatar: "",
    role: "Staff Engineer",
    company: "Netflix",
    expertise: ["Distributed Systems", "Performance", "Code Review"],
    lastMessage: "The architectural review looks solid",
    lastMessageTime: new Date(Date.now() - 259200000),
    unreadCount: 1,
    isOnline: false,
    sessionsCompleted: 6,
    totalSessions: 6,
  },
];

// Different messages per mentor
const mentorMessages = {
  "1": [
    {
      id: "1",
      content:
        "Welcome to our mentorship session! I've reviewed your progress on the product management roadmap. You're making excellent progress.",
      sender: "mentor",
      type: "normal",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      content:
        "Thank you! I've been focusing on the user research module. I have a question about conducting effective user interviews.",
      sender: "mentee",
      type: "question",
      timestamp: new Date(Date.now() - 3500000),
    },
    {
      id: "3",
      content:
        "Great question! The key is to ask open-ended questions and avoid leading the user. Let them tell their story naturally.",
      sender: "mentor",
      type: "advice",
      timestamp: new Date(Date.now() - 3400000),
    },
    {
      id: "4",
      content:
        "I realized that my previous interviews were too structured. I should focus more on understanding the 'why' behind user behaviors.",
      sender: "mentee",
      type: "insight",
      timestamp: new Date(Date.now() - 3300000),
    },
    {
      id: "5",
      content:
        "Exactly! For your next step, I want you to conduct 3 user interviews using the Jobs-to-be-Done framework and document your findings.",
      sender: "mentor",
      type: "action",
      timestamp: new Date(Date.now() - 3200000),
    },
  ],
  "2": [
    {
      id: "1",
      content: "Let's dive into system design today. I noticed you've been working on the distributed systems module.",
      sender: "mentor",
      type: "normal",
      timestamp: new Date(Date.now() - 90000000),
    },
    {
      id: "2",
      content: "Yes! I'm struggling with understanding when to use eventual consistency vs strong consistency.",
      sender: "mentee",
      type: "question",
      timestamp: new Date(Date.now() - 89000000),
    },
    {
      id: "3",
      content:
        "Think of it this way: strong consistency is like a bank transaction - you need the exact balance. Eventual consistency is like social media likes - a slight delay is acceptable.",
      sender: "mentor",
      type: "advice",
      timestamp: new Date(Date.now() - 88000000),
    },
    {
      id: "4",
      content: "Great progress on the system design module! Your diagram for the URL shortener was well thought out.",
      sender: "mentor",
      type: "normal",
      timestamp: new Date(Date.now() - 86400000),
    },
  ],
  "3": [
    {
      id: "1",
      content:
        "Hi! I wanted to discuss your career trajectory and help you think about the path to engineering management.",
      sender: "mentor",
      type: "normal",
      timestamp: new Date(Date.now() - 200000000),
    },
    {
      id: "2",
      content:
        "I'm torn between staying technical as a Staff Engineer or moving into management. What would you advise?",
      sender: "mentee",
      type: "question",
      timestamp: new Date(Date.now() - 199000000),
    },
    {
      id: "3",
      content:
        "Both paths are equally valid. The key question is: do you get more energy from solving technical problems or from growing people?",
      sender: "mentor",
      type: "insight",
      timestamp: new Date(Date.now() - 198000000),
    },
    {
      id: "4",
      content:
        "Let's schedule our next session for Friday to continue this discussion and create a decision framework for you.",
      sender: "mentor",
      type: "action",
      timestamp: new Date(Date.now() - 172800000),
    },
  ],
  "4": [
    {
      id: "1",
      content:
        "I've reviewed the code you submitted for the performance optimization challenge. Some solid improvements!",
      sender: "mentor",
      type: "normal",
      timestamp: new Date(Date.now() - 300000000),
    },
    {
      id: "2",
      content:
        "Thanks! I focused on reducing database queries by implementing batch loading. Did you notice any other areas for improvement?",
      sender: "mentee",
      type: "question",
      timestamp: new Date(Date.now() - 299000000),
    },
    {
      id: "3",
      content:
        "The batch loading was excellent. Consider also adding caching at the application layer - Redis would be a good fit here.",
      sender: "mentor",
      type: "advice",
      timestamp: new Date(Date.now() - 298000000),
    },
    {
      id: "4",
      content: "The architectural review looks solid. You've completed all the performance modules - congratulations!",
      sender: "mentor",
      type: "normal",
      timestamp: new Date(Date.now() - 259200000),
    },
  ],
};

export function StudentChat() {
  const [activeMentorId, setActiveMentorId] = useState("1");
  const [messagesByMentor, setMessagesByMentor] = useState(mentorMessages);
  const [selectedType, setSelectedType] = useState("normal");

  const activeMentor = sampleMentors.find((m) => m.id === activeMentorId);
  const messages = messagesByMentor[activeMentorId] || [];

  const handleSendMessage = (content) => {
    const newMessage = {
      id: Date.now().toString(),
      content,
      sender: "mentee",
      type: selectedType,
      timestamp: new Date(),
    };
    setMessagesByMentor((prev) => ({
      ...prev,
      [activeMentorId]: [...(prev[activeMentorId] || []), newMessage],
    }));
    setSelectedType("normal");
  };

  return (
    <div className="flex h-full w-full bg-[#121212] overflow-hidden">
      <div className="relative z-10 flex w-full">
        {/* Mentor list sidebar */}
        <div className="hidden md:block w-[280px] flex-shrink-0 h-full">
          <MentorList mentors={sampleMentors} activeMentorId={activeMentorId} onSelectMentor={setActiveMentorId} />
        </div>

        {/* Chat area */}
        <div className="flex flex-col flex-1 h-full min-w-0">
          <StudentChatHeader mentor={activeMentor} />
          <StudentChatMessages messages={messages} />
          <StudentChatInput
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* Context sidebar */}
        <div className="hidden lg:block w-[300px] flex-shrink-0 h-full border-l border-gray-700">
          <StudentContextSidebar mentor={activeMentor} messages={messages} />
        </div>
      </div>
    </div>
  );
}
