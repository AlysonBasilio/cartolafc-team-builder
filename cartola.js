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
    this.isPlayingAgainstCeara = this.awayTeam === "Ceará";
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
    return this.awayTeam === mostScorableTeam.name;
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
    return this.indexes.valorization * this.indexes.totalScore
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

function comparePlayersValorizationAsc(playerA, playerB) {
  return playerA.valorization - playerB.valorization
}

function comparePlayersTotalScoreDesc(playerA, playerB) {
  return playerB.totalScore - playerA.totalScore
}

function comparePlayersIndexScoreAsc(playerA, playerB) {
  return playerA.indexScore - playerB.indexScore
}

function sortPlayersByValorizationAsc(players) {
  return players.sort((a, b) => {
    const difference = comparePlayersValorizationAsc(a, b);

    if (Number.parseInt(difference * 100) === 0) {
      return comparePlayersTotalScoreDesc(a, b);
    }
    return difference;
  });
}

function sortPlayersByTotalScoreDesc(players) {
  return players.sort(comparePlayersTotalScoreDesc);
}

function sortPlayersByIndexScoreAsc(players) {
  return players.sort(comparePlayersIndexScoreAsc);
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
    await sleep(60);
    const player = new Player(allProbablePlayers[i]);
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
  if (player.isAcceptable(mostScorableTeam, leastScorableTeam)) {
    acceptablePlayers.push(player);
  }
}

acceptablePlayers = sortPlayersByTotalScoreDesc(acceptablePlayers);
acceptablePlayers.forEach((player, index) => player.setIndex('totalScore', index));
acceptablePlayers = sortPlayersByValorizationAsc(acceptablePlayers);
acceptablePlayers.forEach((player, index) => player.setIndex('valorization', index));
acceptablePlayers = sortPlayersByIndexScoreAsc(acceptablePlayers);

const principalTeam = [];
let principalTeamValue = 0;
const principalTeamMaxValue = getTeamMaxValue();
const secondaryTeam = [];
const maxNumberOfPlayersByTeam = {};

for (let j = 0; j < acceptablePlayers.length; j++) {
  const player = acceptablePlayers[j];
  if (!maxNumberOfPlayersByTeam[player.team]) {
    maxNumberOfPlayersByTeam[player.team] = 0;
  }

  const teamsWithPlayersOnMyTeam = Object.keys(maxNumberOfPlayersByTeam).filter(team => maxNumberOfPlayersByTeam[team] > 0);
  console.log(teamsWithPlayersOnMyTeam);
  console.log(player.team);
  const isPlayingAgainstTeamWithPlayersOnMyTeam = teamsWithPlayersOnMyTeam.includes(player.playingAgainstTeam);
  if (maxNumberOfPlayersByTeam[player.team] < 3 &&
    principalTeamValue+player.currentValue < principalTeamMaxValue &&
    !isPlayingAgainstTeamWithPlayersOnMyTeam) {
    if (principalTeamLimits[player.position] > 0) {
      principalTeam.push(player);
      principalTeamLimits[player.position] -= 1;
      principalTeamValue += player.currentValue;
      if (player.currentValue < principalTeamMinimumPrice[player.position]) {
        principalTeamMinimumPrice[player.position] = player.currentValue;
      }
      maxNumberOfPlayersByTeam[player.team] += 1;
    } else if (
      secondaryTeamLimits[player.position] > 0 &&
      player.currentValue <= principalTeamMinimumPrice[player.position]
    ) {
      secondaryTeam.push(player);
      secondaryTeamLimits[player.position] -= 1;
    }
  }
}

for (let i = 0; i < principalTeam.length; i++) {
  principalTeam[i].buy();
}

console.table(principalTeam);
console.table(secondaryTeam);
