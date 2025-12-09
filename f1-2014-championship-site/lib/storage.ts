import { getSupabaseClient } from "./supabase"

export interface Driver {
  id: string
  name: string
  team_id: string | null
  points: number
  photo_url?: string
}

export interface Team {
  id: string
  name: string
  points: number
  logo_url?: string
}

export interface PointSystem {
  [position: number]: number
}

export interface RaceResult {
  id?: string
  driver_id: string
  race_id: string
  position: number
  points_earned: number
  status?: "Completado" | "DNF" | "DSQ" | "RET"
}

export interface Race {
  id: string
  name: string
  date: string
  results?: RaceResult[]
}

export interface Penalty {
  id: string
  driver_id?: string
  team_id?: string
  penalty_type: string
  points_deducted: number
  description: string
  created_at: string
}

export async function getDrivers(): Promise<Driver[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("drivers").select("*")
  if (error) {
    console.error("Error fetching drivers:", error)
    return []
  }
  return data || []
}

export async function saveDriver(driver: Omit<Driver, "id">): Promise<Driver> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("drivers").insert([driver]).select().single()
  if (error) throw error
  return data
}

export async function updateDriver(id: string, driver: Partial<Driver>): Promise<Driver | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("drivers").update(driver).eq("id", id).select().single()
  if (error) {
    console.error("Error updating driver:", error)
    return null
  }
  return data
}

export async function deleteDriver(id: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("drivers").delete().eq("id", id)
  if (error) {
    console.error("Error deleting driver:", error)
    return false
  }
  return true
}

export async function getTeams(): Promise<Team[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("teams").select("*")
  if (error) {
    console.error("Error fetching teams:", error)
    return []
  }
  return data || []
}

export async function saveTeam(team: Omit<Team, "id" | "points">): Promise<Team> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("teams")
    .insert([{ ...team, points: 0 }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTeam(id: string, team: Partial<Team>): Promise<Team | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("teams").update(team).eq("id", id).select().single()
  if (error) {
    console.error("Error updating team:", error)
    return null
  }
  return data
}

export async function deleteTeam(id: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("teams").delete().eq("id", id)
  if (error) {
    console.error("Error deleting team:", error)
    return false
  }
  return true
}

export async function getTeamById(teamId: string): Promise<Team | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("teams").select("*").eq("id", teamId).single()
  if (error) {
    console.error("Error fetching team:", error)
    return null
  }
  return data
}

export async function getRaces(): Promise<Race[]> {
  const supabase = getSupabaseClient()
  const { data: races, error: racesError } = await supabase
    .from("races")
    .select("*")
    .order("date", { ascending: false })
  if (racesError) {
    console.error("Error fetching races:", racesError)
    return []
  }

  const { data: results, error: resultsError } = await supabase.from("race_results").select("*")
  if (resultsError) {
    console.error("Error fetching results:", resultsError)
    return races || []
  }

  return (races || []).map((race) => ({
    ...race,
    results: (results || []).filter((r) => r.race_id === race.id),
  }))
}

export async function saveRace(race: Omit<Race, "id" | "results">): Promise<Race> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("races").insert([race]).select().single()
  if (error) throw error
  return { ...data, results: [] }
}

export async function getRaceResults(raceId: string): Promise<RaceResult[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("race_results").select("*").eq("race_id", raceId)
  if (error) {
    console.error("Error fetching race results:", error)
    return []
  }
  return data || []
}

export async function saveRaceResult(result: Omit<RaceResult, "id">): Promise<RaceResult> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("race_results").insert([result]).select().single()
  if (error) throw error
  return data
}

export async function deleteRaceResults(raceId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("race_results").delete().eq("race_id", raceId)
  if (error) {
    console.error("Error deleting race results:", error)
    return false
  }
  return true
}

export async function updateRace(id: string, race: Partial<Race>): Promise<Race | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("races").update(race).eq("id", id).select().single()
  if (error) {
    console.error("Error updating race:", error)
    return null
  }
  return data as Race | null
}

export async function deleteRace(id: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("races").delete().eq("id", id)
  if (error) {
    console.error("Error deleting race:", error)
    return false
  }
  return true
}

export async function getPointSystem(): Promise<PointSystem> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("points_config").select("*")
  if (error) {
    console.error("Error fetching points config:", error)
    return {}
  }

  const system: PointSystem = {}
  ;(data || []).forEach((row: any) => {
    system[row.position] = row.points
  })
  return system
}

export async function updatePointSystem(system: PointSystem): Promise<boolean> {
  const supabase = getSupabaseClient()
  const records = Object.entries(system).map(([position, points]) => ({
    position: Number.parseInt(position),
    points,
  }))

  const { error } = await supabase.from("points_config").upsert(records)
  if (error) {
    console.error("Error updating points config:", error)
    return false
  }
  return true
}

export async function getPenalties(): Promise<Penalty[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("penalties").select("*").order("created_at", { ascending: false })
  if (error) {
    console.error("Error fetching penalties:", error)
    return []
  }
  return data || []
}

export async function addPenalty(penalty: Omit<Penalty, "id" | "created_at">): Promise<Penalty> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("penalties").insert([penalty]).select().single()
  if (error) throw error
  return data
}

export async function deletePenalty(penaltyId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from("penalties").delete().eq("id", penaltyId)
  if (error) {
    console.error("Error deleting penalty:", error)
    return false
  }
  return true
}

export async function getDriverPenalties(driverId: string): Promise<Penalty[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("penalties")
    .select("*")
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false })
  if (error) {
    console.error("Error fetching driver penalties:", error)
    return []
  }
  return data || []
}

export async function getTeamPenalties(teamId: string): Promise<Penalty[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("penalties")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })
  if (error) {
    console.error("Error fetching team penalties:", error)
    return []
  }
  return data || []
}

export async function calculateDriverPoints(
  drivers: Driver[],
  races: Race[],
  pointSystem: PointSystem,
): Promise<Driver[]> {
  const penalties = await getPenalties()
  const pointMap = new Map<string, number>()

  drivers.forEach((d) => pointMap.set(d.id, 0))

  races.forEach((race) => {
    race.results?.forEach((result) => {
      const currentPoints = pointMap.get(result.driver_id) || 0
      pointMap.set(result.driver_id, currentPoints + result.points_earned)
    })
  })

  penalties.forEach((penalty) => {
    if (penalty.driver_id) {
      const currentPoints = pointMap.get(penalty.driver_id) || 0
      pointMap.set(penalty.driver_id, Math.max(0, currentPoints - penalty.points_deducted))
    }
  })

  return drivers
    .map((d) => ({
      ...d,
      points: pointMap.get(d.id) || 0,
    }))
    .sort((a, b) => b.points - a.points)
}

export async function calculateTeamPoints(drivers: Driver[], teams: Team[]): Promise<Team[]> {
  const penalties = await getPenalties()
  const teamPointMap = new Map<string, number>()

  teams.forEach((team) => {
    teamPointMap.set(team.id, 0)
  })

  drivers.forEach((driver) => {
    const currentTeamPoints = teamPointMap.get(driver.team_id || "") || 0
    teamPointMap.set(driver.team_id || "", currentTeamPoints + driver.points)
  })

  penalties.forEach((penalty) => {
    if (penalty.team_id) {
      const currentTeamPoints = teamPointMap.get(penalty.team_id) || 0
      teamPointMap.set(penalty.team_id, Math.max(0, currentTeamPoints - penalty.points_deducted))
    }
  })

  return teams
    .map((team) => ({
      ...team,
      points: teamPointMap.get(team.id) || 0,
    }))
    .sort((a, b) => b.points - a.points)
}
