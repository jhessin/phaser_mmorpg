import 'phaser';
import { SpawnerType, keys, randomNumber } from './utils';

type Callback = (id: string, obj: any) => void;

export type SpawnerConfig = {
  id?: string,
  scene?: Phaser.Scene,
  spawnInterval?: number,
  limit?: number,
  objectType?: SpawnerType,
  spawnLocations?: [number, number][],
  deathSound?: Phaser.Sound.BaseSound,
  addObject?: Callback,
  deleteObject?: Callback,
  moveObject?: Callback;
};

export default class Spawner {
  id: string;

  spawnIntervalTime: number;

  limit: number;

  objectType: string;

  spawnLocations: [number, number][];

  spawnInterval: NodeJS.Timeout;

  moveInterval: NodeJS.Timeout;

  objects: Phaser.Physics.Arcade.Group;

  deathSound: Phaser.Sound.BaseSound;

  scene: Phaser.Scene;

  addObject: Callback;

  deleteObject: Callback;

  moveObject: Callback;

  constructor(config: SpawnerConfig) {
    this.id = config.id;
    this.scene = config.scene;
    this.spawnIntervalTime = config.spawnInterval;
    this.limit = config.limit;
    this.objectType = config.objectType;
    this.spawnLocations = config.spawnLocations;
    this.addObject = config.addObject;
    this.deleteObject = config.deleteObject;
    this.moveObject = config.moveObject;
    this.deathSound = config.deathSound;

    this.objects = this.scene.physics.add.group();
    this.objects.runChildUpdate = true;

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
          this.deathSound,
        );
        mob.makeInactive();
        this.objects.add(mob);
      });
    }

    // set an interval to spawn a random object
    this.spawnInterval = setInterval(() => {
      if (this.objects.countActive(true) < this.limit) {
        this.spawnObject();
      }
    }, this.spawnIntervalTime);

    this.moveInterval = setInterval(() => {
      if (this.objectType === keys.MOB_LAYER) {
        this.moveMobs();
      }
    }, 1000);
  }

  removeObject(chestId: string) {
    throw new Error('Method not implemented.');
  }

  update() {
    this.objects.getChildren().forEach((obj: Phaser.GameObjects.GameObject) => {
      if (obj.active) obj.update();
    });
  }

  spawnObject() {
    // spawn a random inactive object.
    this.objects.shuffle();
    const obj = this.objects.getFirstDead();
    if (obj) {
      obj.makeActive();
    }
  }

  moveMobs() {
    if (this.objectType === keys.MOB_LAYER) {
      this.objects.getChildren().forEach((mob: Mob) => {
        if (mob.active) {
          mob.move();
          mob.drawHealthBar();
        }
      });
    }
  }
}
