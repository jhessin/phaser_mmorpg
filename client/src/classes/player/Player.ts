import 'phaser';
import { keys } from '../../models/utils';

export class Player extends Phaser.Physics.Arcade.Image {
  constructor(scene: Phaser.Scene, x: number, y: number, frame: number) {
    super(scene, x, y, keys.CHARACTERS, frame);
    this.scene = scene;

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

export default Player;