"use client"

import { useState, useEffect } from "react"
import { LoginPanel } from "@/components/auth/login-panel"
import { useSession } from "next-auth/react"

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<"admin" | "student" | "technician" | null>(null)
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userRole = ((session.user as any).role || "").toLowerCase()
      if (userRole === "student" || userRole === "technician" || userRole === "admin") {
        setSelectedRole(userRole as any) // Cast back assuming lowercase internal logic is fine, or keep original casing if needed by LoginPanel props.
        // LoginPanel props 'role' expects "student"|"technician"|"admin". So lowercase is correct.
      }
    }
  }, [status, session])

  if (selectedRole) {
    return <LoginPanel role={selectedRole} onBack={() => setSelectedRole(null)} />
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-50 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-50 animate-pulse animation-delay-2000" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-50 animate-pulse animation-delay-4000" />

      <div className="relative z-10 flex items-center justify-center p-4 min-h-screen">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-16">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-md border border-blue-400/30 hover:border-blue-300/50 transition-all duration-300 rounded-2xl p-8 mb-6 inline-block">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
                Lab Equipment Booking
              </h1>
              <p className="text-xl text-cyan-300 font-semibold">
                University-Level Laboratory Management & Learning Platform
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <button
              onClick={() => setSelectedRole("student")}
              className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 hover:border-blue-300/50 backdrop-blur-md transition-all duration-300 rounded-2xl p-8 text-left transform hover:scale-105 hover:shadow-2xl group shadow-lg hover:shadow-xl"
              style={{ filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))" }}
            >
              <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform">👨‍🎓</div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent mb-2">
                Student
              </h3>
              <p className="text-cyan-100/80 text-sm leading-relaxed">
                Book equipment, view procedures, learn experiments
              </p>
            </button>

            <button
              onClick={() => setSelectedRole("technician")}
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 hover:border-purple-300/50 backdrop-blur-md transition-all duration-300 rounded-2xl p-8 text-left transform hover:scale-105 hover:shadow-2xl group shadow-lg hover:shadow-xl"
              style={{ filter: "drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))" }}
            >
              <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform">🔧</div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent mb-2">
                Lab Technician
              </h3>
              <p className="text-purple-100/80 text-sm leading-relaxed">
                Approve bookings, manage inventory, track equipment
              </p>
            </button>

            <button
              onClick={() => setSelectedRole("admin")}
              className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-400/30 hover:border-teal-300/50 backdrop-blur-md transition-all duration-300 rounded-2xl p-8 text-left transform hover:scale-105 hover:shadow-2xl group shadow-lg hover:shadow-xl"
              style={{ filter: "drop-shadow(0 0 8px rgba(20, 184, 166, 0.4))" }}
            >
              <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform">⚙️</div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-200 to-emerald-200 bg-clip-text text-transparent mb-2">
                Administrator
              </h3>
              <p className="text-teal-100/80 text-sm leading-relaxed">Manage users, labs, analytics & reports</p>
            </button>
          </div>


        </div>
      </div>
    </div>
  )
}
