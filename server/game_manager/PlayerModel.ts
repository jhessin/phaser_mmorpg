import { Direction } from '../utils/types';

export default class PlayerModel {
  health: number;

  maxHealth: number;

  gold: number = 0;

  id: string;

  spawnLocations: [number, number][];

  y: number;

  x: number;

  flipX: boolean = false;

  attacking: boolean = false;

  currentDirection: Direction = Direction.LEFT;

  constructor(
    id: string,
    spawnLocations: [number, number][],
    players: Map<string, PlayerModel>,
  ) {
    this.health = 10;
    this.maxHealth = 10;
    this.id = id;
    this.spawnLocations = spawnLocations;

    const location = this.generateLocation(players);
    [this.x, this.y] = location;
  }

  updateGold(gold: number) {
    this.gold += gold;
    this.gold = Math.floor(this.gold);
  }

  updateHealth(health: number) {
    this.health += health;
    if (this.health > 10) this.health = 10;
  }

  respawn(players: Map<string, PlayerModel>) {
    this.health = this.maxHealth;
    const location = this.generateLocation(players);
    [this.x, this.y] = location;
  }

  generateLocation(players: Map<string, PlayerModel>): [number, number] {
    const location = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)];
    const invalidLocation = Array.from(
      players.keys(),
    ).some((key) => (
      players.get(key).x === location[0]
      && players.get(key).y === location[1]));
    if (invalidLocation) return this.generateLocation(players);
    return location;
  }
}
