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

export default Team