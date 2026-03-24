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
  available?: number;
  lab?: string;
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
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (e.available !== undefined ? e.available : e.quantity) > 0
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

      <div className="space-y-12">
        {Object.entries(filtered.reduce((acc, eq) => {
          const lab = eq.lab && eq.lab !== "" ? eq.lab : "Unassigned / General Pool";
          if (!acc[lab]) acc[lab] = [];
          acc[lab].push(eq);
          return acc;
        }, {} as Record<string, Equipment[]>)).map(([labName, labEquipments]) => (
          <div key={labName} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-700 pb-2">
              <h3 className="text-xl font-bold text-blue-400 flex items-center gap-3">
                {labName !== "Unassigned / General Pool" ? "🔬" : "📦"}{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{labName}</span>
                <span className="text-xs font-semibold px-2 py-1 bg-slate-800 text-slate-400 rounded-full border border-slate-700 shadow-sm ml-2">
                  {labEquipments.length} Items
                </span>
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {labEquipments.map((equipment, idx) => (
                <Card
                  key={equipment._id || idx}
                  className="bg-slate-800/80 backdrop-blur-sm border-slate-700 p-5 cursor-pointer hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => setSelectedEquipment(equipment)}
                >
                  <h3 className="text-lg font-bold text-white mb-2 leading-tight">{equipment.name}</h3>
                  <p className="text-slate-400 text-xs mb-4 line-clamp-2 h-8">{equipment.description}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-300 text-xs font-medium px-2 py-1 bg-slate-900 rounded">{equipment.category}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium shadow-sm ${equipment.status === "Available"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : equipment.status === "In Use"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                    >
                      {equipment.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2 mb-5 text-sm bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs">Total Qty</span>
                      <span className="text-slate-300 font-semibold text-xs">{equipment.quantity} units</span>
                    </div>
                    <div className="h-px bg-slate-800 w-full"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm font-medium">Available</span>
                      <span className="text-cyan-400 font-bold text-lg">{equipment.available !== undefined ? equipment.available : equipment.quantity}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-900/50 font-semibold" size="sm">
                    View & Book
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700 border-dashed">
            <div className="text-4xl mb-4 opacity-50">🔍</div>
            <h3 className="text-lg font-medium text-slate-300 mb-1">No equipment found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your search criteria or viewing a different category.</p>
          </div>
        )}
      </div>

      {selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="bg-slate-800 border-slate-700 max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-white mb-4">{selectedEquipment.name}</h3>
            <p className="text-slate-300 mb-4">{selectedEquipment.description}</p>
            <div className="space-y-2 mb-6">
              <p className="text-slate-400 flex justify-between">
                <span className="font-semibold text-slate-300">Category:</span> {selectedEquipment.category}
              </p>
              <p className="text-slate-400 flex justify-between">
                <span className="font-semibold text-slate-300">Location:</span> {selectedEquipment.lab && selectedEquipment.lab !== "" ? selectedEquipment.lab : "Unassigned"}
              </p>
              <p className="text-slate-400 flex justify-between">
                <span className="font-semibold text-slate-300">Status:</span> {selectedEquipment.status}
              </p>
              <p className="text-slate-400 flex justify-between">
                <span className="font-semibold text-slate-300">Total Qty:</span> <span className="text-white">{selectedEquipment.quantity}</span>
              </p>
              <p className="text-slate-400 flex justify-between">
                <span className="font-semibold text-slate-300">Available:</span> <span className="text-cyan-400 font-bold">{selectedEquipment.available !== undefined ? selectedEquipment.available : selectedEquipment.quantity}</span>
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
