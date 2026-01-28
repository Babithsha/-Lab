"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface Lab {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  equipment: number;
}

export function AdminLabs() {
  const [labs, setLabs] = useState<Lab[]>([])
  const [loading, setLoading] = useState(true)

  const [newLab, setNewLab] = useState({ name: "", location: "", capacity: "" })
  const [showForm, setShowForm] = useState(false)

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Lab>>({})

  useEffect(() => {
    fetchLabs();
  }, [])

  const fetchLabs = async () => {
    try {
      const res = await fetch('/api/labs');
      if (res.ok) {
        setLabs(await res.json());
      }
    } catch (e) {
      toast.error("Failed to fetch labs");
    } finally {
      setLoading(false);
    }
  }

  const handleAddLab = async () => {
    if (!newLab.name || !newLab.location || !newLab.capacity) {
      toast.error("All fields are required");
      return;
    }

    try {
      const res = await fetch('/api/labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLab,
          capacity: parseInt(newLab.capacity)
        })
      });

      if (res.ok) {
        const created = await res.json();
        setLabs([...labs, created]);
        setNewLab({ name: "", location: "", capacity: "" });
        setShowForm(false);
        toast.success("Lab added successfully");
      } else {
        toast.error("Failed to add lab");
      }
    } catch (e) {
      toast.error("Server error");
    }
  }

  const handleDeleteLab = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lab?")) return;
    try {
      const res = await fetch(`/api/labs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLabs(labs.filter((l) => l._id !== id));
        toast.success("Lab deleted");
      } else {
        toast.error("Failed to delete");
      }
    } catch (e) {
      toast.error("Server error");
    }
  }

  const startEdit = (lab: Lab) => {
    setEditingId(lab._id);
    setEditForm({ ...lab });
  }

  const handleUpdate = async () => {
    if (!editingId || !editForm) return;
    try {
      const res = await fetch(`/api/labs/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        const updated = await res.json();
        setLabs(labs.map(l => l._id === editingId ? { ...l, ...updated } : l));
        setEditingId(null);
        toast.success("Lab updated");
      } else {
        toast.error("Update failed");
      }
    } catch (e) {
      toast.error("Server error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Manage Labs</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
          {showForm ? "Cancel" : "+ Add Lab"}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Add New Lab</h3>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Lab name"
              value={newLab.name}
              onChange={(e) => setNewLab({ ...newLab, name: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
            />
            <Input
              type="text"
              placeholder="Location"
              value={newLab.location}
              onChange={(e) => setNewLab({ ...newLab, location: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
            />
            <Input
              type="number"
              placeholder="Capacity"
              value={newLab.capacity}
              onChange={(e) => setNewLab({ ...newLab, capacity: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
            />
            <div className="flex gap-2">
              <Button onClick={handleAddLab} className="flex-1 bg-green-600 hover:bg-green-700">
                Save
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {loading && <p className="text-slate-400">Loading labs...</p>}
        {!loading && labs.length === 0 && <p className="text-slate-400">No labs found.</p>}

        {labs.map((lab) => (
          <Card key={lab._id} className="bg-slate-800 border-slate-700 p-4">
            {editingId === lab._id ? (
              <div className="space-y-3">
                <Input
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Lab Name"
                  className="bg-slate-900 border-slate-600 text-white"
                />
                <Input
                  value={editForm.location || ""}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Location"
                  className="bg-slate-900 border-slate-600 text-white"
                />
                <Input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) || 0 })}
                  placeholder="Capacity"
                  className="bg-slate-900 border-slate-600 text-white"
                />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={handleUpdate} className="bg-green-600 hover:bg-green-700">Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{lab.name}</h3>
                    <p className="text-slate-400 text-sm">{lab.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(lab)}>
                      Edit
                    </Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleDeleteLab(lab._id)}>
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Capacity</p>
                    <p className="text-white font-semibold">{lab.capacity} students</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Equipment</p>
                    <p className="text-white font-semibold">{lab.equipment} items</p>
                  </div>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
