"use client"

import { useState } from "react"
import { EquipmentBrowser } from "@/components/student/equipment-browser"
import { BookingCalendar } from "@/components/student/booking-calendar"
import { ExperimentLibrary } from "@/components/student/experiment-library"
import { StudentBookings } from "@/components/student/student-bookings"
import { ChatBot } from "@/components/chatbot/chatbot"

export function StudentDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("browse")
  const [showChat, setShowChat] = useState(false)

  const tabs = [
    { id: "browse", label: "Browse Equipment" },
    { id: "experiments", label: "Experiments" },
    { id: "bookings", label: "My Bookings" },
    { id: "calendar", label: "Booking Calendar" },
  ]

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950 -z-10" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-40 -z-10 animate-pulse" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-40 -z-10 animate-pulse animation-delay-2000" />

      <nav className="bg-white/5 backdrop-blur-md sticky top-0 z-40 border-b border-white/10 rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Student Dashboard
          </h1>
          <button
            onClick={onLogout}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-2 mb-8">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                  : "bg-white/5 text-cyan-200 hover:bg-white/10"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          {activeTab === "browse" && <EquipmentBrowser />}
          {activeTab === "experiments" && <ExperimentLibrary />}
          {activeTab === "bookings" && <StudentBookings />}
          {activeTab === "calendar" && <BookingCalendar />}
        </div>

        <button
          onClick={() => setShowChat(!showChat)}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all transform hover:scale-110 active:scale-95"
          style={{ filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))" }}
          title="Open AI Assistant"
        >
          💬
        </button>

        {showChat && (
          <div className="fixed bottom-28 right-8 w-96 h-[500px] bg-white/5 backdrop-blur-md shadow-2xl z-50 border border-white/10 rounded-2xl overflow-hidden">
            <ChatBot onClose={() => setShowChat(false)} />
          </div>
        )}
      </div>
    </div>
  )
}
