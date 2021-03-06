export default class Monster extends Phaser.Physics.Arcade.Image {
  id: string;

  health: number;

  maxHealth: number;

  healthBar: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    key: string,
    frame: number,
    id: string,
    health: number,
    maxHealth: number,
  ) {
    super(scene, x, y, key, frame);
    this.scene = scene;
    this.id = id;
    this.health = health;
    this.maxHealth = maxHealth;

    // enable physics
    this.scene.physics.world.enable(this);
    // collide with world bounds
    this.setCollideWorldBounds(true);
    // set immovable if another object collides with our monster
    this.setImmovable(true);
    // scale our monster
    this.setScale(2);
    // collide with world bounds
    this.setCollideWorldBounds(true);
    // add the monster to our existing scene
    this.scene.add.existing(this);
    // update the origin
    this.setOrigin(0);

    this.createHealthBar();
  }

  createHealthBar() {
    this.healthBar = this.scene.add.graphics();
    this.updateHealthBar();
  }

  updateHealthBar() {
    this.healthBar.clear();
    this.healthBar.fillStyle(0xffffff, 1);
    this.healthBar.fillRect(this.x, this.y - 8, 64, 5);
    this.healthBar.fillStyle(0xFF0000, 1);
    // this.healthBar.fillGradientStyle(0xff0000, 0xffffff, 4);
    this.healthBar.fillRect(this.x, this.y - 8, 64 * (this.health / this.maxHealth), 5);
  }

  updateHealth(health: number) {
    this.health = health;
    this.updateHealthBar();
  }

  makeActive() {
    this.setActive(true);
    this.setVisible(true);
    this.body.checkCollision.none = false;
    this.updateHealthBar();
  }

  makeInactive() {
    this.setActive(false);
    this.setVisible(false);
    this.body.checkCollision.none = true;
    this.healthBar.clear();
  }

  update() {
    this.updateHealthBar();
  }
}
