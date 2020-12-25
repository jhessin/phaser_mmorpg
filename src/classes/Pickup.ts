import 'phaser';
import { keys, randomNumber } from '../models/utils';

export class Pickup extends Phaser.Physics.Arcade.Image {
  gold: number;

  sound: Phaser.Sound.BaseSound;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, keys.ITEMS, 0);
    this.scene = scene;

    // set the origin to bottom left to match Tiled
    this.setOrigin(0, 1);
    this.setScale(2);

    this.sound = this.scene.sound.add(keys.GOLD_SOUND, {
      loop: false,
      volume: 0.2,
    });

    // how much gold does the pickup reward
    this.gold = randomNumber(5, 15);

    // enable physics
    this.scene.physics.world.enable(this);

    // add to the scene
    this.scene.add.existing(this);
  }

  makeActive() {
    this.setActive(true);
    this.setVisible(true);
    this.body.checkCollision.none = false;
  }

  makeInactive() {
    this.setActive(false);
    this.setVisible(false);
    this.body.checkCollision.none = true;
  }
}

export default Pickup;
