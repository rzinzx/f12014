"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { getDrivers, saveDriver, updateDriver, deleteDriver, getTeams, type Driver, type Team } from "@/lib/storage"

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", number: "", team_id: "", photo: "" })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [driversData, teamsData] = await Promise.all([getDrivers(), getTeams()])
    setDrivers(driversData)
    setTeams(teamsData)
    setLoading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.number || !formData.team_id) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    try {
      if (editingId) {
        await updateDriver(editingId, {
          name: formData.name,
          number: Number.parseInt(formData.number),
          team_id: formData.team_id,
          photo: formData.photo || undefined,
        })
      } else {
        await saveDriver({
          name: formData.name,
          number: Number.parseInt(formData.number),
          team_id: formData.team_id,
          points: 0,
          photo: formData.photo || undefined,
        })
      }

      await loadData()
      setFormData({ name: "", number: "", team_id: "", photo: "" })
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      console.error("Error saving driver:", error)
      alert("Erro ao salvar piloto")
    }
  }

  const handleEdit = (driver: Driver) => {
    setFormData({
      name: driver.name,
      number: driver.number.toString(),
      team_id: driver.team_id,
      photo: driver.photo || "",
    })
    setEditingId(driver.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar este piloto?")) {
      try {
        await deleteDriver(id)
        await loadData()
      } catch (error) {
        console.error("Error deleting driver:", error)
        alert("Erro ao deletar piloto")
      }
    }
  }

  const getTeamName = (team_id: string) => {
    return teams.find((t) => t.id === team_id)?.name || "Sem equipe"
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
            <h1 className="text-3xl font-bold mb-2">Gerenciamento de Pilotos</h1>
            <p className="text-muted-foreground">Cadastre, edite e gerencie os pilotos do campeonato</p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowForm(!showForm)
                if (editingId) setEditingId(null)
                setFormData({ name: "", number: "", team_id: "", photo: "" })
              }}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              {showForm ? "Cancelar" : "Novo Piloto"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
              {teams.length === 0 && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                  Você precisa cadastrar uma equipe primeiro. Acesse a página de Equipes.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome do Piloto"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
                <input
                  type="number"
                  placeholder="Número"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
              </div>

              <select
                value={formData.team_id}
                onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                <option value="">Selecione uma equipe</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Foto do Piloto (Opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
                {formData.photo && (
                  <div className="mt-2">
                    <img
                      src={formData.photo || "/placeholder.svg"}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={teams.length === 0}
                className="bg-accent text-accent-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingId ? "Atualizar" : "Cadastrar"} Piloto
              </button>
            </form>
          )}

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="bg-primary text-primary-foreground px-6 py-4">
              <h2 className="text-xl font-bold">Lista de Pilotos</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/20 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Foto</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Nome</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Número</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Equipe</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Pontos</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.length > 0 ? (
                    drivers.map((driver) => (
                      <tr key={driver.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 text-sm">
                          {driver.photo ? (
                            <img
                              src={driver.photo || "/placeholder.svg"}
                              alt={driver.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-secondary/30 flex items-center justify-center text-xs font-bold">
                              {driver.number}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <Link href={`/drivers/${driver.id}`} className="text-primary hover:underline font-semibold">
                            {driver.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm">#{driver.number}</td>
                        <td className="px-6 py-4 text-sm">{getTeamName(driver.team_id)}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{driver.points}</td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => handleEdit(driver)}
                            className="bg-accent text-accent-foreground px-3 py-1 rounded text-xs hover:opacity-90 transition-opacity"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(driver.id)}
                            className="bg-destructive text-destructive-foreground px-3 py-1 rounded text-xs hover:opacity-90 transition-opacity"
                          >
                            Deletar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        Nenhum piloto cadastrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
