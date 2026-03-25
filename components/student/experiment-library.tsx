"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

export function ExperimentLibrary() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [selectedExp, setSelectedExp] = useState<Experiment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExperiments();
  }, [])

  const fetchExperiments = async () => {
    try {
      const res = await fetch('/api/experiments');
      if (res.ok) {
        const data = await res.json();
        setExperiments(data);
      } else {
        toast.error("Failed to load experiments");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error loading experiments");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-white p-4">Loading experiments...</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Experiment Library</h2>
        <p className="text-slate-400">Choose an experiment to learn step-by-step procedures and safety guidelines</p>
      </div>

      {experiments.length === 0 && (
        <Card className="bg-slate-800 border-slate-700 p-8 text-center">
          <p className="text-slate-400">No experiments available yet. Check back later!</p>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {experiments.map((exp) => (
          <Card
            key={exp._id}
            className="bg-slate-800 border-slate-700 p-4 cursor-pointer hover:border-blue-500 transition"
            onClick={() => setSelectedExp(exp)}
          >
            <h3 className="text-lg font-semibold text-white mb-2">{exp.title}</h3>
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">{exp.category}</span>
              <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">{exp.difficulty}</span>
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">{exp.duration}</span>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
              Learn More
            </Button>
          </Card>
        ))}
      </div>

      {selectedExp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="bg-slate-800 border-slate-700 max-w-2xl w-full p-6 my-8">
            <h3 className="text-2xl font-bold text-white mb-4">{selectedExp.title}</h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-300 mb-2">Required Components</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedExp.components.map((comp, i) => (
                    <span key={i} className="bg-slate-700 text-slate-300 px-3 py-1 rounded text-sm">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-300 mb-2">Procedure</h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  {selectedExp.procedure.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="font-semibold text-slate-300 mb-2">Safety Instructions</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  {selectedExp.safety.map((safety, i) => (
                    <li key={i}>{safety}</li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700" 
                  onClick={() => {
                    toast.success(`Started Experiment: ${selectedExp.title}`);
                    setSelectedExp(null);
                  }}
                >
                  Start Experiment
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent text-white border-slate-600 hover:bg-slate-700" onClick={() => setSelectedExp(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
