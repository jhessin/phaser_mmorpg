export default class Player extends Phaser.Physics.Arcade.Image {
  constructor(scene: Phaser.Scene, x: number, y: number, key: string, frame: number) {
    super(scene, x, y, key, frame);
    this.scene = scene; // the scene this container will be added to

    // enable physics
    this.scene.physics.world.enable(this);
    // set immovable if another object collides with our player
    this.setPushable(true);
    // scale our player
    this.setScale(2);
    // add the player to our existing scene
    this.scene.add.existing(this);
  }
}
