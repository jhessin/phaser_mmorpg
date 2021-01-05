import 'phaser';
import io from 'socket.io-client';
import scene from './scenes';
import './style.css';

// set the configuration of the game
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scene,
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

class Game extends Phaser.Game {
  globals: any;

  constructor() {
    super(config);
    const socket = io('http://localhost:3000');
    this.globals = { socket };
    this.scene.start('Boot');
  }
}

// typescript hoopla
declare global {
  interface Window { game: Game; }
}

window.onload = () => {
  window.game = new Game();
};
