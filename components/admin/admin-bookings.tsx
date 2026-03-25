"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { formatDate, formatTime, formatDateTime } from "@/lib/date-utils"

interface Booking {
    _id: string;
    userId: string;
    userName?: string;
    userEmail?: string;
    equipmentName: string;
    date: string;
    time?: string;
    status: string;
    createdAt?: string;
    damageFine?: number;
    damageDescription?: string;
    damageReportedBy?: string;
    damageFineAddedAt?: string;
    returnedAt?: string;
    returnedBy?: string;
}

export function AdminBookings() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>("all") // all, with-fines, no-fines
    const [searchTerm, setSearchTerm] = useState("")
    const [damageDialogOpen, setDamageDialogOpen] = useState(false)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [damageAmount, setDamageAmount] = useState("")
    const [damageDesc, setDamageDesc] = useState("")
    const [isEditMode, setIsEditMode] = useState(false)

    useEffect(() => {
        fetchBookings();
    }, [])

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/bookings');
            if (res.ok) {
                const data = await res.json();
                setBookings(data.reverse());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const openDamageDialog = (booking: Booking, editMode = false) => {
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
                    damageReportedBy: "Admin"
                })
            });

            if (res.ok) {
                const updated = await res.json();
                toast.success(isEditMode ? "Damage fine updated successfully" : "Damage fine added successfully");
                setBookings(bookings.map((r) => r._id === selectedBooking._id ? updated : r));
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
                setBookings(bookings.map((r) => r._id === selectedBooking._id ? updated : r));
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
                setBookings(bookings.filter((r) => r._id !== selectedBooking._id));
                setDeleteConfirmOpen(false);
                setSelectedBooking(null);
            } else {
                toast.error("Failed to delete booking");
            }
        } catch (e) {
            toast.error("Error connecting to server");
        }
    };

    const confirmDeleteFine = (booking: Booking) => {
        setSelectedBooking(booking);
        setDeleteConfirmOpen(true);
    };

    const handleMarkReturned = async (booking: Booking) => {
        try {
            const res = await fetch(`/api/bookings/${booking._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'Returned',
                    returnedBy: 'Admin'
                })
            });

            if (res.ok) {
                const updated = await res.json();
                toast.success('Equipment marked as returned!');
                setBookings(bookings.map((b) => b._id === booking._id ? updated : b));
            } else {
                toast.error('Failed to mark as returned');
            }
        } catch (e) {
            toast.error('Error connecting to server');
        }
    };

    const filteredBookings = bookings.filter(booking => {
        // Filter by damage fine status
        const fineFilter =
            filter === "all" ? true :
                filter === "with-fines" ? (booking.damageFine && booking.damageFine > 0) :
                    filter === "no-fines" ? (!booking.damageFine || booking.damageFine === 0) :
                        true;

        // Search by student name, email, or equipment name
        const searchFilter = !searchTerm ? true :
            (booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase()));

        return fineFilter && searchFilter;
    });

    const totalFines = bookings.reduce((sum, b) => sum + (b.damageFine || 0), 0);
    const bookingsWithFines = bookings.filter(b => b.damageFine && b.damageFine > 0).length;

    if (loading) return <div className="text-white">Loading bookings...</div>

    return (
        <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">All Bookings</h2>
                <p className="text-slate-400 text-sm mb-4">View and manage all equipment bookings and damage fines</p>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-900/50 border border-slate-600 rounded p-4">
                        <p className="text-slate-400 text-sm">Total Bookings</p>
                        <p className="text-white text-2xl font-bold">{bookings.length}</p>
                    </div>
                    <div className="bg-orange-950/30 border border-orange-900/50 rounded p-4">
                        <p className="text-orange-400 text-sm">Bookings with Fines</p>
                        <p className="text-orange-300 text-2xl font-bold">{bookingsWithFines}</p>
                    </div>
                    <div className="bg-orange-950/30 border border-orange-900/50 rounded p-4">
                        <p className="text-orange-400 text-sm">Total Fines Issued</p>
                        <p className="text-orange-300 text-2xl font-bold">₹{totalFines}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-slate-300">Filter by Fine Status</Label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 text-white rounded px-3 py-2"
                        >
                            <option value="all">All Bookings</option>
                            <option value="with-fines">With Fines</option>
                            <option value="no-fines">No Fines</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-300">Search</Label>
                        <Input
                            type="text"
                            placeholder="Search by student name, email, or equipment..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-900 border-slate-600 text-white"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {filteredBookings.length === 0 && (
                    <p className="text-slate-400">No bookings found matching the filters.</p>
                )}
                {filteredBookings.map((booking) => (
                    <Card key={booking._id} className="bg-slate-800 border-slate-700 p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    {booking.userName || booking.userId || "Unknown Student"}
                                </h3>
                                <p className="text-slate-400 text-sm">{booking.userEmail || "No email"}</p>
                                <p className="text-slate-300 text-sm mt-1">Equipment: {booking.equipmentName}</p>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                                <span
                                    className={`text-xs px-3 py-1 rounded font-semibold ${
                                        booking.status === "Pending"
                                            ? "bg-yellow-900 text-yellow-300"
                                            : booking.status === "Approved" || booking.status === "Confirmed"
                                                ? "bg-green-900 text-green-300"
                                                : booking.status === "Denied"
                                                    ? "bg-red-900 text-red-300"
                                                    : booking.status === "Returned"
                                                        ? "bg-teal-900 text-teal-300"
                                                        : "bg-blue-900 text-blue-300"
                                    }`}
                                >
                                    {booking.status === "Returned" ? "✅ Returned" : booking.status}
                                </span>
                                {booking.damageFine && booking.damageFine > 0 && (
                                    <span className="text-xs px-3 py-1 rounded font-semibold bg-orange-900 text-orange-300">
                                        Fine: ₹{booking.damageFine}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-4 text-slate-300 text-sm">
                            <div>
                                <p className="text-slate-400">Booking Date & Time</p>
                                <p className="font-semibold">
                                    {formatDate(booking.date)} • {booking.time || formatTime(booking.date)}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-400">Booked On</p>
                                <p className="font-semibold">
                                    {booking.createdAt ? formatDateTime(booking.createdAt) : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-400">Status</p>
                                <p className="font-semibold">{booking.status}</p>
                            </div>
                        </div>

                        {booking.damageFine && booking.damageFine > 0 && (
                            <div className="bg-orange-950/30 border border-orange-900/50 rounded p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-orange-400 font-semibold text-sm">⚠️ Damage Report</p>
                                    <p className="text-orange-300 font-bold text-lg">₹{booking.damageFine}</p>
                                </div>
                                <p className="text-slate-300 text-sm mb-2">{booking.damageDescription}</p>
                                <p className="text-slate-400 text-xs">
                                    Reported by: {booking.damageReportedBy || "Unknown"} •
                                    {booking.damageFineAddedAt && ` ${formatDateTime(booking.damageFineAddedAt)}`}
                                </p>
                            </div>
                        )}

                        {/* Return info */}
                        {booking.status === "Returned" && booking.returnedAt && (
                            <div className="bg-teal-950/30 border border-teal-900/50 rounded p-3 mt-3">
                                <p className="text-teal-400 font-semibold text-sm">✅ Equipment Returned</p>
                                <p className="text-slate-400 text-xs mt-1">
                                    Returned on: {formatDateTime(booking.returnedAt)}
                                    {booking.returnedBy && ` • Confirmed by: ${booking.returnedBy}`}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {booking.status === "Approved" && (
                                <Button
                                    size="sm"
                                    className="bg-teal-600 hover:bg-teal-700 text-white"
                                    onClick={() => handleMarkReturned(booking)}
                                >
                                    📦 Mark as Returned
                                </Button>
                            )}
                            {booking.status !== "Returned" && (
                                !booking.damageFine || booking.damageFine === 0 ? (
                                    <Button
                                        size="sm"
                                        className="bg-orange-600 hover:bg-orange-700"
                                        onClick={() => openDamageDialog(booking, false)}
                                    >
                                        Add Damage Fine
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-orange-600 text-orange-400 hover:bg-orange-950"
                                            onClick={() => openDamageDialog(booking, true)}
                                        >
                                            Edit Fine
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-red-600 text-red-400 hover:bg-red-950"
                                            onClick={() => confirmDeleteFine(booking)}
                                        >
                                            Remove Fine
                                        </Button>
                                    </>
                                )
                            )}
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-red-700 text-red-400 hover:bg-red-950"
                                onClick={() => {
                                    setSelectedBooking(booking);
                                    setDeleteConfirmOpen(true);
                                }}
                            >
                                Delete Booking
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Damage Fine Dialog */}
            <Dialog open={damageDialogOpen} onOpenChange={setDamageDialogOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? "Edit Equipment Damage Fine" : "Add Equipment Damage Fine"}</DialogTitle>
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
