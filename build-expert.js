import {
  principalTeamLimits,
  principalTeamMinimumPrice,
} from "./constants";
import {
  getAllPlayersAndTeams,
  getLeastAndMostScorableTeams,
  sortPlayersByPotentialScoreDesc,
} from "./utils";

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
const numberOfPlayersByTeam = {};

for (let j = 0; j < acceptablePlayers.length; j++) {
  const player = acceptablePlayers[j];
  if (!numberOfPlayersByTeam[player.team]) {
    numberOfPlayersByTeam[player.team] = 0;
  }

  if (principalTeamLimits[player.position] > 0) {
    principalTeam.push(player);
    principalTeamLimits[player.position] -= 1;
    principalTeamValue += player.currentValue;
    if (player.currentValue < principalTeamMinimumPrice[player.position]) {
      principalTeamMinimumPrice[player.position] = player.currentValue;
    }
    numberOfPlayersByTeam[player.team] += 1;
  }
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