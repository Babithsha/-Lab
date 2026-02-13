"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StudentDashboard } from "@/components/dashboards/student-dashboard"
import { TechnicianDashboard } from "@/components/dashboards/technician-dashboard"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { signIn, useSession, signOut } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface LoginPanelProps {
  role: "admin" | "student" | "technician"
  onBack: () => void
}

export function LoginPanel({ role, onBack }: LoginPanelProps) {
  const { data: session } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("signin")

  // Auto-redirect or show dashboard if logged in
  if (session?.user) {
    const userRole = ((session.user as any).role || "").toLowerCase();
    const targetRole = role.toLowerCase();

    if (userRole === targetRole) {
      if (targetRole === "student") return <StudentDashboard onLogout={() => signOut()} />
      if (targetRole === "technician") return <TechnicianDashboard onLogout={() => signOut()} />
      return <AdminDashboard onLogout={() => signOut()} />
    } else {
      // Mismatched role
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white bg-slate-900">
          <p className="mb-4">You are logged in as {(session.user as any).role}, but this is the {role} portal.</p>
          <Button onClick={() => signOut()}>Logout</Button>
        </div>
      )
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate inputs
      if (!email || !password) {
        toast.error("Please enter both email and password")
        setIsLoading(false)
        return
      }

      // Use NextAuth Credentials Provider
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Show detailed error message
        toast.error("Incorrect email or password", {
          description: "Please check your credentials and try again.",
          duration: 4000,
        })
      } else if (result?.ok) {
        toast.success("Login Successful!", {
          description: `Welcome back! Redirecting to ${role} dashboard...`,
          duration: 3000,
        })
        // Clear form
        setEmail("")
        setPassword("")
      }
    } catch (err) {
      console.error("Login error:", err)
      toast.error("Login Failed", {
        description: "An unexpected error occurred. Please try again later.",
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate inputs
      if (!name || !email || !password) {
        toast.error("Please fill in all fields")
        setIsLoading(false)
        return
      }

      if (password.length < 8) {
        toast.error("Password must be at least 8 characters long")
        setIsLoading(false)
        return
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      if (res.ok) {
        toast.success("Account Created Successfully! 🎉", {
          description: "You can now sign in with your credentials.",
          duration: 4000,
        });
        // Clear form fields
        setName("");
        setEmail("");
        setPassword("");
        // Switch to sign-in tab
        setActiveTab("signin");
      } else {
        const data = await res.json();
        toast.error(data.error || "Registration failed", {
          description: "Please try again with different credentials.",
          duration: 4000,
        });
      }
    } catch (err) {
      console.error("Signup error:", err)
      toast.error("Something went wrong", {
        description: "Please check your connection and try again.",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const roleTitle = {
    student: "Student Portal",
    technician: "Technician Portal",
    admin: "Admin Portal",
  }

  const roleConfig = {
    student: {
      bgGradient: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-400/30 hover:border-blue-300/50",
      titleGradient: "from-cyan-300 to-blue-300",
      shadow: "rgba(59, 130, 246, 0.4)",
    },
    technician: {
      bgGradient: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-400/30 hover:border-purple-300/50",
      titleGradient: "from-purple-300 to-pink-300",
      shadow: "rgba(168, 85, 247, 0.4)",
    },
    admin: {
      bgGradient: "from-teal-500/10 to-emerald-500/10",
      borderColor: "border-teal-400/30 hover:border-teal-300/50",
      titleGradient: "from-teal-300 to-emerald-300",
      shadow: "rgba(20, 184, 166, 0.4)",
    },
  }

  const config = roleConfig[role]

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-40 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-40 animate-pulse animation-delay-2000" />

      <div className="relative z-10 flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-md">
          <button
            onClick={onBack}
            className="text-cyan-300 hover:text-cyan-200 mb-8 flex items-center gap-2 font-semibold transition-colors"
          >
            ← Back to Roles
          </button>

          <div
            className={`bg-gradient-to-br ${config.bgGradient} ${config.borderColor} backdrop-blur-md border transition-all duration-300 rounded-2xl p-8`}
          >
            <div className="mb-6 text-center">
              <h2
                className={`text-3xl font-bold bg-gradient-to-r ${config.titleGradient} bg-clip-text text-transparent mb-2`}
              >
                {roleTitle[role]}
              </h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/20">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-cyan-300 mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/5 border border-white/20 text-white placeholder-white/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-cyan-300 mb-2">Password</label>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 border border-white/20 text-white placeholder-white/40"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-2"
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>

                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-transparent px-2 text-slate-400">Or continue with</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    className="w-full mt-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold border border-gray-300 flex items-center justify-center gap-2"
                    onClick={() => signIn("google")}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign in with Google (@klu.ac.in)
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-cyan-300 mb-2">Full Name</label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white/5 border border-white/20 text-white placeholder-white/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-cyan-300 mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/5 border border-white/20 text-white placeholder-white/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-cyan-300 mb-2">Password</label>
                    <Input
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 border border-white/20 text-white placeholder-white/40"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2"
                  >
                    {isLoading ? "Creating Account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>


          </div>
        </div>
      </div>
    </div>
  )
}
