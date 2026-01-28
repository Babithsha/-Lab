"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { formatDate, formatTime, formatDateTime } from "@/lib/date-utils"

interface Booking {
  _id: string;
  equipmentName: string;
  lab?: string; // might be missing in simplified model
  date: string;
  time?: string;
  status: string;
  createdAt?: string;
  damageFine?: number;
  damageDescription?: string;
  damageReportedBy?: string;
  damageFineAddedAt?: string;
}

export function StudentBookings() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      if (!session?.user) return;
      try {
        const userId = (session.user as any).id || session.user.email;
        const res = await fetch(`/api/bookings?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setBookings(data.reverse()); // Show newest first
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [session])

  const handleCancel = (id: string) => {
    // Ideally call API to cancel
    setBookings(bookings.map((b) => (b._id === id ? { ...b, status: "Cancelled" } : b)))
  }

  const handleReschedule = (id: string) => {
    alert("Reschedule functionality - Select new time slot")
  }

  if (loading) return <div className="text-white">Loading bookings...</div>

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white">My Bookings</h2>
        <p className="text-slate-400 text-sm">View and manage your equipment bookings</p>
      </div>

      <div className="space-y-4">
        {bookings.length === 0 && <p className="text-slate-400">No bookings found.</p>}
        {bookings.map((booking, idx) => (
          <Card key={booking._id || idx} className="bg-slate-800 border-slate-700 p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{booking.equipmentName}</h3>
                <p className="text-slate-400 text-sm">{booking.lab || "Main Lab"}</p>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded font-semibold ${booking.status === "Approved" || booking.status === "Confirmed"
                    ? "bg-green-900 text-green-300"
                    : booking.status === "Pending" || booking.status === "Pending Approval"
                      ? "bg-yellow-900 text-yellow-300"
                      : booking.status === "Denied"
                        ? "bg-red-900 text-red-300"
                        : "bg-blue-900 text-blue-300"
                  }`}
              >
                {booking.status}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4 text-slate-300 text-sm">
              <div>
                <p className="text-slate-400">Booking Date & Time</p>
                <p className="font-semibold">
                  {formatDate(booking.date)} • {booking.time || formatTime(booking.date)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Booked On</p>
                <p className="font-semibold">{booking.createdAt ? formatDateTime(booking.createdAt) : 'N/A'}</p>
              </div>
            </div>

            {booking.damageFine && booking.damageFine > 0 && (
              <div className="bg-orange-950/30 border border-orange-900/50 rounded p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-orange-400 font-semibold text-sm">⚠️ Damage Fine</p>
                  <p className="text-orange-300 font-bold text-lg">₹{booking.damageFine}</p>
                </div>
                <p className="text-slate-300 text-sm mb-2">{booking.damageDescription}</p>
                <p className="text-slate-400 text-xs">
                  Reported by: {booking.damageReportedBy || "Technician"} •
                  {booking.damageFineAddedAt && ` ${formatDateTime(booking.damageFineAddedAt)}`}
                </p>
              </div>
            )}

            {booking.status === "Confirmed" && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleReschedule(booking._id)}>
                  Reschedule
                </Button>
                <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleCancel(booking._id)}>
                  Cancel
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
