"use client"

import { useState } from "react"
import { BookingApprovals } from "@/components/technician/booking-approvals"
import { EquipmentInventory } from "@/components/technician/equipment-inventory"
import { MaintenanceLog } from "@/components/technician/maintenance-log"
import { StudentHistory } from "@/components/technician/student-history"
import { ExperimentManagement } from "@/components/technician/experiment-management"

export function TechnicianDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("approvals")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1 className="text-xl font-bold text-white">Technician Dashboard</h1>
          <button onClick={onLogout} className="text-slate-400 hover:text-slate-200 text-sm">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: "approvals", label: "Booking Approvals" },
            { id: "inventory", label: "Equipment Inventory" },
            { id: "experiments", label: "Experiments" },
            { id: "maintenance", label: "Maintenance Log" },
            { id: "history", label: "Student History" },
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
          {activeTab === "approvals" && <BookingApprovals />}
          {activeTab === "inventory" && <EquipmentInventory />}
          {activeTab === "experiments" && <ExperimentManagement />}
          {activeTab === "maintenance" && <MaintenanceLog />}
          {activeTab === "history" && <StudentHistory />}
        </div>
      </div>
    </div>
  )
}
