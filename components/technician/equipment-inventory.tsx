"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface Equipment {
  _id: string;
  name: string;
  quantity: number;
  available: number;
  lab?: string;
  status: string;
  category?: string;
  description?: string;
  lastCalibrated?: string;
}

export function EquipmentInventory() {
  const [inventory, setInventory] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    name: "",
    quantity: 1,
    status: "Available",
    category: "General",
    description: "",
  })

  /* New State for Single Row Edit */
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Equipment>>({})

  useEffect(() => {
    fetchInventory();
  }, [])

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/equipment');
      if (res.ok) {
        const data = await res.json();
        setInventory(data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  }

  // Helper to start edit mode
  const startEdit = (item: Equipment) => {
    setEditingId(item._id);
    setEditForm(item);
  }

  // Handle saving the edit form
  const handleSaveEdit = async () => {
    if (!editingId || !editForm) return;

    try {
      const res = await fetch(`/api/equipment/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setInventory(inventory.map(item => item._id === editingId ? { ...item, ...editForm } as Equipment : item));
        setEditingId(null);
        toast.success("Equipment updated");
      } else {
        toast.error("Failed to update");
      }
    } catch (e) {
      toast.error("Error connecting to server");
    }
  }

  // (Removed handleLocalChange and handleUpdate as they are replaced by above)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;

    try {
      const res = await fetch(`/api/equipment/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setInventory(inventory.filter((i) => i._id !== id));
        toast.success("Equipment deleted");
      } else {
        toast.error("Failed to delete");
      }
    } catch (e) {
      toast.error("Error connecting to server");
    }
  }

  const handleAdd = async () => {
    if (!newEquipment.name || !newEquipment.quantity) {
      toast.error("Name and Quantity are required");
      return;
    }

    try {
      const payload = {
        ...newEquipment,
        available: newEquipment.quantity, // Start with all units available
      };
      const res = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const created = await res.json();
        setInventory([...inventory, created]);
        setNewEquipment({ name: "", quantity: 1, status: "Available", category: "General", description: "" });
        setIsAddOpen(false);
        toast.success("Equipment added");
      } else {
        toast.error("Failed to add equipment");
      }
    } catch (e) {
      toast.error("Error connecting to server");
    }
  }

  if (loading) return <div className="text-white">Loading inventory...</div>

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Equipment Inventory</h2>
          <p className="text-slate-400 text-sm">Monitor equipment status and maintenance schedules</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">Add Equipment</Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 text-white border-slate-700">
            <DialogHeader>
              <DialogTitle>Add New Equipment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={newEquipment.name} onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })} className="col-span-3 bg-slate-700 border-slate-600 text-white" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">Quantity</Label>
                <Input id="quantity" type="number" value={newEquipment.quantity} onChange={(e) => setNewEquipment({ ...newEquipment, quantity: parseInt(e.target.value) })} className="col-span-3 bg-slate-700 border-slate-600 text-white" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Input id="category" value={newEquipment.category} onChange={(e) => setNewEquipment({ ...newEquipment, category: e.target.value })} className="col-span-3 bg-slate-700 border-slate-600 text-white" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Input id="description" value={newEquipment.description} onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })} className="col-span-3 bg-slate-700 border-slate-600 text-white" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-3 font-semibold">Equipment</th>
              <th className="text-left p-3 font-semibold">Location</th>
              <th className="text-left p-3 font-semibold">Total Qty</th>
              <th className="text-left p-3 font-semibold">Available</th>
              <th className="text-left p-3 font-semibold">Status</th>
              <th className="text-left p-3 font-semibold">Last Calibrated</th>
              <th className="text-left p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item._id} className="border-b border-slate-700">
                {editingId === item._id ? (
                  <>
                    <td className="p-3">
                      <Input
                        value={editForm.name || ""}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-slate-900 border-slate-600 text-white h-8"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        value={editForm.lab || ""}
                        onChange={(e) => setEditForm({ ...editForm, lab: e.target.value })}
                        placeholder="Lab name"
                        className="bg-slate-900 border border-slate-600 rounded text-white h-8 w-24"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={editForm.quantity}
                        onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 0 })}
                        className="bg-slate-900 border border-slate-600 rounded w-16 px-2 py-1 text-white h-8"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={editForm.available !== undefined ? editForm.available : editForm.quantity}
                        onChange={(e) => setEditForm({ ...editForm, available: parseInt(e.target.value) || 0 })}
                        className="bg-slate-900 border border-slate-600 rounded w-16 px-2 py-1 text-white h-8"
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                      >
                        <option value="Available">Available</option>
                        <option value="Working">Working</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Damaged">Damaged</option>
                        <option value="In Use">In Use</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="date"
                        value={editForm.lastCalibrated || ""}
                        onChange={(e) => setEditForm({ ...editForm, lastCalibrated: e.target.value })}
                        className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white"
                      />
                    </td>
                    <td className="p-3 flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit} className="h-8 bg-green-600 hover:bg-green-700">
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="h-8">
                        Cancel
                      </Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-3 text-white font-semibold">{item.name}</td>
                    <td className="p-3">
                      {item.lab && item.lab !== "" ? <span className="text-orange-400 bg-orange-400/10 px-2 py-1 rounded text-xs">In {item.lab}</span> : <span className="text-slate-500 text-xs italic">Unassigned</span>}
                    </td>
                    <td className="p-3 font-semibold text-emerald-400">{item.quantity}</td>
                    <td className="p-3 font-semibold text-cyan-400">{item.available ?? item.quantity}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-sm ${item.status === "Available" || item.status === "Working"
                        ? "bg-green-900 text-green-300"
                        : item.status === "Damaged"
                          ? "bg-red-900 text-red-300"
                          : "bg-yellow-900 text-yellow-300"
                        }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3">{item.lastCalibrated}</td>
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
        {inventory.length === 0 && <p className="p-4 text-slate-400">No equipment found.</p>}
      </div>
    </div>
  )
}
