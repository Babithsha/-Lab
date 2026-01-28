"use client"

import { useState } from "react"
import { AdminLabs } from "@/components/admin/admin-labs"
import { AdminEquipment } from "@/components/admin/admin-equipment"
import { AdminBookings } from "@/components/admin/admin-bookings"
import { UserManagement } from "@/components/admin/user-management"
import { AnalyticsReports } from "@/components/admin/analytics-reports"
import { AnnouncementCenter } from "@/components/admin/announcement-center"

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("labs")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <button onClick={onLogout} className="text-slate-400 hover:text-slate-200 text-sm">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: "labs", label: "Manage Labs" },
            { id: "equipment", label: "Equipment" },
            { id: "bookings", label: "Bookings" },
            { id: "users", label: "Users" },
            { id: "analytics", label: "Analytics" },
            { id: "announcements", label: "Announcements" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded font-medium whitespace-nowrap transition ${activeTab === tab.id ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div>
          {activeTab === "labs" && <AdminLabs />}
          {activeTab === "equipment" && <AdminEquipment />}
          {activeTab === "bookings" && <AdminBookings />}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "analytics" && <AnalyticsReports />}
          {activeTab === "announcements" && <AnnouncementCenter />}
        </div>
      </div>
    </div>
  )
}
