"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Search } from "lucide-react"

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

  // Manage Equipment State
  const [managingLab, setManagingLab] = useState<Lab | null>(null)
  const [equipmentList, setEquipmentList] = useState<any[]>([])
  const [addingQty, setAddingQty] = useState<{ [key: string]: number }>({})
  const [searchQuery, setSearchQuery] = useState("")
  const handleQtyChange = (id: string, val: number) => {
    setAddingQty(prev => ({ ...prev, [id]: val }));
  }

  useEffect(() => {
    fetchLabs();
    fetchEquipment();
  }, [])

  const fetchEquipment = async () => {
    try {
      const res = await fetch('/api/equipment');
      if (res.ok) {
        setEquipmentList(await res.json());
      }
    } catch (e) {
      console.error("Failed to load equipment", e);
    }
  }

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

  const openManageEquipment = (lab: Lab) => {
    setManagingLab(lab);
    setSearchQuery("");
    setAddingQty({});
  }

  const assignEquipmentToLab = async (equipmentId: string, labName: string) => {
    try {
      const res = await fetch(`/api/equipment/${equipmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lab: labName })
      });
      if (res.ok) {
        const updated = await res.json();
        setEquipmentList(prev => prev.map(eq => eq._id === equipmentId ? updated : eq));
        toast.success("Added to lab");
        fetchLabs();
      } else {
        toast.error("Update failed");
      }
    } catch (e) {
      toast.error("Server error");
    }
  }

  const allocateToLab = async (eq: any, labName: string) => {
    const availableQty = eq.available !== undefined ? eq.available : eq.quantity;
    const allocQty = addingQty[eq._id] || 1;
    if (allocQty <= 0 || allocQty > availableQty) {
      toast.error(`Invalid quantity. Only ${availableQty} available.`);
      return;
    }

    if (allocQty === eq.quantity) {
      await assignEquipmentToLab(eq._id, labName);
      return;
    }

    try {
      const newEqPayload = { ...eq, lab: labName, quantity: allocQty, available: allocQty };
      delete newEqPayload._id;
      const postRes = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEqPayload)
      });
      if (!postRes.ok) throw new Error("Failed to create split equipment");
      const created = await postRes.json();

      const putRes = await fetch(`/api/equipment/${eq._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: eq.quantity - allocQty, available: (eq.available || eq.quantity) - allocQty })
      });
      if (!putRes.ok) throw new Error("Failed to reduce old equipment");
      const updated = await putRes.json();

      setEquipmentList(prev => [...prev.map(e => e._id === eq._id ? updated : e), created]);
      toast.success(`Allocated ${allocQty} items to lab`);
      fetchLabs();
      setAddingQty(prev => ({ ...prev, [eq._id]: 1 }));
    } catch (e: any) {
      toast.error(e.message || "Error allocating quantity");
    }
  }

  const removeEquipmentFromLab = async (equipmentId: string) => {
    try {
      const res = await fetch(`/api/equipment/${equipmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lab: "" })
      });
      if (res.ok) {
        const updated = await res.json();
        setEquipmentList(prev => prev.map(eq => eq._id === equipmentId ? updated : eq));
        toast.success("Removed from lab");
        fetchLabs();
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
                    <Button size="sm" variant="outline" className="text-blue-400 border-blue-400/30 hover:bg-blue-900/20" onClick={() => openManageEquipment(lab)}>
                      Manage Equipment
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => startEdit(lab)}>
                      Edit
                    </Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleDeleteLab(lab._id)}>
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                  <div>
                    <p className="text-slate-400">Capacity</p>
                    <p className="text-white font-semibold">{lab.capacity} students</p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-slate-400">Unique Types</p>
                      <p className="text-white font-semibold">{equipmentList.filter(eq => eq.lab === lab.name).length}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Total Qty</p>
                      <p className="text-emerald-400 font-semibold">{equipmentList.filter(eq => eq.lab === lab.name).reduce((sum, eq) => sum + (eq.quantity || 0), 0)}</p>
                    </div>
                  </div>
                </div>

              </>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={!!managingLab} onOpenChange={(open) => !open && setManagingLab(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl w-11/12 max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl">Manage Equipment for {managingLab?.name}</DialogTitle>
          </DialogHeader>

          <div className="px-6 py-2 border-b border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <Tabs defaultValue="available" className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6 pt-2">
              <TabsList className="bg-slate-800 grid w-full grid-cols-2">
                <TabsTrigger value="available">Available in Catalog</TabsTrigger>
                <TabsTrigger value="assigned">Assigned to Lab</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <TabsContent value="available" className="mt-0 space-y-3">
                {(() => {
                  const availableItems = equipmentList.filter(eq => (!eq.lab || eq.lab === "") && (eq.available !== undefined ? eq.available : eq.quantity) > 0 && eq.name.toLowerCase().includes(searchQuery.toLowerCase()));
                  return availableItems.length === 0 ? (
                    <p className="text-center text-slate-400 py-8">No available equipment found.</p>
                  ) : (
                    availableItems.map(eq => (
                      <div key={eq._id} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors">
                        <div>
                          <p className="text-white font-semibold">{eq.name}</p>
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <span className="text-slate-400">{eq.category}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-emerald-400 font-medium">Qty: {eq.quantity}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-cyan-400 font-medium">Available: {eq.available !== undefined ? eq.available : eq.quantity}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {(eq.available !== undefined ? eq.available : eq.quantity) > 1 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">Qty:</span>
                              <Input
                                type="number"
                                className="w-16 h-8 text-sm bg-slate-900 border-slate-600 text-white p-2 text-center"
                                value={addingQty[eq._id] || 1}
                                min={1}
                                max={eq.available !== undefined ? eq.available : eq.quantity}
                                onChange={(e) => handleQtyChange(eq._id, parseInt(e.target.value) || 1)}
                              />
                            </div>
                          )}
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 px-4" onClick={() => managingLab && allocateToLab(eq, managingLab.name)}>
                            Add
                          </Button>
                        </div>
                      </div>
                    ))
                  );
                })()}
              </TabsContent>

              <TabsContent value="assigned" className="mt-0 space-y-3">
                {equipmentList.filter(eq => managingLab && eq.lab === managingLab.name && eq.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                  <p className="text-center text-slate-400 py-8">No equipment currently assigned to this lab.</p>
                ) : (
                  equipmentList.filter(eq => managingLab && eq.lab === managingLab.name && eq.name.toLowerCase().includes(searchQuery.toLowerCase())).map(eq => (
                    <div key={eq._id} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors">
                      <div>
                        <p className="text-white font-semibold">{eq.name}</p>
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <span className="text-slate-400">{eq.category}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-emerald-400 font-medium">Qty: {eq.quantity}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-cyan-400 font-medium">Available: {eq.available !== undefined ? eq.available : eq.quantity}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="text-red-400 border-red-900/50 hover:bg-red-900/30 hover:text-red-300" onClick={() => removeEquipmentFromLab(eq._id)}>
                        Remove from lab
                      </Button>
                    </div>
                  ))
                )}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
