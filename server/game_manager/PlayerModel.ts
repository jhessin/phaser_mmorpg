export default class PlayerModel {
  health: number;

  maxHealth: number;

  gold: number;

  id: string;

  spawnLocations: [number, number][];

  y: number;

  x: number;

  flipX: boolean;

  constructor(id: string, spawnLocations: [number, number][]) {
    this.health = 10;
    this.maxHealth = 10;
    this.gold = 0;
    this.id = id;
    this.spawnLocations = spawnLocations;
    this.flipX = true;

    const location = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)];
    [this.x, this.y] = location;
  }

  updateGold(gold: number) {
    this.gold += gold;
  }

  updateHealth(health: number) {
    this.health += health;
    if (this.health > 10) this.health = 10;
  }

  respawn() {
    this.health = this.maxHealth;
    const location = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)];
    [this.x, this.y] = location;
  }
}
