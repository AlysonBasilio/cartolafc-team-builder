import {
  principalTeamLimits,
  principalTeamMinimumPrice,
  secondaryTeamLimits,
} from "./constants";
import {
  sellAllPlayers,
  scrollUntilTheEndOfThePage,
  sortPlayersByValorizationAsc,
  getLeastAndMostScorableTeams,
} from "./utils";
import Player from "./Player";
import Team from "./Team";

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
