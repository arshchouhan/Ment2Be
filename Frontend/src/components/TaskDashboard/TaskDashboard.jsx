import React, { useState } from "react";
import { Header } from "./Header";
import { StatsCards } from "./StatsCards";
import { MenteesSidebar } from "./MenteesSidebar";
import { TasksSection } from "./TasksSection";
import { CreateTaskModal } from "./CreateTaskModal";

export function TaskDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState(null);

  return (
    <div className="min-h-screen bg-[#202327]">
      <Header onCreateTask={() => setIsModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <StatsCards />

        <div className="mt-6 flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/4">
            <MenteesSidebar selectedMentee={selectedMentee} onSelectMentee={setSelectedMentee} />
          </div>
          <div className="w-full lg:w-3/4">
            <TasksSection selectedMentee={selectedMentee} />
          </div>
        </div>
      </main>

      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
