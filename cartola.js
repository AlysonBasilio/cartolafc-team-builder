const principalTeamLimits = {
  GOLEIRO: 1,
  ZAGUEIRO: 2,
  TECNICO: 1,
  LATERAL: 2,
  MEIA: 3,
  ATACANTE: 3,
};

const principalTeamMinimumPrice = {
  GOLEIRO: 1000,
  ZAGUEIRO: 2000,
  TECNICO: 1000,
  LATERAL: 2000,
  MEIA: 3000,
  ATACANTE: 3000,
};

const secondaryTeamLimits = {
  GOLEIRO: 1,
  ZAGUEIRO: 1,
  LATERAL: 1,
  MEIA: 1,
  TECNICO: 0,
  ATACANTE: 1,
};

const teamRivals = {
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
};

const SCORE_MULTIPLES = {
  valorization: 0.1,
  totalScore: 0.3,
  medianScore: 0.5,
  potentialScore: 0.7,
};

class Player {
  constructor(el) {
    this.el = el;
    const principalParentElement =
      el.parentElement.parentElement.parentElement.parentElement;
    this.team =
      principalParentElement.children[1].children[0].children[0].children[0].children[0].alt;
    this.isPlayingForFortaleza = this.team === "Fortaleza";
    this.awayTeam =
      principalParentElement.children[2].children[0].children[3].children[0].children[0].children[2].children[0].alt;
    this.isPlayingAgainstCeara = this.playingAgainstTeam === "Ceará";
    this.averageScore = Number.parseFloat(
      principalParentElement.children[2].children[0].children[1].innerText
    );
    this.position =
      principalParentElement.children[1].children[0].children[1].children[0].children[1].innerText.replace(
        "É",
        "E"
      );
    this.matchesPlayed =
      this.position == "TECNICO"
        ? 1
        : Number.parseInt(
            principalParentElement.parentElement.parentElement.children[1].innerHTML
              .split("EM ")[1]
              .split(" JOGOS")[0]
          );
    this.valorization =
      Number.parseFloat(el.innerText) *
      (el.className.split(" ").includes("pont-negativa") ? -1 : 1);
    this.currentValue = Number.parseFloat(
      principalParentElement.children[5].children[0].children[0].innerText.split(
        " "
      )[1]
    );
    const initialPrice = this.currentValue - this.valorization;
    this.name =
      principalParentElement.children[1].children[0].children[1].children[0].children[0].innerText;
    this.percentualValorization = this.valorization / initialPrice;
    this.totalScore = this.averageScore * this.matchesPlayed;
    this.indexes = {};
  }

  isPlayingAgainstMostScorableTeam(mostScorableTeam) {
    return this.playingAgainstTeam === mostScorableTeam.name;
  }

  isPlayingForLeastScorableTeam(leastScorableTeam) {
    return this.team === leastScorableTeam.name;
  }

  get homeTeam() {
    return this.el.parentElement.parentElement.parentElement.parentElement
    .children[2].children[0].children[3].children[0].children[0].children[0]
    .children[0].alt;
  }

  get isPlayingForTheHomeTeam() {
    return this.team === this.homeTeam;
  }

  get playingAgainstTeam() {
    return this.isPlayingForTheHomeTeam ? this.awayTeam : this.homeTeam
  }

  get isPlayingAgainstRival() {
    return teamRivals[this.team].includes(this.playingAgainstTeam)
  }

  isAcceptable(mostScorableTeam, leastScorableTeam) {
    return (
      !this.isPlayingForFortaleza &&
      !this.isPlayingAgainstCeara &&
      this.averageScore > 0 &&
      this.potentialScore > 0 &&
      this.medianScore > 0 &&
      !this.isPlayingAgainstMostScorableTeam(mostScorableTeam) &&
      !this.isPlayingForLeastScorableTeam(leastScorableTeam) &&
      !this.isPlayingAgainstRival
    );
  }

  buy() {
    this.el.parentElement.parentElement.parentElement.parentElement.children[6].children[0].children[0].click();
  }

  setIndex(key, value) {
    this.indexes[key] = value;
  }

  get indexScore() {
    return Object.keys(this.indexes).reduce((acc, k) => (this.indexes[k] || 1)*acc*(SCORE_MULTIPLES[k] || 1), 1)
  }

  get isOffensive() {
    return ['ATACANTE', 'MEIA', 'LATERAL'].includes(this.position)
  }

  get isDefensive() {
    return ['GOLEIRO', 'LATERAL', 'ZAGUEIRO'].includes(this.position)
  }

  calculatePotentialScore(teams) {
    if (this.isOffensive) {
      const playingAgainstTeamDefensivePlayers = teams[this.playingAgainstTeam].defensivePlayers;
      const score = playingAgainstTeamDefensivePlayers.map(player => player.medianScore).reduce((acc, v) => acc + this.medianScore - v, 0);
      this.potentialScore = score * (this.isPlayingForTheHomeTeam ? 1.2 : 0.8);
      return
    } else if (this.isDefensive) {
      const playingAgainstTeamOffensivePlayers = teams[this.playingAgainstTeam].offensivePlayers;
      const score = playingAgainstTeamOffensivePlayers.map(player => player.medianScore).reduce((acc, v) => acc + this.medianScore - v, 0);
      this.potentialScore = score * (this.isPlayingForTheHomeTeam ? 1.2 : 0.8);
      return
    }

    const playingAgainstTeamPlayers = teams[this.playingAgainstTeam].players;
    const score = playingAgainstTeamPlayers.map(player => player.medianScore).reduce((acc, v) => acc + this.medianScore - v, 0);
    this.potentialScore = score * (this.isPlayingForTheHomeTeam ? 1.2 : 0.8);
  }

  get playerId() {
    const url = new URL(this.el.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[1].children[0].children[0].children[0].children[1].children[2].children[0].href);
    return url.searchParams.get('atleta_id')
  }

  async fetchPlayerScores() {
    this.playerScores = await fetch(`https://api.cartola.globo.com/auth/mercado/atleta/${this.playerId}/pontuacao`).then(r => r.json());
    const nums = [...this.playerScores.map(score => score.pontos).filter(p => p !== null).filter(p => p !== 0)].sort((a, b) => a - b);
    if (nums.length <= 2) {
      this.medianScore = 0;
      return
    }
    const midPosition = Math.floor(nums.length / 2);
    this.medianScore = nums.length % 2 !== 0 ? nums[midPosition] : (nums[midPosition - 1] + nums[midPosition]) / 2;
  }
}

class Team {
  constructor(name) {
    this.name = name;
    this.players = [];
    this.totalScore = 0;
  }

  addPlayer(player) {
    this.players.push(player);
    this.totalScore += player.totalScore;
  }

  get defensivePlayers() {
    return this.players.filter(player => player.isDefensive)
  }

  get offensivePlayers() {
    return this.players.filter(player => player.isOffensive)
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight ||
        document.documentElement.clientHeight) /* or $(window).height() */ &&
    rect.right <=
      (window.innerWidth ||
        document.documentElement.clientWidth) /* or $(window).width() */
  );
}

function sellAllPlayers() {
  document
    .querySelector(
      "body > div.cartola-page > div.cartola-conteudo.well > ui-view > div.row.small-collapse.cartola-time-content > div.small-22.small-offset-1.large-20.large-offset-2.xxlarge-14.xxlarge-offset-5 > div.row.full-width.small-collapse.cartola-time__botoes > div.column.small-24.medium-15.medium-push-9.large-push-9.large-15 > div > div.cartola__button.cartola__button--vermelho"
    )
    .click();
  document
    .querySelector(
      "body > div.cartola-page > div.cartola-conteudo.well > ui-view > div.cartola-popin-container.cartola-popin-container--overlay > div > div > ng-include > div > div.small-24.column.cartola-caixa-informacao-button > div"
    )
    .click();
}

async function scrollUntilTheEndOfThePage() {
  const rodape = document.getElementsByClassName("rodape__content")[0];
  while (!isElementInViewport(rodape)) {
    rodape.scrollIntoView();
    await sleep(400);
  }
}

function comparePlayersPotentialScoreDesc(playerA, playerB) {
  return playerB.potentialScore - playerA.potentialScore
}

function sortPlayersByPotentialScoreDesc(players) {
  return players.sort(comparePlayersPotentialScoreDesc);
}

function getLeastAndMostScorableTeams(teams) {
  let mostScorableTeam = {
    name: "",
    score: 0,
  };
  let leastScorableTeam = {
    name: "",
    score: 100000000,
  };

  for (const teamName of Object.keys(teams)) {
    if (teams[teamName].totalScore < leastScorableTeam.score) {
      leastScorableTeam = {
        name: teamName,
        score: teams[teamName].totalScore,
      };
    }
    if (teams[teamName].totalScore > mostScorableTeam.score) {
      mostScorableTeam = {
        name: teamName,
        score: teams[teamName].totalScore,
      };
    }
  }

  return {
    leastScorableTeam,
    mostScorableTeam,
  };
}

async function getAllPlayersAndTeams() {
  sellAllPlayers();

  await scrollUntilTheEndOfThePage();

  let allPlayers = [];
  const allProbablePlayers = document.getElementsByClassName(
    "cartola-atletas__preco-media"
  );
  const teams = {};

  for (let i = 0; i < allProbablePlayers.length; i++) {
    allProbablePlayers[
      i
    ].parentElement.parentElement.parentElement.parentElement.children[0].click();
    await sleep(260);
    const player = new Player(allProbablePlayers[i]);
    await player.fetchPlayerScores();
    allPlayers.push(player);

    if (!teams[player.team]) {
      teams[player.team] = new Team(player.team);
    }

    teams[player.team].addPlayer(player);
  }

  return {
    allPlayers,
    teams,
  };
}

function getTeamMaxValue() {
  return Number(document.querySelector("body > div.cartola-page > div.cartola-conteudo.well > ui-view > div.row.small-collapse.cartola-time-content > div.small-22.small-offset-1.large-20.large-offset-2.xxlarge-14.xxlarge-offset-5 > div.row.small-collapse.cartola-time__share-e-carteira > div:nth-child(2) > div > div:nth-child(3) > div.cartola-time__custo__valor.cartola-time__custo__valor--barra").innerText.replace(/[^0-9.]/gi, ''))
}

const { allPlayers, teams } = await getAllPlayersAndTeams();

const { leastScorableTeam, mostScorableTeam } =
  getLeastAndMostScorableTeams(teams);

let acceptablePlayers = [];

for (let i = 0; i < allPlayers.length; i++) {
  const player = allPlayers[i];
  player.calculatePotentialScore(teams);

  if (player.isAcceptable(mostScorableTeam, leastScorableTeam)) {
    acceptablePlayers.push(player);
  }
}

acceptablePlayers = sortPlayersByPotentialScoreDesc(acceptablePlayers);

const principalTeam = [];
let principalTeamValue = 0;
const principalTeamMaxValue = getTeamMaxValue();
const secondaryTeam = [];
const numberOfPlayersByTeam = {};

for (let j = 0; j < acceptablePlayers.length; j++) {
  const player = acceptablePlayers[j];
  if (!numberOfPlayersByTeam[player.team]) {
    numberOfPlayersByTeam[player.team] = 0;
  }

  if (principalTeamValue+player.currentValue < principalTeamMaxValue) {
    if (principalTeamLimits[player.position] > 0) {
      principalTeam.push(player);
      principalTeamLimits[player.position] -= 1;
      principalTeamValue += player.currentValue;
      if (player.currentValue < principalTeamMinimumPrice[player.position]) {
        principalTeamMinimumPrice[player.position] = player.currentValue;
      }
      numberOfPlayersByTeam[player.team] += 1;
    } else if (secondaryTeamLimits[player.position] > 0 && player.currentValue <= principalTeamMinimumPrice[player.position]) {
      secondaryTeam.push(player);
      secondaryTeamLimits[player.position] -= 1;
    }
  }
}

for (let i = 0; i < principalTeam.length; i++) {
  principalTeam[i].buy();
}

console.table(principalTeam.map(player => ({
  name: player.name,
  position: player.position,
  team: player.team,
  playingAgainstTeam: player.playingAgainstTeam,
  averageScore: player.averageScore,
  medianScore: player.medianScore,
  potentialScore: player.potentialScore,
  totalScore: player.totalScore,
  indexScore: player.indexScore,
})));
console.table(secondaryTeam.map(player => ({
  name: player.name,
  position: player.position,
  team: player.team,
  playingAgainstTeam: player.playingAgainstTeam,
  averageScore: player.averageScore,
  medianScore: player.medianScore,
  potentialScore: player.potentialScore,
  totalScore: player.totalScore,
  indexScore: player.indexScore,
})));
