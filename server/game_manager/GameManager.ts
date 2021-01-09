import socketio from 'socket.io';
import Player from './Player';

export default class GameManager {
  private players: Map<string, Player>;

  private io: socketio.Server;

  constructor(io: socketio.Server) {
    this.io = io;
    this.players = new Map();
  }

  setup() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.io.on('connection', (socket: socketio.Socket) => {
      // player disconnected
      socket.on('disconnect', () => {
        // delete user data from server
        this.players.delete(socket.id);

        // emit a message to all players
        this.io.emit('disconnect', socket.id);
      });

      socket.on('newPlayer', () => {
        // create a new player object
        // this.spawnPlayer(socket.id);

        // send the players object to the new player
        socket.emit('currentPlayers', this.players);

        // send the monsters object to the new player
        socket.emit('currentPlayers', this.players);

        // send the chest objects to the new player
        socket.emit('currentPlayers', this.players);

        // inform the other players of the new player that joined
      });

      console.log('player connected to our game');
      console.log(socket.id);
    });
  }

  spawnPlayer(id: string) {
    const player = new Player(id, []);
    this.players.set(id, player);
  }

  // eslint-disable-next-line class-methods-use-this
  getValidPlayerLocations(): [number, number][] {
    // TODO: Implement this
    return [];
  }
}
