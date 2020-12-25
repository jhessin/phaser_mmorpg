import 'phaser';

export class UiButton extends Phaser.GameObjects.Container {
  key: string;

  hoverKey: string;

  text: string;

  targetCallback: () => void;

  button: Phaser.GameObjects.Image;

  buttonText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, key: string, hoverKey: string, text: string, targetCallback: () => void) {
    super(scene, x, y);
    // The scene the button belongs to.
    this.scene = scene;

    // The position of the button.
    this.x = x;
    this.y = y;

    // The key for the background image of the button.
    this.key = key;

    // The key for the image displayed on hover.
    this.hoverKey = hoverKey;

    // The text to display on the button
    this.text = text;

    // the callback to handle when the button is clicked.
    this.targetCallback = targetCallback;

    // create the button
    this.createButton();

    // add the container to the scene.
    this.scene.add.existing(this);
  }

  createButton() {
    // Create the button
    this.button = new Phaser.GameObjects.Image(this.scene, 0, 0, this.key);
    // add interactivity
    this.button.setInteractive();
    // blow it up!
    this.button.setScale(1.4);

    // create the text
    this.buttonText = new Phaser.GameObjects.Text(this.scene, 0, 0, this.text, {
      fontSize: '26px',
      color: 'white',
    });
    // Center the text in the button if necessary?
    Phaser.Display.Align.In.Center(this.buttonText, this.button);

    // add the two game objects to the container.
    this.add(this.button);
    this.add(this.buttonText);

    this.button.on('pointerdown', () => {
      // TODO: animate this
    });
    this.button.on('pointerover', () => {
      this.button.setTexture(this.hoverKey);
    });
    this.button.on('pointerout', () => {
      this.button.setTexture(this.key);
    });
    this.button.on('pointerup', () => {
      this.targetCallback();
    });
  }
}

export default UiButton;
