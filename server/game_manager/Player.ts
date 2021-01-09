/* eslint-disable no-underscore-dangle */
class Player {
  private _id: string;

  private _health: number;

  private _maxHealth: number;

  private _gold: number;

  private _spawnLocations: [number, number][];

  x: number;

  y: number;

  constructor(id: string, spawnLocations: [number, number][]) {
    this._id = id;
    this._spawnLocations = spawnLocations;
    this._health = 10;
    this._maxHealth = this._health;
    this._gold = 0;

    const location = this._spawnLocations[Math.floor(Math.random() * this._spawnLocations.length)];
    [this.x, this.y] = location;
  }

  respawn() {
    this._health = this.maxHealth;
    const location = this._spawnLocations[Math.floor(Math.random() * this._spawnLocations.length)];
    [this.x, this.y] = location;
  }

  // Getters and setters
  get id() {
    return this._id;
  }

  get gold() {
    return this._gold;
  }

  get health() {
    return this._health;
  }

  set health(value: number) {
    if (value > this.maxHealth) {
      this._health = this.maxHealth;
    } else if (value < 0) {
      this._health = 0;
    } else {
      this.health = value;
    }
  }

  get maxHealth() {
    return this._maxHealth;
  }
}

export default Player;
