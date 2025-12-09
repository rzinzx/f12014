"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { getPointSystem, updatePointSystem, type PointSystem } from "@/lib/storage"

export default function PointsPage() {
  const [pointSystem, setPointSystem] = useState<PointSystem>({})
  const [newPosition, setNewPosition] = useState("")
  const [newPoints, setNewPoints] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPointSystem()
  }, [])

  const loadPointSystem = () => {
    const system = getPointSystem()
    setPointSystem(system)
    setLoading(false)
  }

  const handleUpdatePoint = (position: number, value: string) => {
    const updated = {
      ...pointSystem,
      [position]: Number.parseInt(value) || 0,
    }
    setPointSystem(updated)
  }

  const handleAddPosition = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPosition || !newPoints) {
      alert("Preencha todos os campos")
      return
    }

    const position = Number.parseInt(newPosition)
    if (position < 1) {
      alert("A posição deve ser maior ou igual a 1")
      return
    }

    const updated = {
      ...pointSystem,
      [position]: Number.parseInt(newPoints),
    }
    setPointSystem(updated)
    setNewPosition("")
    setNewPoints("")
  }

  const handleDeletePosition = (position: number) => {
    const updated = { ...pointSystem }
    delete updated[position]
    setPointSystem(updated)
  }

  const handleSave = () => {
    try {
      updatePointSystem(pointSystem)
      alert("Sistema de pontuação atualizado com sucesso!")
    } catch (error) {
      console.error("Error updating point system:", error)
      alert("Erro ao atualizar sistema de pontuação")
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

  const positions = Object.keys(pointSystem)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Configuração de Pontuação</h1>
            <p className="text-muted-foreground">Defina a pontuação para cada posição de chegada</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-bold">Adicionar Posição</h2>
              <form onSubmit={handleAddPosition} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Posição</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ex: 1"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pontos</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ex: 25"
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Adicionar Posição
                </button>
              </form>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Resumo da Pontuação</h2>
              <div className="space-y-2">
                {positions.length > 0 ? (
                  positions.map((pos) => (
                    <div
                      key={pos}
                      className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-lg text-accent">{pos}º</span>
                        <span className="text-primary font-semibold">{pointSystem[pos]} pontos</span>
                      </div>
                      <button
                        onClick={() => handleDeletePosition(pos)}
                        className="text-destructive hover:text-destructive/80 transition-colors text-sm font-medium"
                      >
                        Remover
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">Nenhuma posição configurada</div>
                )}
              </div>
            </div>
          </div>

          {positions.length > 0 && (
            <div className="bg-accent text-accent-foreground p-6 rounded-lg flex items-center justify-between">
              <div>
                <h3 className="font-bold mb-1">Total de Posições Configuradas</h3>
                <p className="text-sm opacity-90">{positions.length} posições com pontuação definida</p>
              </div>
              <button
                onClick={handleSave}
                className="bg-background text-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Salvar Alterações
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
