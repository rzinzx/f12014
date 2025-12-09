"use client"
import { Navigation } from "@/components/navigation"
import { useState, useEffect } from "react"
import {
  getDrivers,
  calculateDriverPoints,
  getRaces,
  getPointSystem,
  getTeams,
  calculateTeamPoints,
} from "@/lib/storage"
import type { Driver, Team } from "@/lib/storage"

export default function Dashboard() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const allDrivers = getDrivers()
    const allRaces = getRaces()
    const pointSystem = getPointSystem()
    const allTeams = getTeams()

    const calculatedDrivers = calculateDriverPoints(allDrivers, allRaces, pointSystem)
    const calculatedTeams = calculateTeamPoints(calculatedDrivers, allTeams)

    setDrivers(calculatedDrivers)
    setTeams(calculatedTeams)
    setLoading(false)
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

  const leaderTeam = teams[0]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Campeonato F1 2014</h1>
            <p className="text-muted-foreground">Gerenciar pilotos, equipes, corridas e pontuações</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-3xl font-bold text-primary">{drivers.length}</div>
              <div className="text-sm text-muted-foreground">Pilotos Cadastrados</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-3xl font-bold text-accent">{drivers[0]?.points || 0}</div>
              <div className="text-sm text-muted-foreground">Pontos do Piloto Líder</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-3xl font-bold text-secondary">{drivers[0]?.name || "—"}</div>
              <div className="text-sm text-muted-foreground">Piloto na Liderança</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="bg-primary text-primary-foreground px-6 py-4">
                <h2 className="text-xl font-bold">Classificação de Pilotos</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/20 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold"></th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Pos</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Piloto</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Equipe</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Pontos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.length > 0 ? (
                      drivers.slice(0, 10).map((driver, index) => {
                        const team = teams.find((t) => t.id === driver.team_id)
                        return (
                          <tr key={driver.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4">
                              {driver.photo ? (
                                <img
                                  src={driver.photo || "/placeholder.svg"}
                                  alt={driver.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                  {driver.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-accent">{index + 1}º</td>
                            <td className="px-6 py-4 text-sm font-medium">{driver.name}</td>
                            <td className="px-6 py-4 text-sm">{team?.name || "—"}</td>
                            <td className="px-6 py-4 text-sm font-bold text-primary">{driver.points}</td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          Nenhum piloto cadastrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="bg-primary text-primary-foreground px-6 py-4">
                <h2 className="text-xl font-bold">Classificação de Equipes</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/20 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold"></th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Pos</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Equipe</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Pontos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.length > 0 ? (
                      teams.map((team, index) => (
                        <tr key={team.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4">
                            {team.photo ? (
                              <img
                                src={team.photo || "/placeholder.svg"}
                                alt={team.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">
                                {team.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-accent">{index + 1}º</td>
                          <td className="px-6 py-4 text-sm font-medium">{team.name}</td>
                          <td className="px-6 py-4 text-sm font-bold text-primary">{team.points}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                          Nenhuma equipe cadastrada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
