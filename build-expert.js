import {
  principalTeamLimits,
} from "./constants";
import {
  getLeastAndMostScorableTeams,
  getAllPlayersAndTeams,
  sortPlayersByTotalScoreDesc,
  sortPlayersByPotentialScoreDesc,
  sortPlayersByIndexScoreAsc,
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
acceptablePlayers = sortPlayersByPotentialScoreDesc(acceptablePlayers);
acceptablePlayers.forEach((player, index) => player.setIndex('potentialScore', index+1))
acceptablePlayers = sortPlayersByIndexScoreAsc(acceptablePlayers);

const principalTeam = [];
const numberOfPlayersByTeam = {};

for (let j = 0; j < acceptablePlayers.length; j++) {
  const player = acceptablePlayers[j];
  if (!numberOfPlayersByTeam[player.team]) {
    numberOfPlayersByTeam[player.team] = 0;
  }

  const teamsWithPlayersOnMyTeam = Object.keys(numberOfPlayersByTeam).filter(team => numberOfPlayersByTeam[team] > 0)
  const isPlayingAgainstTeamWithPlayersOnMyTeam = teamsWithPlayersOnMyTeam.includes(player.playingAgainstTeam)
  if (!isPlayingAgainstTeamWithPlayersOnMyTeam && principalTeamLimits[player.position] > 0) {
    principalTeam.push(player);
    principalTeamLimits[player.position] -= 1;
    numberOfPlayersByTeam[player.team] += 1;
  }
}

console.table(principalTeam);
