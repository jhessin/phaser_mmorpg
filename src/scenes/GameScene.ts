import 'phaser';
import { GameManager } from '../models';

export class GameScene extends Phaser.Scene {
  gameManager: GameManager;

  constructor() {
    super('Game');
  }

  init() {
    // Run the ui on top of the game scene.
    this.scene.launch('Ui');
  }

  // Create assets
  create() {
    // setup the game manager
    this.gameManager = new GameManager(this);
    this.gameManager.setup();
  }

  update() {
    // if (this.player) this.player.update(this.cursors);
    this.gameManager.update();
  }
}

export default GameScene;
