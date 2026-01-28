"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface Equipment {
  _id?: string;
  name: string;
  category: string;
  status: string;
  quantity: number;
  description: string;
}

export function EquipmentBrowser() {
  const { data: session } = useSession()
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    fetchEquipment();
  }, [])

  const fetchEquipment = async () => {
    try {
      const res = await fetch('/api/equipment');
      if (res.ok) {
        const data = await res.json();
        setEquipmentList(data);
      } else {
        console.error("Failed to fetch equipment");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  const handleBooking = async () => {
    if (!selectedEquipment) return;
    if (!session?.user) {
      toast.error("You must be logged in to book.");
      return;
    }
    setBookingLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId: selectedEquipment._id,
          equipmentName: selectedEquipment.name,
          userId: (session.user as any).id || session.user.email, // Use ID or Email
          userEmail: session.user.email,
          userName: session.user.name,
          date: new Date().toISOString(),
          status: "Pending"
        })
      });

      if (res.ok) {
        toast.success("Equipment booked successfully!");
        setSelectedEquipment(null);
        // Optionally refresh list if quantity updates
      } else {
        toast.error("Booking failed.");
      }
    } catch (err) {
      toast.error("Error connecting to server.");
    } finally {
      setBookingLoading(false);
    }
  }

  const categories = ["All", ...new Set(equipmentList.map((e) => e.category))]
  const filtered = equipmentList.filter(
    (e) =>
      (selectedCategory === "All" || e.category === selectedCategory) &&
      e.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) return <div className="text-white">Loading equipment...</div>

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Browse Equipment</h2>

        <Input
          type="text"
          placeholder="Search equipment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 bg-slate-700 border-slate-600 text-white placeholder-slate-500"
        />

        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded text-sm font-medium transition ${selectedCategory === cat ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((equipment, idx) => (
          <Card
            key={equipment._id || idx}
            className="bg-slate-800 border-slate-700 p-4 cursor-pointer hover:border-blue-500 transition"
            onClick={() => setSelectedEquipment(equipment)}
          >
            <h3 className="text-lg font-semibold text-white mb-2">{equipment.name}</h3>
            <p className="text-slate-400 text-sm mb-3">{equipment.description}</p>
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-300 text-sm">{equipment.category}</span>
              <span
                className={`text-xs px-2 py-1 rounded ${equipment.status === "Available"
                  ? "bg-green-900 text-green-300"
                  : equipment.status === "In Use"
                    ? "bg-yellow-900 text-yellow-300"
                    : "bg-red-900 text-red-300"
                  }`}
              >
                {equipment.status}
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-4">Available: {equipment.quantity}</p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
              Book Now
            </Button>
          </Card>
        ))}
      </div>

      {selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="bg-slate-800 border-slate-700 max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-white mb-4">{selectedEquipment.name}</h3>
            <p className="text-slate-300 mb-4">{selectedEquipment.description}</p>
            <div className="space-y-2 mb-6">
              <p className="text-slate-400">
                <span className="font-semibold text-slate-300">Category:</span> {selectedEquipment.category}
              </p>
              <p className="text-slate-400">
                <span className="font-semibold text-slate-300">Status:</span> {selectedEquipment.status}
              </p>
              <p className="text-slate-400">
                <span className="font-semibold text-slate-300">Available:</span> {selectedEquipment.quantity}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? "Booking..." : "Confirm Booking"}
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent text-white border-slate-600 hover:bg-slate-700" onClick={() => setSelectedEquipment(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
