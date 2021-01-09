import { v4 } from 'uuid';
import { randomPick } from './utils';

type PlayerConfig = {
  health?: number,
  maxHealth?: number,
  gold?: number,
};

export default class PlayerModel {
  id: string;

  x: number;

  y: number;

  private _health: number;

  maxHealth: number;

  gold: number;

  spawnLocations: [number, number][];

  constructor(spawnLocations: [number, number][], playerConfig: PlayerConfig = {
    health: 10,
    maxHealth: 10,
    gold: 0,
  }) {
    this.health = playerConfig.health;
    this.maxHealth = playerConfig.maxHealth;
    this.gold = 0;
    this.id = `player-${v4()}`;
    this.spawnLocations = spawnLocations;

    const location = this.spawnLocations[Math.floor(Math.random()
      * this.spawnLocations.length)];
    [this.x, this.y] = location;
  }

  set health(value: number) {
    if (value < 0) this._health = 0;
    else if (value > this.maxHealth) this._health = this.maxHealth;
    else this._health = value;
  }

  updateGold(gold: number) {
    this.gold += gold;
  }

  updateHealth(health: number) {
    this.health += health;
  }

  respawn() {
    this.health = this.maxHealth;
    const location = randomPick(this.spawnLocations);
    [this.x, this.y] = location;
  }
}
