import 'phaser';
import { keys, randomNumber } from './utils';
import { Pickup, Mob } from '../classes';

export type SpawnerConfig = {
  id: string,
  scene: Phaser.Scene,
  spawnInterval: number,
  limit: number,
  objectType: string,
  spawnLocations: [number, number][],
};

export class Spawner {
  id: string;

  scene: Phaser.Scene;

  spawnInterval: number;

  limit: number;

  objectType: string;

  spawnLocations: [number, number][];

  interval: NodeJS.Timeout;

  objects: Phaser.Physics.Arcade.Group;

  constructor(config: SpawnerConfig) {
    this.id = config.id;
    this.scene = config.scene;
    this.spawnInterval = config.spawnInterval;
    this.limit = config.limit;
    this.objectType = config.objectType;
    this.spawnLocations = config.spawnLocations;

    this.objects = this.scene.physics.add.group();

    this.start();
  }

  start() {
    // Create all the objects for the locations.
    if (this.objectType === keys.CHEST_LAYER) {
      this.spawnLocations.forEach((pos) => {
        const chest = new Pickup(this.scene, pos[0], pos[1]);
        chest.makeInactive();
        this.objects.add(chest);
      });
    } else if (this.objectType === keys.MOB_LAYER) {
      this.spawnLocations.forEach((pos) => {
        const mob = new Mob(
          this.scene,
          pos[0],
          pos[1],
          randomNumber(3, 5),
          1,
        );
        mob.makeInactive();
        this.objects.add(mob);
      });
    }

    // set an interval to spawn a random object
    this.interval = setInterval(() => {
      if (this.objects.countActive(true) < this.limit) {
        this.spawnObject();
      }
    }, this.spawnInterval);
  }

  spawnObject() {
    // spawn a random inactive object.
    const n = randomNumber(0, this.objects.countActive(false));
    const obj = this.objects.getFirstNth(n);
    if (obj) {
      obj.makeActive();
    }
  }
}

export default Spawner;
