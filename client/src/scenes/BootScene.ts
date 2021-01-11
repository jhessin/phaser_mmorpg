import 'phaser';
import { keys } from '../game_manager';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    // Load ui images
    this.load.image(keys.BUTTON1, 'assets/images/ui/blue_button01.png');
    this.load.image(keys.BUTTON2, 'assets/images/ui/blue_button02.png');

    // Load sprite sheets
    this.load.spritesheet(keys.ITEMS, 'assets/images/items.png', {
      frameWidth: 32, frameHeight: 32,
    });
    this.load.spritesheet(keys.CHARACTERS, 'assets/images/characters.png', {
      frameWidth: 32, frameHeight: 32,
    });
    this.load.spritesheet(keys.MOBS, '../assets/images/monsters.png', {
      frameWidth: 32, frameHeight: 32,
    });

    // Load audio
    this.load.audio(keys.GOLD_SOUND, 'assets/audio/Pickup.wav');
    this.load.audio(keys.ENEMY_DEATH, 'assets/audio/EnemyDeath.wav');
    this.load.audio(keys.PLAYER_ATTACK, 'assets/audio/PlayerAttack.wav');
    this.load.audio(keys.PLAYER_DAMAGE, 'assets/audio/PlayerDamage.wav');
    this.load.audio(keys.PLAYER_DEATH, 'assets/audio/PlayerDeath.wav');

    // Load tiled map
    this.load.image(keys.BACKGROUND, 'assets/level/background-extruded.png');
    this.load.tilemapTiledJSON(keys.MAP, 'assets/level/large_level.json');
  }

  create(): void {
    // TODO: Update to go to title screen
    // this.scene.start('Title');
    this.scene.start('Game');
  }
}
