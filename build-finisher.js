function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isElementInViewport (el) {
  var rect = el.getBoundingClientRect();

  return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
  );
}

const rodape = document.getElementsByClassName('rodape__content')[0]
while(!isElementInViewport(rodape)) {
  rodape.scrollIntoView()
  await sleep(400)
}

function checkIfIsPlayingForTheHomeTeam(el, playerTeam) {
  const homeTeam = el.parentElement.parentElement.parentElement.parentElement.children[2].children[0].children[3].children[0].children[0].children[0].children[0].alt
  return playerTeam === homeTeam
}

let allPlayers = []
const allProbablePlayers = document.getElementsByClassName('cartola-atletas__preco-media')
const teams = {}
let mostScorableTeam = {
  name: '',
  score: 0
}
let leastScorableTeam = {
  name: '',
  score: 100000000
}

class Player {
  constructor(el) {
    this.team = el.parentElement.parentElement.parentElement.parentElement.children[1].children[0].children[0].children[0].children[0].alt
    this.homeTeam = el.parentElement.parentElement.parentElement.parentElement.children[2].children[0].children[3].children[0].children[0].children[0].children[0].alt
    this.awayTeam = el.parentElement.parentElement.parentElement.parentElement.children[2].children[0].children[3].children[0].children[0].children[2].children[0].alt
    this.isPlayingForTheHomeTeam = this.team === this.homeTeam
    this.againstTeam = this.isPlayingForTheHomeTeam ? this.awayTeam : this.homeTeam
    this.isPlayingForFortaleza = this.team === 'Fortaleza'
    this.isPlayingAgainstCeara = (this.isPlayingForTheHomeTeam && this.awayTeam === 'Ceará') || (!this.isPlayingForTheHomeTeam && this.homeTeam === 'Ceará')
    this.averageScore = Number.parseFloat(el.parentElement.parentElement.parentElement.parentElement.children[2].children[0].children[1].innerText)
    if (Number.isNaN(this.averageScore)) this.averageScore = 0
    this.matchesPlayed = Number.parseInt(el.parentElement.parentElement.parentElement.parentElement.children[2].children[0].children[2].innerText)
    if (Number.isNaN(this.matchesPlayed)) this.matchesPlayed = 0
    this.currentValue = Number.parseFloat(el.parentElement.parentElement.parentElement.parentElement.children[5].children[0].children[0].innerText.split(' ')[1])
    this.name = el.parentElement.parentElement.parentElement.parentElement.children[1].children[0].children[1].children[0].children[0].innerText
    this.position = el.parentElement.parentElement.parentElement.parentElement.children[1].children[0].children[1].children[0].children[1].innerText
    this.totalScore = this.averageScore * this.matchesPlayed
    this.calculatedScore = this.totalScore
    this.isPlayingAgainstMostScorableTeam = () => {
      return (this.isPlayingForTheHomeTeam && this.awayTeam === mostScorableTeam.name) || (!this.isPlayingForTheHomeTeam && this.homeTeam === mostScorableTeam.name)
    }
    this.isPlayingForMostScorableTeam = () => {
      return this.team === mostScorableTeam.name
    }
    this.isPlayingForLeastScorableTeam = () => {
      return this.team === leastScorableTeam.name
    }
    this.isPlayingAgainstLeastScorableTeam = () => {
      return (this.isPlayingForTheHomeTeam && this.awayTeam === leastScorableTeam.name) || (!this.isPlayingForTheHomeTeam && this.homeTeam === leastScorableTeam.name)
    }
    this.calculateScore = () => {
      if (
        this.isPlayingAgainstCeara
        || this.isPlayingForFortaleza
        || this.isPlayingAgainstMostScorableTeam()
        || this.isPlayingForLeastScorableTeam()
      ) {
        this.calculatedScore = 0
        return
      }
      if (this.isPlayingForTheHomeTeam) {
        this.calculatedScore *= 1.2
      } else {
        this.calculatedScore *= 0.8
      }
      if (this.isPlayingAgainstLeastScorableTeam()) {
        this.calculatedScore *= 1.2
      }
      if (this.isPlayingForMostScorableTeam()) {
        this.calculatedScore *= 1.2
      }
      if (teams[this.team].totalScore > teams[this.againstTeam].totalScore) {
        this.calculatedScore *= 1.2
      } else {
        this.calculatedScore *= 0.8
      }
    }
  }
}

function addPlayerToTeams(player) {
  if (!teams[player.team]) {
    teams[player.team] = {
      players: [],
      totalScore: 0
    }
  }

  teams[player.team].players.push(player)
  teams[player.team].totalScore += player.totalScore

  if (teams[player.team].totalScore > mostScorableTeam.score) {
    mostScorableTeam = {
      name: player.team,
      score: teams[player.team].totalScore
    }
  }
}

for (let i = 0; i < allProbablePlayers.length; i++) {
  const player = new Player(allProbablePlayers[i])
  allPlayers.push(player)
  addPlayerToTeams(player)
}

for (const teamName of Object.keys(teams)) {
  if (teams[teamName].totalScore < leastScorableTeam.score) {
    leastScorableTeam = {
      name: teamName,
      score: teams[teamName].totalScore
    }
  }
}

let acceptablePlayers = []

for (let i = 0; i < allPlayers.length; i++) {
  const player = allPlayers[i]
  if (
    !player.isPlayingForFortaleza
    && !player.isPlayingAgainstCeara
    && player.averageScore > 0
    && !player.isPlayingAgainstMostScorableTeam()
    && !player.isPlayingForLeastScorableTeam()
    && player.againstTeam !== 'Flamengo'
  ) {
    player.calculateScore()
    acceptablePlayers.push(player)
  }
}

acceptablePlayers = acceptablePlayers.sort((a,b) => b.calculatedScore - a.calculatedScore)

const principalTeamLimits = {
  GOLEIRO: 1,
  ZAGUEIRO: 2,
  'TÉCNICO': 1,
  LATERAL: 2,
  MEIA: 3,
  ATACANTE: 3
}

const principalTeamMinimumPrice = {
  GOLEIRO: 1000,
  ZAGUEIRO: 2000,
  'TÉCNICO': 1000,
  LATERAL: 2000,
  MEIA: 3000,
  ATACANTE: 3000,
}

const secondaryTeamLimits = {
  GOLEIRO: 1,
  ZAGUEIRO: 1,
  LATERAL: 1,
  MEIA: 1,
  'TÉCNICO': 0,
  ATACANTE: 1
}

const principalTeam = []
const secondaryTeam = []
const maxNumberOfPlayersByTeam = {}

for (let j = 0; j < acceptablePlayers.length; j++) {
  const player = acceptablePlayers[j];
  if (!maxNumberOfPlayersByTeam[player.team]) {
    maxNumberOfPlayersByTeam[player.team] = 0
  }

  if (maxNumberOfPlayersByTeam[player.team] < 3) {
    if (principalTeamLimits[player.position] > 0) {
      principalTeam.push(player)
      principalTeamLimits[player.position] -= 1
      if (player.currentValue < principalTeamMinimumPrice[player.position]) {
        principalTeamMinimumPrice[player.position] = player.currentValue
      }
      maxNumberOfPlayersByTeam[player.team] += 1
    } else if (secondaryTeamLimits[player.position] > 0 && player.currentValue <= principalTeamMinimumPrice[player.position]) {
      secondaryTeam.push(player)
      secondaryTeamLimits[player.position] -= 1
    }
  }
}

console.table(
  principalTeam.map(
    ({
      name,
      position,
      team,
      homeTeam,
      awayTeam,
      averageScore,
      matchesPlayed,
      currentValue,
      totalScore,
      calculatedScore,
      isPlayingAgainstMostScorableTeam,
      isPlayingForMostScorableTeam,
      isPlayingForLeastScorableTeam,
      isPlayingAgainstLeastScorableTeam,
    }) => ({
      name,
      position,
      team,
      homeTeam,
      awayTeam,
      averageScore,
      matchesPlayed,
      currentValue,
      totalScore,
      calculatedScore,
      isPlayingAgainstMostScorableTeam: isPlayingAgainstMostScorableTeam(),
      isPlayingForMostScorableTeam: isPlayingForMostScorableTeam(),
      isPlayingForLeastScorableTeam: isPlayingForLeastScorableTeam(),
      isPlayingAgainstLeastScorableTeam: isPlayingAgainstLeastScorableTeam(),
    })
  )
)
console.table(
  secondaryTeam.map(
    ({
      name,
      position,
      team,
      homeTeam,
      awayTeam,
      averageScore,
      matchesPlayed,
      currentValue,
      totalScore,
      calculatedScore,
      isPlayingAgainstMostScorableTeam,
      isPlayingForMostScorableTeam,
      isPlayingForLeastScorableTeam,
      isPlayingAgainstLeastScorableTeam,
    }) => ({
      name,
      position,
      team,
      homeTeam,
      awayTeam,
      averageScore,
      matchesPlayed,
      currentValue,
      totalScore,
      calculatedScore,
      isPlayingAgainstMostScorableTeam: isPlayingAgainstMostScorableTeam(),
      isPlayingForMostScorableTeam: isPlayingForMostScorableTeam(),
      isPlayingForLeastScorableTeam: isPlayingForLeastScorableTeam(),
      isPlayingAgainstLeastScorableTeam: isPlayingAgainstLeastScorableTeam(),
    })
  )
)