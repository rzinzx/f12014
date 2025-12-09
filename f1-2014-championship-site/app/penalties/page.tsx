"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import {
  getDrivers,
  getTeams,
  getPenalties,
  addPenalty,
  deletePenalty,
  type Penalty,
  type Driver,
  type Team,
} from "@/lib/storage"

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState<Penalty[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [penaltyType, setPenaltyType] = useState<"driver" | "team">("driver")
  const [selectedDriver, setSelectedDriver] = useState<string>("")
  const [selectedTeam, setSelectedTeam] = useState<string>("")
  const [type, setType] = useState<Penalty["type"]>("points_loss")
  const [pointsLoss, setPointsLoss] = useState<number>(0)
  const [description, setDescription] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const driversData = getDrivers()
    const teamsData = getTeams()
    const penaltiesData = getPenalties()
    setDrivers(driversData)
    setTeams(teamsData)
    setPenalties(penaltiesData)
    setLoading(false)
  }

  const handleAddPenalty = () => {
    if (
      (penaltyType === "driver" && !selectedDriver) ||
      (penaltyType === "team" && !selectedTeam) ||
      !description.trim()
    ) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    try {
      const newPenalty = addPenalty({
        driver_id: penaltyType === "driver" ? selectedDriver : undefined,
        team_id: penaltyType === "team" ? selectedTeam : undefined,
        type,
        points_loss: pointsLoss,
        description,
        date: new Date().toISOString().split("T")[0],
      })

      if (newPenalty) {
        setPenalties([...penalties, newPenalty])
        setSelectedDriver("")
        setSelectedTeam("")
        setType("points_loss")
        setPointsLoss(0)
        setDescription("")
      }
    } catch (error) {
      console.error("Error adding penalty:", error)
      alert("Erro ao adicionar punição")
    }
  }

  const handleDeletePenalty = (penaltyId: string) => {
    try {
      deletePenalty(penaltyId)
      setPenalties(penalties.filter((p) => p.id !== penaltyId))
    } catch (error) {
      console.error("Error deleting penalty:", error)
      alert("Erro ao deletar punição")
    }
  }

  const getTypeLabel = (type: Penalty["type"]) => {
    switch (type) {
      case "points_loss":
        return "Perda de Pontos"
      case "disqualification":
        return "Desclassificação"
      case "time_penalty":
        return "Penalidade de Tempo"
      case "other":
        return "Outra"
    }
  }

  const getTypeColor = (type: Penalty["type"]) => {
    switch (type) {
      case "points_loss":
        return "bg-yellow-500/20 text-yellow-700 border border-yellow-500/30"
      case "disqualification":
        return "bg-red-600/20 text-red-800 border border-red-600/30"
      case "time_penalty":
        return "bg-orange-500/20 text-orange-700 border border-orange-500/30"
      case "other":
        return "bg-blue-500/20 text-blue-700 border border-blue-500/30"
    }
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
        <div className="space-y-8">
          <h1 className="text-4xl font-bold text-primary">Gerenciamento de Punições</h1>

          {/* Form para adicionar punição */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <h2 className="text-2xl font-bold">Adicionar Nova Punição</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Tipo de Punição</label>
                <select
                  value={penaltyType}
                  onChange={(e) => setPenaltyType(e.target.value as "driver" | "team")}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                >
                  <option value="driver">Piloto</option>
                  <option value="team">Equipe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  {penaltyType === "driver" ? "Selecionar Piloto" : "Selecionar Equipe"}
                </label>
                <select
                  value={penaltyType === "driver" ? selectedDriver : selectedTeam}
                  onChange={(e) =>
                    penaltyType === "driver" ? setSelectedDriver(e.target.value) : setSelectedTeam(e.target.value)
                  }
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                >
                  <option value="">-- Selecione --</option>
                  {penaltyType === "driver"
                    ? drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))
                    : teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Tipo de Punição</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as Penalty["type"])}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                >
                  <option value="points_loss">Perda de Pontos</option>
                  <option value="disqualification">Desclassificação</option>
                  <option value="time_penalty">Penalidade de Tempo</option>
                  <option value="other">Outra</option>
                </select>
              </div>

              {type === "points_loss" && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Pontos a Descontar</label>
                  <input
                    type="number"
                    min="0"
                    value={pointsLoss}
                    onChange={(e) => setPointsLoss(Number.parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Descrição da Punição *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o motivo da punição..."
                rows={4}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
              />
            </div>

            <button
              onClick={handleAddPenalty}
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Adicionar Punição
            </button>
          </div>

          {/* Lista de punições */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="bg-primary text-primary-foreground px-6 py-4">
              <h2 className="text-xl font-bold">Histórico de Punições ({penalties.length})</h2>
            </div>

            {penalties.length > 0 ? (
              <div className="space-y-2 p-6">
                {penalties
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((penalty) => {
                    const targetName = penalty.driver_id
                      ? drivers.find((d) => d.id === penalty.driver_id)?.name
                      : teams.find((t) => t.id === penalty.team_id)?.name

                    return (
                      <div key={penalty.id} className="bg-secondary/10 border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-lg">{targetName}</span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(penalty.type)}`}
                              >
                                {getTypeLabel(penalty.type)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{penalty.description}</p>
                            <div className="flex gap-6 text-sm">
                              <div>
                                <span className="text-muted-foreground">Data: </span>
                                <span className="font-medium">{penalty.date}</span>
                              </div>
                              {penalty.points_loss > 0 && (
                                <div>
                                  <span className="text-muted-foreground">Pontos Perdidos: </span>
                                  <span className="font-bold text-red-600">-{penalty.points_loss}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeletePenalty(penalty.id)}
                            className="text-red-600 hover:text-red-700 font-semibold text-sm ml-4 flex-shrink-0"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-muted-foreground">Nenhuma punição registrada</div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
