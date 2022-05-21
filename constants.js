export const principalTeamLimits = {
  GOLEIRO: 1,
  ZAGUEIRO: 2,
  TECNICO: 1,
  LATERAL: 2,
  MEIA: 3,
  ATACANTE: 3,
};

export const principalTeamMinimumPrice = {
  GOLEIRO: 1000,
  ZAGUEIRO: 2000,
  TECNICO: 1000,
  LATERAL: 2000,
  MEIA: 3000,
  ATACANTE: 3000,
};

export const secondaryTeamLimits = {
  GOLEIRO: 1,
  ZAGUEIRO: 1,
  LATERAL: 1,
  MEIA: 1,
  TECNICO: 0,
  ATACANTE: 1,
};

export const teamRivals = {
  'América-MG': ['Atlético-MG'],
  'Athlético-PR': ['Coritiba'],
  'Atlético-GO': ['Goiás'],
  'Atlético-MG': ['América-MG'],
  'Avaí': [],
  'Botafogo': ['Fluminense', 'Flamengo'],
  'Bragantino': [],
  'Ceará': ['Fortaleza'],
  'Corinthians': ['Santos', 'Palmeiras', 'São Paulo'],
  'Coritiba': ['Athlético-PR'],
  'Cuiabá': [],
  'Flamengo': ['Botafogo', 'Fluminense'],
  'Fluminense': ['Botafogo', 'Flamengo'],
  'Fortaleza': ['Ceará'],
  'Goiás': ['Atlético-GO'],
  'Internacional': [],
  'Juventude': [],
  'Palmeiras': ['Corinthians', 'Santos', 'São Paulo'],
  'Santos': ['Corinthians', 'Palmeiras', 'São Paulo'],
  'São Paulo': ['Santos', 'Palmeiras', 'Corinthians'],
}