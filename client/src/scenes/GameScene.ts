import 'phaser';
import { GameManager } from '../models';
import Game from '../game';

export default class GameScene extends Phaser.Scene {
  gameManager: GameManager;

  socket: SocketIOClient.Socket;

  constructor() {
    super('Game');
  }

  init() {
    // Run the ui on top of the game scene.
    this.scene.launch('Ui');

    // get a reference to our socket
    const game = this.sys.game as Game;
    this.socket = game.globals.socket;

    // listen for socket events
    this.listenForSocketEvents();
  }

  listenForSocketEvents() {
    this.socket.on('newPlayer', (socketId: string, msg: string) => {
      console.log('new player event', socketId, 'sent from: ', msg);
    });
  }

  // Create assets
  create() {
    // setup the game manager
    this.gameManager = new GameManager(this);
    this.gameManager.setup();

    // emit an event to server that a new player joined
    this.socket.emit('newPlayer', { test: 1234 });
  }

  update() {
    // if (this.player) this.player.update(this.cursors);
    this.gameManager.update();
  }
}
