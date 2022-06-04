import { SCORE_MULTIPLES, teamRivals } from "./constants";

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
    this.isPlayingAgainstCeara = this.playingAgainstTeam === "Ceará";
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
    this.indexes = {}
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
    this.indexes[key] = value
  }

  get indexScore() {
    return Object.keys(this.indexes).reduce((acc, k) => (this.indexes[k] || 1)*acc*(SCORE_MULTIPLES[k] || 1), 1)
  }

  get isOffensive() {
    return ['ATACANTE', 'MEIA', 'LATERAL'].includes(this.position)
  }

  get isDefensive() {
    return ['GOLEIRO', 'LATERAL', 'ZAGUEIRO'].includes(this.position)
  }

  calculatePotentialScore(teams) {
    if (this.isOffensive) {
      const playingAgainstTeamDefensivePlayers = teams[this.playingAgainstTeam].defensivePlayers
      const score = playingAgainstTeamDefensivePlayers.map(player => player.medianScore).reduce((acc, v) => acc + this.medianScore - v, 0)
      this.potentialScore = score * (this.isPlayingForTheHomeTeam ? 1.2 : 0.8)
      return
    } else if (this.isDefensive) {
      const playingAgainstTeamOffensivePlayers = teams[this.playingAgainstTeam].offensivePlayers
      const score = playingAgainstTeamOffensivePlayers.map(player => player.medianScore).reduce((acc, v) => acc + this.medianScore - v, 0)
      this.potentialScore = score * (this.isPlayingForTheHomeTeam ? 1.2 : 0.8)
      return
    }
    this.potentialScore = 0
  }

  get playerId() {
    const url = new URL(this.el.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[1].children[0].children[0].children[0].children[1].children[2].children[0].href)
    return url.searchParams.get('atleta_id')
  }

  async fetchPlayerScores() {
    this.playerScores = await fetch(`https://api.cartola.globo.com/auth/mercado/atleta/${this.playerId}/pontuacao`).then(r => r.json());
    const nums = [...this.playerScores.map(score => score.pontos).filter(p => p !== null).filter(p => p !== 0)].sort((a, b) => a - b);
    if (nums.length <= 2) {
      this.medianScore = 0
      return
    }
    const midPosition = Math.floor(nums.length / 2)
    this.medianScore = nums.length % 2 !== 0 ? nums[midPosition] : (nums[midPosition - 1] + nums[midPosition]) / 2;
  }
}

export default Player;
