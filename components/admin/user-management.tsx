"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Add User State
  const [showForm, setShowForm] = useState(false)
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Student", password: "password123" })

  // Edit User State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<User>>({})

  useEffect(() => {
    fetchUsers();
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error("Name and Email are required");
      return;
    }
    // Simple basic validation
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        const created = await res.json();
        setUsers([...users, created]);
        setNewUser({ name: "", email: "", role: "Student", password: "password123" });
        setShowForm(false);
        toast.success("User added successfully");
      } else {
        toast.error("Failed to add user");
      }
    } catch (e) {
      toast.error("Server error");
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== id));
        toast.success("User deleted");
      } else {
        toast.error("Failed to delete user");
      }
    } catch (e) {
      toast.error("Server error");
    }
  }

  const startEdit = (user: User) => {
    setEditingId(user._id);
    setEditForm({ ...user });
  }

  const handleUpdate = async () => {
    if (!editingId || !editForm) return;
    try {
      const res = await fetch(`/api/users/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map(u => u._id === editingId ? { ...u, ...updated } : u));
        setEditingId(null);
        toast.success("User updated");
      } else {
        toast.error("Failed to update user");
      }
    } catch (e) {
      toast.error("Server error");
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 w-64"
          />
          <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
            {showForm ? "Cancel" : "+ Add User"}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Add New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Name</label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Email</label>
              <Input
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Role</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-md h-10 px-3 text-white"
              >
                <option value="Student">Student</option>
                <option value="Technician">Technician</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <Button onClick={handleAddUser} className="bg-green-600 hover:bg-green-700">
              Save User
            </Button>
          </div>
        </Card>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-3 font-semibold">Name</th>
              <th className="text-left p-3 font-semibold">Email</th>
              <th className="text-left p-3 font-semibold">Role</th>
              <th className="text-left p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={4} className="p-4 text-center">No users found.</td></tr>}
            {filtered.map((user) => (
              <tr key={user._id} className="border-b border-slate-700">
                {editingId === user._id ? (
                  <>
                    <td className="p-3">
                      <Input
                        value={editForm.name || ""}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-slate-900 border-slate-600 h-8 text-white"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        value={editForm.email || ""}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="bg-slate-900 border-slate-600 h-8 text-white"
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                      >
                        <option value="Student">Student</option>
                        <option value="Technician">Technician</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-3 flex gap-2">
                      <Button size="sm" onClick={handleUpdate} className="bg-green-600 hover:bg-green-700 h-8">Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="h-8">Cancel</Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-3 text-white font-semibold">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <span className={`bg-slate-700 text-slate-300 px-3 py-1 rounded text-xs font-semibold uppercase`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(user)} className="h-8">Edit</Button>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 h-8" onClick={() => handleDeleteUser(user._id)}>Delete</Button>
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
