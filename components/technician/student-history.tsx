"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface StudentData {
  _id: string;
  name: string;
  email: string;
  bookings: number;
  equipment: string[];
}

export function StudentHistory() {
  const [students, setStudents] = useState<StudentData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchStudentHistory();
  }, [])

  const fetchStudentHistory = async () => {
    try {
      // Fetch all users who are students
      const usersRes = await fetch('/api/users');
      const users = usersRes.ok ? await usersRes.json() : [];

      // Fetch all bookings
      const bookingsRes = await fetch('/api/bookings');
      const bookings = bookingsRes.ok ? await bookingsRes.json() : [];

      // Filter for students only and calculate their stats
      const studentUsers = users.filter((u: any) => u.role?.toLowerCase() === 'student');

      const studentData = studentUsers.map((student: any) => {
        const studentBookings = bookings.filter((b: any) =>
          b.userId === student._id || b.userEmail === student.email
        );

        const uniqueEquipment = [...new Set(studentBookings.map((b: any) => b.equipmentName))];

        return {
          _id: student._id,
          name: student.name || 'Unknown',
          email: student.email,
          bookings: studentBookings.length,
          equipment: uniqueEquipment
        };
      });

      setStudents(studentData);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load student history");
    } finally {
      setLoading(false);
    }
  }

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Student History</h2>
        <Input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-3 font-semibold">Student Name</th>
              <th className="text-left p-3 font-semibold">Email</th>
              <th className="text-left p-3 font-semibold">Total Bookings</th>
              <th className="text-left p-3 font-semibold">Equipment Used</th>
              <th className="text-left p-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="p-4 text-center">Loading...</td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center">No student data found.</td>
              </tr>
            )}
            {filtered.map((student) => (
              <tr key={student._id} className="border-b border-slate-700">
                <td className="p-3 text-white font-semibold">{student.name}</td>
                <td className="p-3">{student.email}</td>
                <td className="p-3 text-blue-400 font-semibold">{student.bookings}</td>
                <td className="p-3">
                  {student.equipment.length > 0
                    ? student.equipment.slice(0, 3).join(", ") + (student.equipment.length > 3 ? "..." : "")
                    : "None"
                  }
                </td>
                <td className="p-3">
                  <span className={student.bookings > 0 ? "text-green-400" : "text-slate-400"}>
                    {student.bookings > 0 ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
