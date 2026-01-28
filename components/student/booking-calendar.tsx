"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate, formatTime } from "@/lib/date-utils"

interface Booking {
  _id: string;
  equipmentName: string;
  date: string;
  time?: string;
  status: string;
  createdAt?: string;
}

export function BookingCalendar() {
  const { data: session } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings();
  }, [session])

  const fetchBookings = async () => {
    if (!session?.user) return;

    try {
      const userId = (session.user as any).id || session.user.email;
      const res = await fetch(`/api/bookings?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const days = Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => i + 1)
  const firstDay = getFirstDayOfMonth(currentDate)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => null)

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))

  // Filter bookings for upcoming (future and today)
  const now = new Date();
  const upcomingBookings = bookings
    .filter(b => new Date(b.date) >= new Date(now.toDateString())) // Today or future
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10); // Show max 10 upcoming

  if (loading) return <div className="text-white">Loading calendar...</div>

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              ← Prev
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              Next →
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-semibold text-slate-300 text-sm p-2">
              {day}
            </div>
          ))}
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="p-2"></div>
          ))}
          {days.map((day) => {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            const dayBookings = bookings.filter((b) => {
              const bookingDate = new Date(b.date).toISOString().split('T')[0];
              return bookingDate === dateStr;
            })

            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <div
                key={day}
                className={`p-2 border rounded text-center min-h-[60px] ${isToday
                    ? 'border-blue-500 bg-blue-950/30'
                    : 'border-slate-700'
                  }`}
              >
                <div className={`font-semibold ${isToday ? 'text-blue-400' : 'text-slate-300'}`}>
                  {day}
                </div>
                {dayBookings.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {dayBookings.slice(0, 2).map((booking, idx) => (
                      <div
                        key={idx}
                        className={`text-xs px-1 py-0.5 rounded ${booking.status === "Approved" || booking.status === "Confirmed"
                            ? "bg-green-900/50 text-green-300"
                            : booking.status === "Pending"
                              ? "bg-yellow-900/50 text-yellow-300"
                              : "bg-red-900/50 text-red-300"
                          }`}
                        title={`${booking.equipmentName} - ${booking.status}`}
                      >
                        {booking.equipmentName.substring(0, 8)}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div className="text-xs text-blue-400">
                        +{dayBookings.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Upcoming Bookings</h3>
        {upcomingBookings.length === 0 ? (
          <p className="text-slate-400">No upcoming bookings scheduled.</p>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <div key={booking._id} className="flex justify-between items-center p-3 bg-slate-700 rounded">
                <div>
                  <p className="text-white font-semibold">{booking.equipmentName}</p>
                  <p className="text-slate-400 text-sm">
                    {formatDate(booking.date)} • {booking.time || formatTime(booking.date)}
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded font-semibold ${booking.status === "Approved" || booking.status === "Confirmed"
                      ? "bg-green-900 text-green-300"
                      : booking.status === "Pending"
                        ? "bg-yellow-900 text-yellow-300"
                        : "bg-red-900 text-red-300"
                    }`}
                >
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
