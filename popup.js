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

function sleep$1(ms) {
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
    await sleep$1(400);
  }
}

function sortPlayersByValorizationAsc(players) {
  return players.sort((a, b) => {
    const difference = a.valorization - b.valorization;

    if (Number.parseInt(difference * 100) === 0) {
      return b.totalScore - a.totalScore;
    }
    return difference;
  });
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
    mostScorableTeam
  }
}

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
      this.position == "TÉCNICO"
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
  }

  isPlayingAgainstMostScorableTeam(mostScorableTeam) {
    return this.awayTeam === mostScorableTeam.name;
  }

  isPlayingForLeastScorableTeam(leastScorableTeam) {
    return this.team === leastScorableTeam.name;
  }

  get isPlayingForTheHomeTeam() {
    const homeTeam =
      this.el.parentElement.parentElement.parentElement.parentElement
        .children[2].children[0].children[3].children[0].children[0].children[0]
        .children[0].alt;
    return this.team === homeTeam;
  }

  isAcceptable(mostScorableTeam, leastScorableTeam) {
    return (
      !this.isPlayingForFortaleza &&
      !this.isPlayingAgainstCeara &&
      this.isPlayingForTheHomeTeam &&
      this.averageScore > 0 &&
      !this.isPlayingAgainstMostScorableTeam(mostScorableTeam) &&
      !this.isPlayingForLeastScorableTeam(leastScorableTeam)
    );
  }

  buy() {
    this.el.parentElement.parentElement.parentElement.parentElement.children[6].children[0].children[0].click();
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

async function runBuildTeam() {
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

  const { leastScorableTeam, mostScorableTeam } =
    getLeastAndMostScorableTeams(teams);

  let acceptablePlayers = [];

  for (let i = 0; i < allPlayers.length; i++) {
    const player = allPlayers[i];
    if (player.isAcceptable(mostScorableTeam, leastScorableTeam)) {
      acceptablePlayers.push(player);
    }
  }

  acceptablePlayers = sortPlayersByValorizationAsc(acceptablePlayers);

  const principalTeam = [];
  const secondaryTeam = [];
  const maxNumberOfPlayersByTeam = {};

  for (let j = 0; j < acceptablePlayers.length; j++) {
    const player = acceptablePlayers[j];
    if (!maxNumberOfPlayersByTeam[player.team]) {
      maxNumberOfPlayersByTeam[player.team] = 0;
    }

    if (maxNumberOfPlayersByTeam[player.team] < 3) {
      if (principalTeamLimits[player.position] > 0) {
        principalTeam.push(player);
        principalTeamLimits[player.position] -= 1;
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
}

const runScript = document.getElementById("runScript");

// When the button is clicked, inject setPageBackgroundColor into current page
runScript.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: runBuildTeam,
  });
});
