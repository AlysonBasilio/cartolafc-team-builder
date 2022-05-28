import {
  principalTeamLimits,
  principalTeamMinimumPrice,
  secondaryTeamLimits,
} from "./constants";
import {
  getAllPlayersAndTeams,
  getLeastAndMostScorableTeams,
  getTeamMaxValue,
  sortPlayersByIndexScoreAsc,
  sortPlayersByPotentialScoreDesc,
  sortPlayersByTotalScoreDesc,
  sortPlayersByValorizationAsc,
} from "./utils";

const { allPlayers, teams } = await getAllPlayersAndTeams();

const { leastScorableTeam, mostScorableTeam } =
  getLeastAndMostScorableTeams(teams);

let acceptablePlayers = [];

for (let i = 0; i < allPlayers.length; i++) {
  const player = allPlayers[i];
  if (player.isAcceptable(mostScorableTeam, leastScorableTeam)) {
    player.calculatePotentialScore(teams);
    acceptablePlayers.push(player);
  }
}

acceptablePlayers = sortPlayersByTotalScoreDesc(acceptablePlayers);
acceptablePlayers.forEach((player, index) => player.setIndex('totalScore', index+1))
acceptablePlayers = sortPlayersByValorizationAsc(acceptablePlayers);
acceptablePlayers.forEach((player, index) => player.setIndex('valorization', index+1))
acceptablePlayers = sortPlayersByPotentialScoreDesc(acceptablePlayers);
acceptablePlayers.forEach((player, index) => player.setIndex('potentialScore', index+1))
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

  const teamsWithPlayersOnMyTeam = Object.keys(maxNumberOfPlayersByTeam).filter(team => maxNumberOfPlayersByTeam[team] > 0)
  const isPlayingAgainstTeamWithPlayersOnMyTeam = teamsWithPlayersOnMyTeam.includes(player.playingAgainstTeam)
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
