import 'phaser';
import { Player } from './Player';
import { Weapon } from '../Weapon';
import { Direction } from '../../utils/direction';

export class PlayerContainer extends Phaser.GameObjects.Container {
  public scene: Phaser.Scene;

  cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  gold: number;

  velocity: number;

  playerAttacking: boolean;

  private _health: number;

  maxHealth: number;

  swordHit: boolean;

  direction: Direction;

  player: Player;

  weapon: Weapon;

  healthBar: any;

  body: Phaser.Physics.Arcade.Body;

  attackSound: Phaser.Sound.BaseSound;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    frame: number,
    attackSound: Phaser.Sound.BaseSound,
  ) {
    super(scene, x, y);
    this.scene = scene;
    // Cursor for character movement
    this.cursors = scene.input.keyboard.createCursorKeys();
    // save the players coins for use later
    this.gold = 0;
    // set velocity
    this.velocity = 160;
    // Track if player is attacking
    this.playerAttacking = false;
    // Track if sword has hit
    this.swordHit = false;
    this.direction = Direction.RIGHT;
    this.attackSound = attackSound;

    // Player stats
    this._health = 10;
    this.maxHealth = this._health;
    this.gold = 0;

    // set a size for the container
    this.setSize(64, 64);

    // enable physics
    this.scene.physics.world.enable(this);
    // collide with world bounds
    this.body.setCollideWorldBounds(true);
    // add the player to the scene.
    this.scene.add.existing(this);
    // have the camera follow the player
    this.scene.cameras.main.startFollow(this);

    // create a player
    this.player = new Player(this.scene, 0, 0, frame);
    this.add(this.player);

    // create the weapon
    this.weapon = new Weapon(this);

    // Draw the healthBar
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

  faceRight(flag: boolean) {
    this.player.flipX = flag;
  }

  drawHealthBar() {
    // Create a health bar
    if (!this.healthBar) {
      this.healthBar = this.scene.add.graphics();
    }
    const x = this.x - (this.displayWidth / 2);
    const y = this.y - (this.displayHeight / 2) - 8;
    const width = 64;
    const thickness = 5;
    this.healthBar.clear();
    this.healthBar.fillStyle(0xFFFFFF, 1);
    this.healthBar.fillRect(x, y, width, thickness);
    this.healthBar.fillGradientStyle(0x000FFF, 0xFF0000, 0x000FFF, 0xFF0000);
    // this.healthBar.fillStyle(0x0000FF, 1);
    this.healthBar.fillRect(x, y, width * (this._health / this.maxHealth), thickness);
  }

  respawn() {
    this._health = this.maxHealth;
    this.scene.events.emit('respawnPlayer', this);
  }

  updateHealth(delta: number) {
    this._health += delta;
    if (this._health > this.maxHealth) {
      this._health = this.maxHealth;
    }
  }

  update() {
    this.body.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.body.setVelocityX(-this.velocity);
      this.direction = Direction.LEFT;
      this.weapon.setPosition(-40, 0);
      this.faceRight(false);
    } else if (this.cursors.right.isDown) {
      this.body.setVelocityX(this.velocity);
      this.direction = Direction.RIGHT;
      this.weapon.setPosition(40, 0);
      this.faceRight(true);
    }

    if (this.cursors.up.isDown) {
      this.body.setVelocityY(-this.velocity);
      this.direction = Direction.UP;
      this.weapon.setPosition(0, -40);
    } else if (this.cursors.down.isDown) {
      this.body.setVelocityY(this.velocity);
      this.direction = Direction.DOWN;
      this.weapon.setPosition(0, 40);
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && !this.playerAttacking) {
      this.playerAttacking = true;
      this.attackSound.play();
      this.weapon.alpha = 1;
      this.scene.time.delayedCall(150, () => {
        this.weapon.alpha = 0;
        this.playerAttacking = false;
        this.swordHit = false;
      });
    }

    if (this.playerAttacking) {
      if (this.weapon.flipX) {
        this.weapon.angle -= 10;
      } else {
        this.weapon.angle += 10;
      }
    } else {
      if (this.direction === Direction.DOWN) {
        this.weapon.setAngle(-270);
      } else if (this.direction === Direction.UP) {
        this.weapon.setAngle(-90);
      } else {
        this.weapon.setAngle(0);
      }
      this.weapon.flipX = false;
      if (this.direction === Direction.LEFT) this.weapon.flipX = true;
    }

    this.drawHealthBar();
  }
}

export default PlayerContainer;
