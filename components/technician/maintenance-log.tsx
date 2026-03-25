"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { formatDate } from "@/lib/date-utils"

interface MaintenanceLogType {
  _id?: string;
  equipment: string;
  date: string;
  type: string;
  notes: string;
  technician: string;
}

export function MaintenanceLog() {
  const { data: session } = useSession()
  const [logs, setLogs] = useState<MaintenanceLogType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [newLog, setNewLog] = useState({ equipment: "", type: "Calibration", notes: "" })

  useEffect(() => {
    fetchLogs();
  }, [])

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/maintenance');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      toast.error("Failed to load maintenance logs");
    } finally {
      setLoading(false);
    }
  }

  const handleAddLog = async () => {
    if (!newLog.equipment || !newLog.notes) {
      toast.error("Equipment name and notes are required");
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        equipment: newLog.equipment,
        type: newLog.type,
        notes: newLog.notes,
        technician: session?.user?.name || "Technician",
        date: new Date().toISOString()
      };
      
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const createdLog = await res.json();
        setLogs([createdLog, ...logs]);
        setNewLog({ equipment: "", type: "Calibration", notes: "" });
        toast.success("Maintenance log added successfully");
      } else {
        toast.error("Failed to add log");
      }
    } catch (e) {
      toast.error("Error connecting to server");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-white">Loading maintenance logs...</div>

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Maintenance Log</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Equipment name"
            value={newLog.equipment}
            onChange={(e) => setNewLog({ ...newLog, equipment: e.target.value })}
            className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500"
          />
          <select
            value={newLog.type}
            onChange={(e) => setNewLog({ ...newLog, type: e.target.value })}
            className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
          >
            <option>Calibration</option>
            <option>Repair</option>
            <option>Cleaning</option>
            <option>Replacement</option>
          </select>
          <Button onClick={handleAddLog} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? "Adding..." : "Add Entry"}
          </Button>
        </div>

        <Textarea
          placeholder="Maintenance notes"
          value={newLog.notes}
          onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
          className="mt-3 bg-slate-700 border-slate-600 text-white placeholder-slate-500"
        />
      </div>

      <div className="space-y-3">
        {logs.map((log) => (
          <Card key={log._id} className="bg-slate-800 border-slate-700 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-white font-semibold">{log.equipment}</h3>
                <p className="text-slate-400 text-sm">
                  {formatDate(log.date)} • {log.type}
                </p>
              </div>
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">{log.technician}</span>
            </div>
            <p className="text-slate-400">{log.notes}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
