import { teamRivals } from "./constants";

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
    return this.indexes.valorization * this.indexes.totalScore
  }
}

export default Player;
