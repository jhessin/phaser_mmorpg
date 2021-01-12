import socketio from 'socket.io';
import PlayerModel from './PlayerModel';

export function toObject(map: Map<string, any>): Record<string, any> {
  return Array.from(map).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
}

export default class GameManager {
  spawners: Map<string, any>;

  chests: Map<string, any>;

  monsters: Map<string, any>;

  players: Map<string, PlayerModel>;

  playerLocations: [number, number][];

  chestLocations: Map<string, [number, number][]>;

  monsterLocations: Map<string, [number, number][]>;

  io: socketio.Server;

  constructor(io: socketio.Server) {
    this.io = io;
    this.spawners = new Map();
    this.chests = new Map();
    this.monsters = new Map();
    this.players = new Map();

    this.playerLocations = [[50, 50], [100, 100]];
    this.chestLocations = new Map();
    this.monsterLocations = new Map();
  }

  setup() {
    this.parseMapData();
    this.setupEventListeners();
    this.setupSpawners();
  }

  parseMapData() {
  }

  setupEventListeners() {
    this.io.on('connection', (socket: socketio.Socket) => {
      // player disconnected
      socket.on('disconnect', () => {
        // delete user data from server
        this.players.delete(socket.id);

        // emit a message to all players to remove this player
        this.io.emit('disconnected', socket.id);
      });

      socket.on('newPlayer', () => {
        // create a new player
        this.spawnPlayer(socket.id);

        // send the players object to new player
        socket.emit('currentPlayers', toObject(this.players));

        // send the monsters object to the new player
        socket.emit('currentMonsters', toObject(this.monsters));

        // send the chests object to the new player
        socket.emit('currentChests', toObject(this.chests));

        // inform other players of the new player
        this.io.emit('newPlayer', this.players.get(socket.id));
      });

      socket.on('playerMovement', (playerData: {
        x: number,
        y: number,
        flipX: boolean,
      }) => {
        const player = this.players.get(socket.id);
        if (player) {
          player.x = playerData.x;
          player.y = playerData.y;
          player.flipX = playerData.flipX;

          // emit a message to other players about the player that moved
          socket.broadcast.emit('playerMoved', player);
        }
      });
    });
  }

  setupSpawners() {
  }

  spawnPlayer(id: string) {
    const player = new PlayerModel(id, this.playerLocations);
    this.players.set(player.id, player);
  }
}
