import Player from "./Player";
import Team from "./Team";

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isElementInViewport(el) {
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

export function sellAllPlayers() {
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

export async function scrollUntilTheEndOfThePage() {
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

function comparePlayersPotentialScoreDesc(playerA, playerB) {
  return playerB.potentialScore - playerA.potentialScore
}

function comparePlayersIndexScoreAsc(playerA, playerB) {
  return playerA.indexScore - playerB.indexScore
}

export function sortPlayersByValorizationAsc(players) {
  return players.sort((a, b) => {
    const difference = comparePlayersValorizationAsc(a, b);

    if (Number.parseInt(difference * 100) === 0) {
      return comparePlayersTotalScoreDesc(a, b);
    }
    return difference;
  });
}

export function sortPlayersByTotalScoreDesc(players) {
  return players.sort(comparePlayersTotalScoreDesc);
}

export function sortPlayersByPotentialScoreDesc(players) {
  return players.sort(comparePlayersPotentialScoreDesc);
}

export function sortPlayersByIndexScoreAsc(players) {
  return players.sort(comparePlayersIndexScoreAsc);
}

export function getLeastAndMostScorableTeams(teams) {
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

export async function getAllPlayersAndTeams() {
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

export function getTeamMaxValue() {
  return Number(document.querySelector("body > div.cartola-page > div.cartola-conteudo.well > ui-view > div.row.small-collapse.cartola-time-content > div.small-22.small-offset-1.large-20.large-offset-2.xxlarge-14.xxlarge-offset-5 > div.row.small-collapse.cartola-time__share-e-carteira > div:nth-child(2) > div > div:nth-child(3) > div.cartola-time__custo__valor.cartola-time__custo__valor--barra").innerText.replace(/[^0-9.]/gi, ''))
}