"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatDate, formatTime, formatDateTime } from "@/lib/date-utils"

interface BookingRequest {
  _id: string;
  userId: string; // Changed from user to userId to match DB
  userName?: string;
  equipmentName: string;
  date: string;
  time?: string;
  status: string;
  purpose?: string;
  damageFine?: number;
  damageDescription?: string;
  damageReportedBy?: string;
  damageFineAddedAt?: string;
}

export function BookingApprovals() {
  const [requests, setRequests] = useState<BookingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [damageDialogOpen, setDamageDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null)
  const [damageAmount, setDamageAmount] = useState("")
  const [damageDesc, setDamageDesc] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    fetchRequests();
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        // Filter only pending requests for this view, or show all? 
        // Usually approvals view shows Pending, but let's show all for clarity or sort pending first.
        setRequests(data.reverse());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        toast.success(`Booking ${newStatus}`);
        // Update local state
        setRequests(requests.map((r) => (r._id === id ? { ...r, status: newStatus } : r)));
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      toast.error("Error connecting to server");
    }
  }

  const handleApprove = (id: string) => updateStatus(id, "Approved");
  const handleDeny = (id: string) => updateStatus(id, "Denied");

  const openDamageDialog = (booking: BookingRequest, editMode = false) => {
    setSelectedBooking(booking);
    setDamageAmount(booking.damageFine?.toString() || "");
    setDamageDesc(booking.damageDescription || "");
    setIsEditMode(editMode);
    setDamageDialogOpen(true);
  };

  const handleAddDamageFine = async () => {
    if (!selectedBooking) return;

    const fine = parseFloat(damageAmount);
    if (isNaN(fine) || fine <= 0) {
      toast.error("Please enter a valid fine amount");
      return;
    }

    if (!damageDesc.trim()) {
      toast.error("Please enter a damage description");
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${selectedBooking._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          damageFine: fine,
          damageDescription: damageDesc,
          damageReportedBy: "Technician" // Could be dynamic based on logged-in user
        })
      });

      if (res.ok) {
        const updated = await res.json();
        toast.success(isEditMode ? "Damage fine updated successfully" : "Damage fine added successfully");
        setRequests(requests.map((r) => r._id === selectedBooking._id ? updated : r));
        setDamageDialogOpen(false);
        setDamageAmount("");
        setDamageDesc("");
        setSelectedBooking(null);
        setIsEditMode(false);
      } else {
        toast.error("Failed to add damage fine");
      }
    } catch (e) {
      toast.error("Error connecting to server");
    }
  };

  const handleRemoveFine = async () => {
    if (!selectedBooking) return;

    try {
      const res = await fetch(`/api/bookings/${selectedBooking._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          damageFine: 0,
          damageDescription: "",
          damageReportedBy: "",
          damageFineAddedAt: null
        })
      });

      if (res.ok) {
        const updated = await res.json();
        toast.success("Damage fine removed successfully");
        setRequests(requests.map((r) => r._id === selectedBooking._id ? updated : r));
        setDeleteConfirmOpen(false);
        setSelectedBooking(null);
      } else {
        toast.error("Failed to remove damage fine");
      }
    } catch (e) {
      toast.error("Error connecting to server");
    }
  };

  const handleDeleteBooking = async () => {
    if (!selectedBooking) return;

    try {
      const res = await fetch(`/api/bookings/${selectedBooking._id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success("Booking deleted successfully");
        setRequests(requests.filter((r) => r._id !== selectedBooking._id));
        setDeleteConfirmOpen(false);
        setSelectedBooking(null);
      } else {
        toast.error("Failed to delete booking");
      }
    } catch (e) {
      toast.error("Error connecting to server");
    }
  };

  const confirmDeleteFine = (booking: BookingRequest) => {
    setSelectedBooking(booking);
    setDeleteConfirmOpen(true);
  };

  if (loading) return <div className="text-white">Loading requests...</div>

  // Filter to show mostly useful items (Pending at top)
  const sortedRequests = [...requests].sort((a, b) => {
    if (a.status === "Pending" && b.status !== "Pending") return -1;
    if (a.status !== "Pending" && b.status === "Pending") return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white">Booking Requests</h2>
        <p className="text-slate-400 text-sm">Approve or deny student equipment booking requests</p>
      </div>

      <div className="space-y-4">
        {sortedRequests.length === 0 && <p className="text-slate-400">No booking requests found.</p>}
        {sortedRequests.map((request) => (
          <Card key={request._id} className="bg-slate-800 border-slate-700 p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{request.userName || request.userId || "Unknown Student"}</h3>
                <p className="text-slate-400 text-sm">{request.equipmentName}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span
                  className={`text-xs px-3 py-1 rounded font-semibold ${request.status === "Pending"
                    ? "bg-yellow-900 text-yellow-300"
                    : request.status === "Approved" || request.status === "Confirmed"
                      ? "bg-green-900 text-green-300"
                      : "bg-red-900 text-red-300"
                    }`}
                >
                  {request.status}
                </span>
                {request.damageFine && request.damageFine > 0 && (
                  <span className="text-xs px-3 py-1 rounded font-semibold bg-orange-900 text-orange-300">
                    Fine: ₹{request.damageFine}
                  </span>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4 text-slate-300 text-sm">
              <div>
                <p className="text-slate-400">Booking Date & Time</p>
                <p className="font-semibold">
                  {formatDate(request.date)} • {request.time || formatTime(request.date)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Purpose</p>
                <p className="font-semibold">{request.purpose || "Lab Experiment"}</p>
              </div>
            </div>

            {request.damageFine && request.damageFine > 0 && (
              <div className="bg-orange-950/30 border border-orange-900/50 rounded p-3 mb-4">
                <p className="text-orange-400 font-semibold text-sm mb-1">Damage Report</p>
                <p className="text-slate-300 text-sm">{request.damageDescription}</p>
                <p className="text-slate-400 text-xs mt-2">
                  Reported by: {request.damageReportedBy || "Unknown"} •
                  {request.damageFineAddedAt && ` ${formatDateTime(request.damageFineAddedAt)}`}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {request.status === "Pending" && (
                <>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(request._id)}>
                    Approve
                  </Button>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleDeny(request._id)}>
                    Deny
                  </Button>
                </>
              )}
              {(request.status === "Approved" || request.status === "Completed") && (
                <>
                  {!request.damageFine || request.damageFine === 0 ? (
                    <Button
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={() => openDamageDialog(request, false)}
                    >
                      Add Damage Fine
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-600 text-orange-400 hover:bg-orange-950"
                        onClick={() => openDamageDialog(request, true)}
                      >
                        Edit Fine
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-950"
                        onClick={() => confirmDeleteFine(request)}
                      >
                        Remove Fine
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-700 text-red-400 hover:bg-red-950"
                    onClick={() => {
                      setSelectedBooking(request);
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    Delete Booking
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Damage Fine Dialog */}
      <Dialog open={damageDialogOpen} onOpenChange={setDamageDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Equipment Damage Fine" : "Report Equipment Damage"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="damage-amount">Fine Amount (₹)</Label>
              <Input
                id="damage-amount"
                type="number"
                placeholder="Enter fine amount"
                value={damageAmount}
                onChange={(e) => setDamageAmount(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="damage-desc">Damage Description</Label>
              <Textarea
                id="damage-desc"
                placeholder="Describe the damage to the equipment..."
                value={damageDesc}
                onChange={(e) => setDamageDesc(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDamageDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleAddDamageFine}>
              {isEditMode ? "Update Fine" : "Add Fine"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              {selectedBooking?.damageFine && selectedBooking.damageFine > 0 ? (
                <>
                  Are you sure you want to remove the damage fine of ₹{selectedBooking.damageFine}?
                  This action cannot be undone.
                  <br /><br />
                  <strong>Or</strong> do you want to delete the entire booking?
                </>
              ) : (
                "Are you sure you want to delete this booking? This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            {selectedBooking?.damageFine && selectedBooking.damageFine > 0 && (
              <AlertDialogAction
                className="bg-orange-600 hover:bg-orange-700"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveFine();
                }}
              >
                Remove Fine Only
              </AlertDialogAction>
            )}
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteBooking();
              }}
            >
              Delete Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
