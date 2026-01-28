"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

export function AnalyticsReports() {
  const [data, setData] = useState({
    totalBookings: 0,
    activeStudents: 0,
    totalEquipment: 0,
    maintenanceCount: 0,
    utilizationRate: 0,
    topEquipment: [] as { name: string; bookings: number; utilization: string }[]
  })

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          setData(await res.json());
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load analytics");
      }
    }
    fetchAnalytics();
  }, [])

  const stats = [
    { label: "Total Bookings", value: data.totalBookings.toString(), trend: "Real-time" },
    { label: "Equipment Utilization", value: `${data.utilizationRate}%`, trend: "Based on active bookings" },
    { label: "Active Students", value: data.activeStudents.toString(), trend: "Registered students" },
    { label: "Equipment Items", value: data.totalEquipment.toString(), trend: `${data.maintenanceCount} under maintenance` },
  ]

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="bg-slate-800 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">{stat.label}</p>
            <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
            <p className="text-green-400 text-xs mt-2">{stat.trend}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Top Equipment</h3>
        <table className="w-full text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-2 font-semibold">Equipment</th>
              <th className="text-left p-2 font-semibold">Bookings</th>
              <th className="text-left p-2 font-semibold">Utilization</th>
            </tr>
          </thead>
          <tbody>
            {data.topEquipment.length === 0 && <tr><td colSpan={3} className="p-4 text-center">No booking data available.</td></tr>}
            {data.topEquipment.map((eq, idx) => (
              <tr key={idx} className="border-b border-slate-700">
                <td className="p-2 text-white font-semibold">{eq.name}</td>
                <td className="p-2">{eq.bookings}</td>
                <td className="p-2 text-blue-400 font-semibold">{eq.utilization}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Booking Trends</h3>
        <div className="space-y-3">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
            <div key={day} className="flex items-center gap-3">
              <span className="w-12 text-slate-300">{day}</span>
              <div className="flex-1 bg-slate-700 h-6 rounded overflow-hidden">
                <div className="bg-blue-600 h-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-500 text-center mt-2">Data visualization requires sufficient booking history.</p>
        </div>
      </Card>
    </div>
  )
}
