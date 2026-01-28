"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Announcement {
  _id: string;
  title: string;
  content: string;
  date: string;
}

export function AnnouncementCenter() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  // Add Form
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" })
  const [showForm, setShowForm] = useState(false)

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Announcement>>({})

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        setAnnouncements(await res.json());
      }
    } catch (e) {
      toast.error("Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  }

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error("Title and content are required");
      return;
    }

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnnouncement)
      });

      if (res.ok) {
        const created = await res.json();
        setAnnouncements([created, ...announcements]); // Prepend new item
        setNewAnnouncement({ title: "", content: "" });
        setShowForm(false);
        toast.success("Announcement published");
      } else {
        toast.error("Failed to publish");
      }
    } catch (e) {
      toast.error("Server error");
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAnnouncements(prev => prev.filter(a => a._id !== id));
        toast.success("Deleted successfully");
      } else {
        toast.error("Deletion failed");
      }
    } catch (e) {
      toast.error("Server error");
    }
  }

  const startEdit = (item: Announcement) => {
    setEditingId(item._id);
    setEditForm({ ...item });
  }

  const handleUpdate = async () => {
    if (!editingId || !editForm) return;
    try {
      const res = await fetch(`/api/announcements/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        const updated = await res.json();
        setAnnouncements(list => list.map(item => item._id === editingId ? { ...item, ...updated } : item));
        setEditingId(null);
        toast.success("Updated successfully");
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
        <h2 className="text-2xl font-bold text-white">Announcements</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
          {showForm ? "Cancel" : "+ New Announcement"}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Create Announcement</h3>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Announcement title"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
            />
            <Textarea
              placeholder="Announcement content"
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
            />
            <div className="flex gap-2">
              <Button onClick={handleAddAnnouncement} className="flex-1 bg-green-600 hover:bg-green-700">
                Publish
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {loading && <p className="text-slate-400">Loading...</p>}
        {!loading && announcements.length === 0 && <p className="text-slate-400">No announcements yet.</p>}

        {announcements.map((announcement) => (
          <Card key={announcement._id} className="bg-slate-800 border-slate-700 p-4">
            {editingId === announcement._id ? (
              <div className="space-y-3">
                <Input
                  value={editForm.title || ""}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="bg-slate-900 border-slate-600 text-white"
                />
                <Textarea
                  value={editForm.content || ""}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  className="bg-slate-900 border-slate-600 text-white"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleUpdate} className="bg-green-600 hover:bg-green-700">Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-white">{announcement.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{announcement.date}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => startEdit(announcement)}>Edit</Button>
                      <Button size="sm" variant="destructive" className="h-7 text-xs bg-red-600 hover:bg-red-700" onClick={() => handleDelete(announcement._id)}>Delete</Button>
                    </div>
                  </div>
                </div>
                <p className="text-slate-400 text-sm whitespace-pre-wrap">{announcement.content}</p>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
