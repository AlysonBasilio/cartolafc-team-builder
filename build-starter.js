import {
  principalTeamLimits,
  principalTeamMinimumPrice,
  secondaryTeamLimits,
} from "./constants";
import {
  sortPlayersByValorizationAsc,
  getLeastAndMostScorableTeams,
  getAllPlayersAndTeams,
  sellAllPlayers,
} from "./utils";

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
