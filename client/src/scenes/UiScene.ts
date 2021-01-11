import 'phaser';
import { keys } from '../game_manager';

export default class UiScene extends Phaser.Scene {
  gameScene: Phaser.Scene;

  coinIcon: Phaser.GameObjects.Image;

  gold: number;

  scoreText: Phaser.GameObjects.Text;

  constructor() {
    super('Ui');
  }

  init() {
    // grab a reference to the game scene.
    this.gameScene = this.scene.get('Game');
  }

  create() {
    this.setupUiElements();
    this.setupEvents();
  }

  setupUiElements() {
    // add a coin icon.
    this.coinIcon = this.add.image(15, 15, keys.ITEMS, 3);

    // create the score text game object
    this.scoreText = this.add.text(35, 8, 'Gold: 0', {
      fontSize: '16px',
      color: 'white',
    });
  }

  setupEvents() {
    // listen for update score
    this.gameScene.events.on('updateScore', (gold: number) => {
      this.scoreText.setText(`Gold: ${gold}`);
    });
  }
}
