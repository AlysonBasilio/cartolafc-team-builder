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

export default Team