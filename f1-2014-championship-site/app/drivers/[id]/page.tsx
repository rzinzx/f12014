"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { getDrivers, getRaces, getDriverPenalties, type Driver } from "@/lib/storage"

interface DriverRaceResult {
  raceName: string
  raceDate: string
  position: number
  points: number
  status: string
}

export default function DriverDetailPage() {
  const params = useParams()
  const driverId = params.id as string

  const [driver, setDriver] = useState<Driver | null>(null)
  const [raceResults, setRaceResults] = useState<DriverRaceResult[]>([])
  const [driverPenalties, setDriverPenalties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [driverId])

  const loadData = () => {
    const drivers = getDrivers()
    const foundDriver = drivers.find((d) => d.id === driverId)
    setDriver(foundDriver || null)

    const races = getRaces()
    const results: DriverRaceResult[] = []

    races.forEach((race) => {
      const result = race.results?.find((r) => r.driver_id === driverId)
      if (result) {
        results.push({
          raceName: race.name,
          raceDate: race.date,
          position: result.position,
          points: result.points,
          status: result.status || "completed",
        })
      }
    })

    results.sort((a, b) => new Date(b.raceDate).getTime() - new Date(a.raceDate).getTime())
    setRaceResults(results)

    const penalties = getDriverPenalties(driverId)
    setDriverPenalties(penalties)
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

  if (!driver) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-muted-foreground">Piloto não encontrado</p>
        </main>
      </div>
    )
  }

  const bestResult =
    raceResults.length > 0
      ? raceResults.reduce((best, current) => (current.position < best.position ? current : best))
      : null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "dnf":
        return "bg-red-500/20 text-red-700 border border-red-500/30"
      case "dsq":
        return "bg-red-600/20 text-red-800 border border-red-600/30"
      case "retired":
        return "bg-orange-500/20 text-orange-700 border border-orange-500/30"
      default:
        return "bg-green-500/20 text-green-700 border border-green-500/30"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "dnf":
        return "DNF"
      case "dsq":
        return "DSQ"
      case "retired":
        return "RET"
      default:
        return "Completado"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Breadcrumb */}
          <Link href="/drivers" className="text-primary hover:underline text-sm font-medium">
            ← Voltar para Pilotos
          </Link>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start gap-6">
              {driver.photo && (
                <img
                  src={driver.photo || "/placeholder.svg"}
                  alt={driver.name}
                  className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-bold text-primary">{driver.number}</div>
                    <div>
                      <h1 className="text-3xl font-bold">{driver.name}</h1>
                      <p className="text-muted-foreground text-lg">{driver.team_id}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Pontos Totais</p>
                  <p className="text-4xl font-bold text-primary">{driver.points}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Best Result */}
          {bestResult && (
            <div className="bg-accent text-accent-foreground rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Melhor Resultado</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm opacity-75">Corrida</p>
                  <p className="text-xl font-bold">{bestResult.raceName}</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">Posição</p>
                  <p className="text-3xl font-bold">
                    {bestResult.position}
                    <span className="text-lg">º</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-75">Pontos</p>
                  <p className="text-2xl font-bold">{bestResult.points}</p>
                </div>
              </div>
            </div>
          )}

          {/* Penalties Section */}
          {driverPenalties.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-red-700">Punições ({driverPenalties.length})</h2>
              <div className="space-y-3">
                {driverPenalties
                  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((penalty: any) => (
                    <div key={penalty.id} className="bg-background border border-red-500/30 rounded p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-red-700">{penalty.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(penalty.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        {penalty.points_loss > 0 && (
                          <span className="font-bold text-red-600 ml-4">-{penalty.points_loss} pts</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Race Results */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="bg-primary text-primary-foreground px-6 py-4">
              <h2 className="text-xl font-bold">Histórico de Corridas ({raceResults.length})</h2>
            </div>

            {raceResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 p-6">
                {raceResults.map((result, idx) => (
                  <div
                    key={idx}
                    className="bg-secondary/10 border border-border rounded-lg p-4 hover:bg-secondary/20 transition-colors"
                  >
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Corrida</p>
                        <p className="text-sm font-bold">{result.raceName}</p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Data</p>
                          <p className="text-xs font-medium">{new Date(result.raceDate).toLocaleDateString("pt-BR")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Posição</p>
                          <p className="text-sm font-bold">
                            {result.status !== "completed" ? "-" : `${result.position}º`}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Pontos</p>
                          <p className="text-sm font-bold text-primary">{result.points}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(result.status)}`}
                        >
                          {getStatusLabel(result.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-muted-foreground">
                Este piloto ainda não participou de nenhuma corrida
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
