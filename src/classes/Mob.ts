import 'phaser';
import { keys, randomNumber } from '../models/utils';

export class Mob extends Phaser.Physics.Arcade.Image {
  private _health: number;

  maxHealth: number;

  attack: number;

  gold: number;

  body: Phaser.Physics.Arcade.Body;

  sound: Phaser.Sound.BaseSound;

  healthBar: Phaser.GameObjects.Graphics;

  deathSound: Phaser.Sound.BaseSound;

  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    health: number,
    attack: number,
    deathSound: Phaser.Sound.BaseSound,
  ) {
    super(scene, x, y, keys.MOBS, 0);
    this.scene = scene;
    this._health = health;
    this.maxHealth = health;
    this.attack = attack;
    this.deathSound = deathSound;

    // set the origin to bottom left to match Tiled
    this.setOrigin(0, 1);

    // Scale it up
    this.setScale(2);

    // Create a sound for when the pickup is ... well picked up.
    this.sound = this.scene.sound.add(keys.GOLD_SOUND, {
      loop: false,
      volume: 0.2,
    });

    // The number of coins the pickup rewards.
    this.gold = randomNumber(1, 3) * (health + attack);

    // enable physics
    this.scene.physics.world.enable(this);
    // set immovable
    this.setImmovable(false);
    // collide with world bounds
    this.body.setCollideWorldBounds(true);

    // add to the scene
    this.scene.add.existing(this);
  }

  get health(): number {
    return this._health;
  }

  set health(value: number) {
    if (value >= this.maxHealth) {
      this._health = this.maxHealth;
    } else if (value <= 0) {
      this._health = 0;
    } else {
      this._health = value;
    }
  }

  updateHealth(value: number) {
    this.health = value;
  }

  drawHealthBar() {
    // Create a health bar
    if (!this.healthBar) {
      this.healthBar = this.scene.add.graphics();
    }
    this.healthBar.clear();
    this.healthBar.fillStyle(0xFFFFFF, 1);
    this.healthBar.fillRect(this.x, this.y + 8, 64, 5);
    // this.healthBar.fillGradientStyle(0xFF0000, 0xFFFFFF, 0xFF0000, 0xFFFFFF);
    this.healthBar.fillStyle(0xFF0000, 1);
    this.healthBar.fillRect(this.x, this.y + 8, 64 * (this._health / this.maxHealth), 5);
  }

  makeActive() {
    // get a random frame
    const frame = randomNumber(0, 19);
    this.setFrame(frame);
    this.setActive(true);
    this.setVisible(true);
    this.body.checkCollision.none = false;
    this._health = this.maxHealth;
    this.drawHealthBar();
  }

  kill() {
    this.deathSound.play();
    this.makeInactive();
  }

  makeInactive() {
    this.setActive(false);
    this.setVisible(false);
    this.body.checkCollision.none = true;
    if (this.healthBar) this.healthBar.destroy();
  }
}

export default Mob;
