"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { getTeams, saveTeam, updateTeam, deleteTeam, type Team } from "@/lib/storage"

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", photo: "" })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const teamsData = await getTeams()
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

    if (!formData.name) {
      alert("Preencha o nome da equipe")
      return
    }

    try {
      if (editingId) {
        await updateTeam(editingId, {
          name: formData.name,
          photo: formData.photo || undefined,
        })
      } else {
        await saveTeam({
          name: formData.name,
          points: 0,
          photo: formData.photo || undefined,
        })
      }

      await loadData()
      setFormData({ name: "", photo: "" })
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      console.error("Error saving team:", error)
      alert("Erro ao salvar equipe")
    }
  }

  const handleEdit = (team: Team) => {
    setFormData({ name: team.name, photo: team.photo || "" })
    setEditingId(team.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta equipe?")) {
      try {
        await deleteTeam(id)
        await loadData()
      } catch (error) {
        console.error("Error deleting team:", error)
        alert("Erro ao deletar equipe")
      }
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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gerenciamento de Equipes</h1>
            <p className="text-muted-foreground">Cadastre e gerencie as equipes do campeonato</p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowForm(!showForm)
                if (editingId) setEditingId(null)
                setFormData({ name: "", photo: "" })
              }}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              {showForm ? "Cancelar" : "Nova Equipe"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
              <input
                type="text"
                placeholder="Nome da Equipe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium">Logo da Equipe (Opcional)</label>
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
                      className="h-20 w-20 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="bg-accent text-accent-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium w-full"
              >
                {editingId ? "Atualizar" : "Cadastrar"} Equipe
              </button>
            </form>
          )}

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="bg-primary text-primary-foreground px-6 py-4">
              <h2 className="text-xl font-bold">Classificação de Equipes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/20 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Posição</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Logo</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Equipe</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Pontos</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.length > 0 ? (
                    teams.map((team, index) => (
                      <tr key={team.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-primary">{index + 1}</td>
                        <td className="px-6 py-4 text-sm">
                          {team.photo ? (
                            <img
                              src={team.photo || "/placeholder.svg"}
                              alt={team.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-secondary/30 flex items-center justify-center text-xs font-bold">
                              {team.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">{team.name}</td>
                        <td className="px-6 py-4 text-sm font-bold">{team.points}</td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => handleEdit(team)}
                            className="bg-accent text-accent-foreground px-3 py-1 rounded text-xs hover:opacity-90 transition-opacity"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(team.id)}
                            className="bg-destructive text-destructive-foreground px-3 py-1 rounded text-xs hover:opacity-90 transition-opacity"
                          >
                            Deletar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        Nenhuma equipe cadastrada
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
