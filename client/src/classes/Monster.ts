import 'phaser';
import { v4 } from 'uuid';
import { keys, randomNumber } from '../game_manager/utils';

export default class Monster extends Phaser.Physics.Arcade.Image {
  id: string;

  private _health: number;

  maxHealth: number;

  attack: number;

  body: Phaser.Physics.Arcade.Body;

  sound: Phaser.Sound.BaseSound;

  healthBar: Phaser.GameObjects.Graphics;

  deathSound: Phaser.Sound.BaseSound;

  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    key: string = keys.MOBS,
    frame: number = 0,
    id: string = v4(),
    health: number,
    maxHealth: number = health,
  ) {
    super(scene, x, y, key, frame);
    this.scene = scene;
    this.id = id;
    this.maxHealth = maxHealth;
    this.health = health;

    // enable physics
    this.scene.physics.world.enable(this);
    // set immovable
    this.setImmovable(false);
    // scale the monster
    this.setScale(2);
    // collide with world bounds
    this.body.setCollideWorldBounds(true);
    // add the monster to our existing scene
    this.scene.add.existing(this);
    // set the origin to bottom left to match Tiled
    this.setOrigin(0, 1);

    this.drawHealthBar();
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

  updateHealth(value: number) {
    this.health = value;
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

  update() {
    this.drawHealthBar();
  }

  move() {
    const randPos: number = randomNumber(1, 8);
    const distance: number = 64;
    const pos = {
      x: this.x,
      y: this.y,
    };

    switch (randPos) {
      case 1:
        pos.x += distance;
        break;
      case 2:
        pos.x -= distance;
        break;
      case 3:
        pos.y += distance;
        break;
      case 4:
        pos.y -= distance;
        break;
      case 5:
        pos.x += distance;
        pos.y += distance;
        break;
      case 6:
        pos.x += distance;
        pos.y -= distance;
        break;
      case 7:
        pos.x -= distance;
        pos.y += distance;
        break;
      case 8:
        pos.x -= distance;
        pos.y -= distance;
        break;
      default:
        break;
    }

    this.scene.physics.moveTo(this, pos.x, pos.y, 40);
  }
}
