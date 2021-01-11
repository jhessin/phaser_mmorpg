import 'phaser';
import { v4 } from 'uuid';
import { keys } from '../../game_manager/utils';

export default class Player extends Phaser.Physics.Arcade.Image {
  id: string;

  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    key: string = keys.CHARACTERS,
    frame: number = 0,
  ) {
    super(scene, x, y, key, frame);
    this.scene = scene;
    this.id = v4();

    // enable physics
    this.scene.physics.world.enable(this);
    // set immovable if another object collides with our player
    this.setImmovable(false);
    // set scale
    this.setScale(2);
    // add the player to the scene.
    this.scene.add.existing(this);
  }
}
