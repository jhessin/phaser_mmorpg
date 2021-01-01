import 'phaser';
import * as Scenes from './scenes';
import './style.css';

// set the configuration of the game
const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scene: [
    Scenes.BootScene,
    Scenes.TitleScene,
    Scenes.GameScene,
    Scenes.UiScene,
  ],
  physics: {
    default: 'arcade',
    arcade: {
      // debug: true,
      gravity: {
        y: 0,
      },
    },
  },

  scale: {
    width: window.innerWidth,
    height: window.innerHeight,
  },

  render: {
    pixelArt: true,
    roundPixels: true,
  },
};

export default new Phaser.Game(gameConfig);
