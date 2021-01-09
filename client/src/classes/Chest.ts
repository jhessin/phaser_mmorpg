import 'phaser';
import { v4 } from 'uuid';
import { keys, randomNumber } from '../game_manager/utils';

export default class Chest extends Phaser.Physics.Arcade.Image {
  coins: number;

  id: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    key = keys.ITEMS,
    frame = 0,
    coins = randomNumber(5, 15),
    id = v4(),
  ) {
    super(scene, x, y, key, frame);
    this.scene = scene;
    this.coins = coins;
    this.id = id;

    // enable physics
    this.scene.physics.world.enable(this);
    // add to the scene
    this.scene.add.existing(this);
    // set the origin to bottom left to match Tiled
    this.setOrigin(0, 1);
    // scale the chest game object
    this.setScale(2);
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
