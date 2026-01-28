"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Experiment {
    _id: string;
    title: string;
    category: string;
    difficulty: string;
    duration: string;
    components: string[];
    procedure: string[];
    safety: string[];
}

export function ExperimentManagement() {
    const [experiments, setExperiments] = useState<Experiment[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        title: "",
        category: "Electronics",
        difficulty: "Beginner",
        duration: "",
        components: "",
        procedure: "",
        safety: ""
    })

    useEffect(() => {
        fetchExperiments();
    }, [])

    const fetchExperiments = async () => {
        try {
            const res = await fetch('/api/experiments');
            if (res.ok) {
                const data = await res.json();
                setExperiments(data);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to fetch experiments");
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async () => {
        if (!formData.title || !formData.duration) {
            toast.error("Title and Duration are required");
            return;
        }

        const experimentData = {
            ...formData,
            components: formData.components.split('\n').filter(c => c.trim()),
            procedure: formData.procedure.split('\n').filter(p => p.trim()),
            safety: formData.safety.split('\n').filter(s => s.trim())
        };

        try {
            const url = editingId ? `/api/experiments/${editingId}` : '/api/experiments';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(experimentData)
            });

            if (res.ok) {
                toast.success(editingId ? "Experiment updated" : "Experiment added");
                setShowForm(false);
                setEditingId(null);
                resetForm();
                fetchExperiments();
            } else {
                toast.error("Failed to save experiment");
            }
        } catch (e) {
            toast.error("Server error");
        }
    }

    const handleEdit = (exp: Experiment) => {
        setEditingId(exp._id);
        setFormData({
            title: exp.title,
            category: exp.category,
            difficulty: exp.difficulty,
            duration: exp.duration,
            components: exp.components.join('\n'),
            procedure: exp.procedure.join('\n'),
            safety: exp.safety.join('\n')
        });
        setShowForm(true);
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this experiment?")) return;

        try {
            const res = await fetch(`/api/experiments/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Experiment deleted");
                fetchExperiments();
            } else {
                toast.error("Failed to delete");
            }
        } catch (e) {
            toast.error("Server error");
        }
    }

    const resetForm = () => {
        setFormData({
            title: "",
            category: "Electronics",
            difficulty: "Beginner",
            duration: "",
            components: "",
            procedure: "",
            safety: ""
        });
    }

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        resetForm();
    }

    return (
        <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Experiment Library Management</h2>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {showForm ? "Cancel" : "+ Add Experiment"}
                </Button>
            </div>

            {showForm && (
                <Card className="bg-slate-800 border-slate-700 p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">
                        {editingId ? "Edit Experiment" : "Add New Experiment"}
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Title</label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white"
                                    placeholder="e.g., Ohm's Law Verification"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Duration</label>
                                <Input
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white"
                                    placeholder="e.g., 45 min"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md h-10 px-3 text-white"
                                >
                                    <option value="Electronics">Electronics</option>
                                    <option value="Chemistry">Chemistry</option>
                                    <option value="Biology">Biology</option>
                                    <option value="Physics">Physics</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Difficulty</label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md h-10 px-3 text-white"
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-slate-400">Required Components (one per line)</label>
                            <Textarea
                                value={formData.components}
                                onChange={(e) => setFormData({ ...formData, components: e.target.value })}
                                className="bg-slate-700 border-slate-600 text-white min-h-20"
                                placeholder="Resistor&#10;Power Supply&#10;Multimeter"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-slate-400">Procedure Steps (one per line)</label>
                            <Textarea
                                value={formData.procedure}
                                onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
                                className="bg-slate-700 border-slate-600 text-white min-h-20"
                                placeholder="Connect circuit&#10;Measure voltage&#10;Calculate resistance"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-slate-400">Safety Instructions (one per line)</label>
                            <Textarea
                                value={formData.safety}
                                onChange={(e) => setFormData({ ...formData, safety: e.target.value })}
                                className="bg-slate-700 border-slate-600 text-white min-h-20"
                                placeholder="Ensure power is off before assembly&#10;Keep components dry"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                                {editingId ? "Update" : "Add"} Experiment
                            </Button>
                            <Button onClick={handleCancel} variant="outline" className="bg-transparent">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid md:grid-cols-2 gap-4">
                {loading && <p className="text-slate-400 p-4">Loading experiments...</p>}
                {!loading && experiments.length === 0 && (
                    <p className="text-slate-400 p-4">No experiments added yet.</p>
                )}
                {experiments.map((exp) => (
                    <Card key={exp._id} className="bg-slate-800 border-slate-700 p-4">
                        <h3 className="text-lg font-semibold text-white mb-2">{exp.title}</h3>
                        <div className="flex gap-2 mb-3 flex-wrap">
                            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">{exp.category}</span>
                            <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">{exp.difficulty}</span>
                            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">{exp.duration}</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(exp)}>
                                Edit
                            </Button>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleDelete(exp._id)}>
                                Delete
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
