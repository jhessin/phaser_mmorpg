import 'phaser';
import { UiButton } from '../classes';
import { keys } from '../game_manager';

export default class TitleScene extends Phaser.Scene {
  titleText: Phaser.GameObjects.Text;

  button: UiButton;

  constructor() {
    super('Title');
  }

  create() {
    // create some buttons
    this.titleText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Zenva MMORPG', {
      fontSize: '64px',
      color: 'white',
    });
    this.titleText.setOrigin(0.5);

    this.button = new UiButton(
      this,
      this.scale.width / 2,
      this.scale.height * 0.65,
      keys.BUTTON1,
      keys.BUTTON2,
      'Start',
      () => {
        this.scene.start('Game');
      },
    );
  }
}
