-- Criar tabela de equipes
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de pilotos
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  photo_url TEXT,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de corridas
CREATE TABLE IF NOT EXISTS races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela de resultados de corrida
CREATE TABLE IF NOT EXISTS race_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  status TEXT DEFAULT 'Completado',
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(race_id, driver_id)
);

-- Criar tabela de configuração de pontuação
CREATE TABLE IF NOT EXISTS points_config (
  position INTEGER PRIMARY KEY,
  points INTEGER NOT NULL
);

-- Criar tabela de penalidades
CREATE TABLE IF NOT EXISTS penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  penalty_type TEXT NOT NULL,
  description TEXT NOT NULL,
  points_deducted INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inserir pontuação padrão do F1 2014
INSERT INTO points_config (position, points) VALUES
  (1, 25), (2, 18), (3, 15), (4, 12), (5, 10),
  (6, 8), (7, 6), (8, 4), (9, 2), (10, 1)
ON CONFLICT (position) DO NOTHING;
