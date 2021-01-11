import 'phaser';
import { ChestModel, MonsterModel } from '.';
import {
  SpawnerType, randomNumber, randomPick,
} from './utils';

type Callback = (id?: string, obj?: any) => void;

export type SpawnerConfig = {
  id?: string,
  spawnInterval?: number,
  limit?: number,
  objectType?: SpawnerType,
  spawnLocations?: [number, number][],
  addObject?: Callback,
  deleteObject?: Callback,
  moveObjects?: Callback;
};

export default class Spawner {
  id: string;

  spawnIntervalTime: number;

  limit: number;

  objectType: string;

  spawnLocations: [number, number][];

  spawnInterval: NodeJS.Timeout;

  moveInterval: NodeJS.Timeout;

  addObject: Callback;

  deleteObject: Callback;

  moveObjects: Callback;

  objects: (ChestModel | MonsterModel)[];

  constructor(config: SpawnerConfig) {
    this.id = config.id;
    this.spawnIntervalTime = config.spawnInterval;
    this.limit = config.limit;
    this.objectType = config.objectType;
    this.spawnLocations = config.spawnLocations;
    this.addObject = config.addObject;
    this.deleteObject = config.deleteObject;
    this.moveObjects = config.moveObjects;

    this.objects = [];
    // this.objects.runChildUpdate = true;

    this.start();
  }

  start() {
    this.spawnInterval = setInterval(() => {
      if (this.objects.length < this.limit) {
        this.spawnObject();
      }
    }, this.spawnIntervalTime);
    if (this.objectType === SpawnerType.MONSTER) this.moveMonsters();
  }

  spawnObject() {
    if (this.objectType === SpawnerType.CHEST) {
      this.spawnChest();
    } else if (this.objectType === SpawnerType.MONSTER) {
      this.spawnMonster();
    }
  }

  spawnChest() {
    const location = this.pickRandomLocation();
    const chest = new ChestModel(location[0], location[1], randomNumber(10, 20), this.id);
    this.objects.push(chest);
    this.addObject(chest.id, chest);
  }

  spawnMonster() {
    const location = this.pickRandomLocation();
    const monster = new MonsterModel(
      location[0],
      location[1],
      randomNumber(10, 20),
      this.id,
      randomNumber(0, 20),
      randomNumber(3, 5),
      1,
    );
    this.objects.push(monster);
    this.addObject(monster.id, monster);
  }

  pickRandomLocation(): number[] {
    const location = randomPick(this.spawnLocations);
    const invalidLocation = this.objects.some((obj) => {
      if (obj.x === location[0] && obj.y === location[1]) {
        return true;
      }
      return false;
    });

    if (invalidLocation) return this.pickRandomLocation();
    return location;
  }

  removeObject(id: string) {
    this.objects = this.objects.filter((obj) => obj.id !== id);
    this.deleteObject(id);
  }

  moveMonsters() {
    this.moveInterval = setInterval(() => {
      this.objects.forEach((monster: MonsterModel) => {
        monster.move();
      });

      this.moveObjects();
    }, 1000);
  }
}
