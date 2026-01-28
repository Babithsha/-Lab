"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface Equipment {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  description?: string;
  status?: string;
  lastCalibrated?: string;
}

export function AdminEquipment() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)

  // Add Form State
  const [newEquipment, setNewEquipment] = useState<{ name: string, category: string, quantity: number | string, description: string }>({ name: "", category: "", quantity: "", description: "" })
  const [showForm, setShowForm] = useState(false)

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Equipment>>({})

  useEffect(() => {
    fetchEquipment();
  }, [])

  const fetchEquipment = async () => {
    try {
      const res = await fetch('/api/equipment');
      if (res.ok) {
        const data = await res.json();
        // Ensure data is array
        setEquipmentList(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      toast.error("Failed to fetch equipment");
      setEquipmentList([]);
    } finally {
      setLoading(false);
    }
  }

  const handleAddEquipment = async () => {
    if (!newEquipment.name || !newEquipment.quantity) {
      toast.error("Name and Quantity are required");
      return;
    }

    try {
      const payload = {
        ...newEquipment,
        quantity: Number(newEquipment.quantity),
        status: "Available" // Default
      };
      const res = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        setEquipmentList(prev => [...prev, created]);
        setNewEquipment({ name: "", category: "", quantity: "", description: "" });
        setShowForm(false);
        toast.success("Equipment added successfully");
      } else {
        toast.error("Failed to add equipment");
      }
    } catch (e) {
      toast.error("Error connecting to server");
    }
  }

  const startEdit = (item: Equipment) => {
    setEditingId(item._id);
    setEditForm({ ...item }); // Clone to prevent ref issues
  }

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  }

  const handleUpdate = async () => {
    if (!editingId || !editForm) return;
    try {
      const res = await fetch(`/api/equipment/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        const updated = await res.json();
        // Update local list with server response or local form
        setEquipmentList(list => list.map(item => item._id === editingId ? { ...item, ...updated } : item));
        setEditingId(null);
        toast.success("Equipment updated");
      } else {
        toast.error("Update failed");
      }
    } catch (e) {
      toast.error("Server error");
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`/api/equipment/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEquipmentList(prev => prev.filter(item => item._id !== id));
        toast.success("Equipment deleted");
      } else {
        toast.error("Delete failed");
      }
    } catch (e) {
      toast.error("Server error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Manage Equipment</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
          {showForm ? "Cancel Add" : "+ Add Equipment"}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Add New Equipment</h3>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Equipment name"
              value={newEquipment.name}
              onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
            />
            <Input
              type="text"
              placeholder="Category"
              value={newEquipment.category}
              onChange={(e) => setNewEquipment({ ...newEquipment, category: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
            />
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Quantity"
                value={newEquipment.quantity}
                onChange={(e) => setNewEquipment({ ...newEquipment, quantity: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
              />
              <Input
                type="text"
                placeholder="Description"
                value={newEquipment.description}
                onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddEquipment} className="flex-1 bg-green-600 hover:bg-green-700">
                Save
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-3 font-semibold">Equipment</th>
              <th className="text-left p-3 font-semibold">Category</th>
              <th className="text-left p-3 font-semibold">Quantity</th>
              <th className="text-left p-3 font-semibold">Description</th>
              <th className="text-left p-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>}
            {!loading && equipmentList.length === 0 && <tr><td colSpan={5} className="p-4 text-center">No equipment found.</td></tr>}

            {equipmentList.map((item) => (
              <tr key={item._id} className="border-b border-slate-700">
                {editingId === item._id ? (
                  <>
                    <td className="p-3"><Input value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="bg-slate-900 border-slate-600 text-white h-8" /></td>
                    <td className="p-3"><Input value={editForm.category || ""} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="bg-slate-900 border-slate-600 text-white h-8" /></td>
                    <td className="p-3"><Input type="number" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 0 })} className="bg-slate-900 border-slate-600 text-white h-8 w-20" /></td>
                    <td className="p-3"><Input value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="bg-slate-900 border-slate-600 text-white h-8" /></td>
                    <td className="p-3 flex gap-4">
                      <Button size="sm" onClick={handleUpdate} className="bg-green-600 hover:bg-green-700 h-8">Save</Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit} className="h-8">Cancel</Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-3 text-white font-semibold">{item.name}</td>
                    <td className="p-3">{item.category}</td>
                    <td className="p-3">{item.quantity}</td>
                    <td className="p-3">{item.description}</td>
                    <td className="p-3 flex gap-4">
                      <Button size="sm" variant="outline" onClick={() => startEdit(item)} className="mr-1 h-8">
                        Edit
                      </Button>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 ml-1 h-8" onClick={() => handleDelete(item._id)}>
                        Delete
                      </Button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
