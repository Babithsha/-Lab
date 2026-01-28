"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function MaintenanceLog() {
  const [logs, setLogs] = useState<{ id: number; equipment: string; date: string; type: string; notes: string; technician: string }[]>([])

  const [newLog, setNewLog] = useState({ equipment: "", type: "Calibration", notes: "" })

  const handleAddLog = () => {
    if (newLog.equipment && newLog.notes) {
      setLogs([
        ...logs,
        {
          id: logs.length + 1,
          equipment: newLog.equipment,
          date: new Date().toISOString().split("T")[0],
          type: newLog.type,
          notes: newLog.notes,
          technician: "You",
        },
      ])
      setNewLog({ equipment: "", type: "Calibration", notes: "" })
    }
  }

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
          <Button onClick={handleAddLog} className="bg-blue-600 hover:bg-blue-700">
            Add Entry
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
          <Card key={log.id} className="bg-slate-800 border-slate-700 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-white font-semibold">{log.equipment}</h3>
                <p className="text-slate-400 text-sm">
                  {log.date} • {log.type}
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
