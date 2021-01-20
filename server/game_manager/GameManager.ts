import socketio from 'socket.io';
import * as levelData from '../public/assets/level/large_level.json';
import { PlayerData } from '../utils/types';
import ChestModel from './ChestModel';
import MonsterModel from './MonsterModel';
import PlayerModel from './PlayerModel';
import Spawner from './Spawner';
import { SpawnerType } from './utils';

export function toObject(map: Map<string, any>): Record<string, any> {
  return Array.from(map).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
}

export function getTiledProperty(obj: LayerObject, propertyName: string) {
  if (!obj.properties) return null;
  for (let i = 0; i < obj.properties.length; i += 1) {
    const property = obj.properties[i];
    if (property.name === propertyName) {
      return property.value;
    }
  }
  return null;
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

    this.playerLocations = [];
    this.chestLocations = new Map();
    this.monsterLocations = new Map();
  }

  setup() {
    this.parseMapData();
    this.setupEventListeners();
    this.setupSpawners();
  }

  parseMapData() {
    levelData.layers.forEach((layer: LayerData) => {
      if (layer.name === 'player_locations') {
        if (layer.objects) {
          layer.objects.forEach((obj: LayerObject) => {
            this.playerLocations.push([obj.x, obj.y]);
          });
        }
      } else if (layer.name === 'monster_locations') {
        if (layer.objects) {
          layer.objects.forEach((obj: LayerObject) => {
            const spawner = getTiledProperty(obj, 'spawner');
            if (obj.properties && spawner) {
              const location = this.monsterLocations.get(spawner);
              if (location) location.push([obj.x, obj.y]);
              else this.monsterLocations.set(spawner, [[obj.x, obj.y]]);
            }
          });
        }
      } else if (layer.name === 'chest_locations') {
        if (layer.objects) {
          layer.objects.forEach((obj: LayerObject) => {
            const spawner = getTiledProperty(obj, 'spawner');
            if (obj.properties && spawner) {
              const location = this.chestLocations.get(spawner);
              if (location) location.push([obj.x, obj.y]);
              else this.chestLocations.set(spawner, [[obj.x, obj.y]]);
            }
          });
        }
      }
    });
  }

  setupEventListeners() {
    this.io.on('connection', (socket: socketio.Socket) => {
      // console.log(`${socket.id} connected.`);
      // player disconnected
      socket.on('disconnect', () => {
        // console.log(`${socket.id} disconnected.`);
        // delete user data from server
        this.players.delete(socket.id);

        // emit a message to all players to remove this player
        this.io.emit('disconnectPlayer', socket.id);
      });

      socket.on('newPlayer', async () => {
        // console.log(`${socket.id} newPlayer.`);
        // create a new player
        this.spawnPlayer(socket.id);

        // console.log(`${socket.id} emiting initial data.`);

        // send the players object to new player
        socket.emit('currentPlayers', toObject(this.players));

        // send the monsters object to the new player
        socket.emit('currentMonsters', toObject(this.monsters));

        // send the chests object to the new player
        socket.emit('currentChests', toObject(this.chests));

        // inform other players of the new player
        socket.broadcast.emit('spawnPlayer', this.players.get(socket.id));
        // console.log(`${socket.id} finished emiting initial data.`);
      });

      socket.on('playerMovement', (playerData: PlayerData) => {
        const player = this.players.get(socket.id);
        if (player) {
          player.x = playerData.x;
          player.y = playerData.y;
          player.flipX = playerData.flipX;
          player.attacking = playerData.playerAttacking;
          player.currentDirection = playerData.currentDirection;

          // emit a message to other players about the player that moved
          socket.broadcast.emit('playerMoved', playerData);
        }
      });
    });
  }

  setupSpawners() {
    const config = {
      spawnInterval: 3000,
      limit: 3,
      spawnerType: SpawnerType.CHEST,
      id: '',
    };
    let spawner;

    // create chest spawners
    Array.from(this.chestLocations.keys()).forEach((key) => {
      config.id = `chest-${key}`;

      spawner = new Spawner(
        config,
        this.chestLocations.get(key),
        this.addChest.bind(this),
        this.deleteChest.bind(this),
      );
      this.spawners.set(spawner.id, spawner);
    });

    // create monster spawners
    Array.from(this.monsterLocations.keys()).forEach((key) => {
      config.id = `monster-${key}`;
      config.spawnerType = SpawnerType.MONSTER;

      spawner = new Spawner(
        config,
        this.monsterLocations.get(key),
        this.addMonster.bind(this),
        this.deleteMonster.bind(this),
        this.moveMonsters.bind(this),
      );
      this.spawners.set(spawner.id, spawner);
    });
  }

  spawnPlayer(id: string) {
    const player = new PlayerModel(id, this.playerLocations);
    this.players.set(player.id, player);
    // console.log(`${id} Player Spawned.`);
  }

  addChest(chestId: string, chest: ChestModel) {
    this.chests.set(chestId, chest);
    this.io.emit('chestSpawned', chest);
  }

  deleteChest(chestId: string) {
    this.chests.delete(chestId);
    this.io.emit('chestRemoved', chestId);
  }

  addMonster(monsterId: string, monster: MonsterModel) {
    this.monsters.set(monsterId, monster);
    this.io.emit('monsterSpawned', monster);
  }

  deleteMonster(monsterId: string) {
    this.monsters.delete(monsterId);
    this.io.emit('monsterRemoved', monsterId);
  }

  moveMonsters() {
    this.io.emit('monsterMovement', this.monsters);
  }
}
