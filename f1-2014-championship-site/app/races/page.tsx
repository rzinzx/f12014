"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import {
  getRaces,
  getDrivers,
  calculateDriverPoints,
  getPointSystem,
  getTeams,
  calculateTeamPoints,
  saveRace,
  updateRace,
  deleteRace,
  saveRaceResult,
  deleteRaceResults,
  type Race,
  type Driver,
} from "@/lib/storage"

export default function RacesPage() {
  const [races, setRaces] = useState<Race[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", date: "" })
  const [selectedRace, setSelectedRace] = useState<string | null>(null)
  const [raceResults, setRaceResults] = useState<
    { position: number; driver_id: string; status: "completed" | "dnf" | "dsq" | "retired" }[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [racesData, driversData] = await Promise.all([getRaces(), getDrivers()])
    setRaces(racesData)
    setDrivers(driversData)
    setLoading(false)
  }

  const handleCreateRace = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.date) {
      alert("Preencha todos os campos")
      return
    }

    try {
      if (editingId) {
        await updateRace(editingId, { name: formData.name, date: formData.date })
      } else {
        await saveRace({ name: formData.name, date: formData.date })
      }

      await loadData()
      setFormData({ name: "", date: "" })
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      console.error("Error saving race:", error)
      alert("Erro ao salvar corrida")
    }
  }

  const handleEditRace = (race: Race) => {
    setFormData({ name: race.name, date: race.date })
    setEditingId(race.id)
    setShowForm(true)
  }

  const handleDeleteRace = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta corrida?")) {
      try {
        await deleteRace(id)
        await loadData()
        if (selectedRace === id) {
          setSelectedRace(null)
          setRaceResults([])
        }
      } catch (error) {
        console.error("Error deleting race:", error)
        alert("Erro ao deletar corrida")
      }
    }
  }

  const handleSelectRace = async (raceId: string) => {
    setSelectedRace(raceId)
    const race = races.find((r) => r.id === raceId)
    const existingResults = race?.results || []
    setRaceResults(
      existingResults.map((r) => ({
        position: r.position,
        driver_id: r.driver_id,
        status: r.status || "completed",
      })),
    )
  }

  const handleAddResultRow = () => {
    setRaceResults([...raceResults, { position: raceResults.length + 1, driver_id: "", status: "completed" }])
  }

  const handleRemoveResultRow = (index: number) => {
    setRaceResults(raceResults.filter((_, i) => i !== index))
  }

  const handleUpdateDriverAtPosition = (index: number, driver_id: string) => {
    const updated = [...raceResults]
    updated[index].driver_id = driver_id
    setRaceResults(updated)
  }

  const handleUpdateStatus = (index: number, status: "completed" | "dnf" | "dsq" | "retired") => {
    const updated = [...raceResults]
    updated[index].status = status
    setRaceResults(updated)
  }

  const handleSaveResults = () => {
    if (!selectedRace) return

    const selectedDriverIds = raceResults.filter((r) => r.driver_id).map((r) => r.driver_id)
    if (selectedDriverIds.length !== new Set(selectedDriverIds).size) {
      alert("Um piloto não pode estar em mais de uma posição!")
      return
    }

    if (raceResults.length === 0 || raceResults.every((r) => !r.driver_id)) {
      alert("Adicione pelo menos um resultado!")
      return
    }

    try {
      const pointSystem = getPointSystem()

      deleteRaceResults(selectedRace)

      for (const r of raceResults.filter((r) => r.driver_id)) {
        saveRaceResult({
          race_id: selectedRace,
          driver_id: r.driver_id,
          position: r.position,
          points: r.status === "completed" ? pointSystem[r.position] || 0 : 0,
          status: r.status,
        })
      }

      const allRaces = getRaces()
      const allDrivers = getDrivers()
      calculateDriverPoints(allDrivers, allRaces, pointSystem)

      const allTeams = getTeams()
      calculateTeamPoints(allDrivers, allTeams)

      loadData()
      alert("Resultados da corrida salvos com sucesso!")
    } catch (error) {
      console.error("Error saving results:", error)
      alert("Erro ao salvar resultados")
    }
  }

  const getAvailableDrivers = (currentIndex: number) => {
    const selectedIds = raceResults.filter((r, i) => i !== currentIndex && r.driver_id).map((r) => r.driver_id)
    return drivers.filter((d) => !selectedIds.includes(d.id))
  }

  const getStatusDisplay = (status: string) => {
    const statuses: Record<string, { label: string; color: string }> = {
      completed: { label: "Completado", color: "bg-green-500/20 text-green-700" },
      dnf: { label: "DNF", color: "bg-red-500/20 text-red-700" },
      dsq: { label: "DSQ", color: "bg-orange-500/20 text-orange-700" },
      retired: { label: "RET", color: "bg-yellow-500/20 text-yellow-700" },
    }
    return statuses[status] || statuses.completed
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg text-muted-foreground">Carregando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gerenciamento de Corridas</h1>
            <p className="text-muted-foreground">Cadastre corridas e registre os resultados</p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowForm(!showForm)
                if (editingId) setEditingId(null)
                setFormData({ name: "", date: "" })
              }}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              {showForm ? "Cancelar" : "Nova Corrida"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreateRace} className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome da Corrida (ex: Gran Prêmio da Austrália)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
              </div>
              <button
                type="submit"
                className="bg-accent text-accent-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium w-full"
              >
                {editingId ? "Atualizar" : "Criar"} Corrida
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="bg-primary text-primary-foreground px-6 py-4">
                <h2 className="text-lg font-bold">Corridas</h2>
              </div>
              <div className="space-y-2 p-4">
                {races.length > 0 ? (
                  races.map((race) => (
                    <div
                      key={race.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedRace === race.id
                          ? "bg-accent border-accent text-accent-foreground"
                          : "bg-background border-border hover:bg-muted/50"
                      }`}
                    >
                      <button onClick={() => handleSelectRace(race.id)} className="w-full text-left">
                        <div className="font-semibold">{race.name}</div>
                        <div className="text-xs opacity-75">{new Date(race.date).toLocaleDateString("pt-BR")}</div>
                      </button>
                      <div className="flex gap-2 mt-2 text-xs">
                        <button
                          onClick={() => handleEditRace(race)}
                          className="flex-1 bg-secondary text-secondary-foreground px-2 py-1 rounded hover:opacity-90"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteRace(race.id)}
                          className="flex-1 bg-destructive text-destructive-foreground px-2 py-1 rounded hover:opacity-90"
                        >
                          Deletar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">Nenhuma corrida cadastrada</div>
                )}
              </div>
            </div>

            {selectedRace && (
              <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
                <div className="bg-primary text-primary-foreground px-6 py-4">
                  <h2 className="text-lg font-bold">Resultados - {races.find((r) => r.id === selectedRace)?.name}</h2>
                </div>
                <div className="p-6 space-y-4">
                  {raceResults.length > 0 ? (
                    <div className="space-y-3">
                      {raceResults.map((result, index) => (
                        <div
                          key={index}
                          className="flex flex-col gap-2 p-3 bg-secondary/10 rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-10 bg-secondary/20 rounded flex items-center justify-center font-bold text-sm">
                              {result.position}º
                            </div>
                            <select
                              value={result.driver_id}
                              onChange={(e) => handleUpdateDriverAtPosition(index, e.target.value)}
                              className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                            >
                              <option value="">Selecione um piloto</option>
                              {getAvailableDrivers(index).map((driver) => (
                                <option key={driver.id} value={driver.id}>
                                  {driver.number} - {driver.name}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleRemoveResultRow(index)}
                              className="px-3 py-2 bg-destructive text-destructive-foreground rounded hover:opacity-90 font-medium text-sm"
                            >
                              Remover
                            </button>
                          </div>

                          {result.driver_id && (
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium min-w-fit">Status:</label>
                              <select
                                value={result.status}
                                onChange={(e) =>
                                  handleUpdateStatus(index, e.target.value as "completed" | "dnf" | "dsq" | "retired")
                                }
                                className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                              >
                                <option value="completed">Completado</option>
                                <option value="dnf">DNF (Did Not Finish)</option>
                                <option value="dsq">DSQ (Desclassificado)</option>
                                <option value="retired">RET (Retirado)</option>
                              </select>
                              <span
                                className={`px-3 py-1 rounded text-xs font-medium ${getStatusDisplay(result.status).color}`}
                              >
                                {getStatusDisplay(result.status).label}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">Nenhum resultado adicionado</div>
                  )}

                  <button
                    onClick={handleAddResultRow}
                    className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
                  >
                    + Adicionar Posição
                  </button>

                  <div className="border-t border-border pt-4">
                    <button
                      onClick={handleSaveResults}
                      className="bg-accent text-accent-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium w-full"
                    >
                      Salvar Resultados
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
