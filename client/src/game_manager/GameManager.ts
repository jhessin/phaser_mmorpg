import 'phaser';
import { keys, SpawnerType } from './utils';
import {
  PlayerContainer as Player, GameMap,
} from '../classes';
import {
  ChestModel, MonsterModel, Spawner, PlayerModel,
} from '.';

export default class GameManager {
  scene: Phaser.Scene;

  gameMap: GameMap;

  player: Player;

  goldSound: Phaser.Sound.BaseSound;

  playerDeathSound: Phaser.Sound.BaseSound;

  playerAttackSound: Phaser.Sound.BaseSound;

  playerDamageSound: Phaser.Sound.BaseSound;

  enemyDeathSound: Phaser.Sound.BaseSound;

  mapData: Phaser.Tilemaps.ObjectLayer[];

  spawners: Record<SpawnerType, Spawner>;

  playerLocations: [number, number][];

  chests: Map<string, ChestModel>;

  monsters: Map<string, MonsterModel>;

  players: Map<string, PlayerModel>;

  chestLocations: [number, number][];

  monsterLocations: [number, number][];

  constructor(scene: Phaser.Scene) {
    // The game scene used for access to phaser systems
    this.scene = scene;

    // Create the gameMap
    this.gameMap = new GameMap(scene);
    // get the map data
    this.mapData = this.gameMap.tilemap.objects;

    // An array of spawners for spawning various game objects
    this.chests = new Map();
    this.monsters = new Map();
    this.players = new Map();

    this.playerLocations = [];
    this.chestLocations = [];
    this.monsterLocations = [];
  }

  setup() {
    this.parseMapData();
    this.setupEventListeners();
    this.setupSpawners();
    this.spawnPlayer();
  }

  parseMapData() {
    // Parse GameMap Data
    // Iterate through each map layer
    this.mapData.forEach((layer: Phaser.Tilemaps.ObjectLayer) => {
      if (layer.name === keys.PLAYER_LAYER) {
        // Player locations
        layer.objects.forEach((obj) => {
          this.playerLocations.push([obj.x * 2, obj.y * 2]);
        });
      } else if (layer.name === keys.CHEST_LAYER) {
        // Chest locations
        layer.objects.forEach((obj) => {
          this.chestLocations.push(
            [obj.x * 2, obj.y * 2],
          );
        });
      } else if (layer.name === keys.MOB_LAYER) {
        // Mob locations
        layer.objects.forEach((obj) => {
          this.monsterLocations.push(
            [obj.x * 2, obj.y * 2],
          );
        });
      }
    });
  }

  setupEventListeners() {
    // Setup Event Listeners
    this.scene.events.on('pickUpChest', (chestId: string, playerId: string) => {
      // update the spawner
      const chest = this.chests.get(chestId);
      const player = this.players.get(playerId);
      if (chest && player) {
        const { gold } = chest;

        // update the players gold
        player.updateGold(gold);
        this.scene.events.emit('updateScore', player.gold);

        // remove the chest
        this.spawners[SpawnerType.CHEST].removeObject(chestId);
        this.scene.events.emit('chestRemoved', chestId);
      }
    });

    this.scene.events.on('monsterAttacked', (monsterId: string, playerId: string) => {
      // update the spawners
      const monster = this.monsters.get(monsterId);
      const player = this.players.get(playerId);

      if (monster && player) {
        const { gold, attack } = monster;

        // subtract health monster model
        monster.loseHealth();

        // check the monsters health, and if dead remove that object
        if (monster.health <= 0) {
          // updating the players gold
          player.updateGold(gold);
          this.scene.events.emit('updateScore', player.gold);

          // remove the monster
          this.spawners[SpawnerType.MONSTER].removeObject(monsterId);
          this.scene.events.emit('monsterRemoved', monsterId);

          // add bonus health to the player
          player.updateHealth(2);
        } else {
          // update the players health
          player.updateHealth(-attack);
          this.scene.events.emit('updatePlayerHealth', playerId,
            player.health);

          // update the monsters health
          this.scene.events.emit('updateMonsterHealth', monsterId, monster.health);

          // check the player's health, if below 0 have the player respawn
          if (player.health <= 0) {
            // update the gold the player has
            player.updateGold(-player.gold / 2);
            this.scene.events.emit('updateScore', player.gold);

            // respawn the player
            player.respawn();
            this.scene.events.emit('respawnPlayer', player);
          }
        }
      }
    });
  }

  setupSpawners() {
    // Setup Spawners
    this.spawners = {
      [SpawnerType.CHEST]: new Spawner({
        id: 'Chest_Spawner',
        spawnInterval: 3000,
        limit: 3,
        objectType: SpawnerType.CHEST,
        spawnLocations: this.chestLocations,
        addObject: this.addChest.bind(this),
        deleteObject: this.deleteChest.bind(this),
      }),
      [SpawnerType.MONSTER]: new Spawner({
        id: 'Mob_Spawner',
        spawnInterval: 5000,
        limit: 3,
        objectType: SpawnerType.MONSTER,
        spawnLocations: this.monsterLocations,
        addObject: this.addMonster.bind(this),
        deleteObject: this.deleteMonster.bind(this),
        moveObjects: this.moveMonsters.bind(this),
      }),
    };
  }

  spawnPlayer() {
    // Spawn Player
    const player = new PlayerModel(this.playerLocations);
    this.players.set(player.id, player);
    this.scene.events.emit('spawnPlayer', player);
  }

  addChest(chestId: string, chest: ChestModel) {
    this.chests.set(chestId, chest);
    this.scene.events.emit('chestSpawned', chest);
  }

  deleteChest(chestId: string) {
    this.chests.delete(chestId);
  }

  addMonster(monsterId: string, monster: MonsterModel) {
    this.monsters.set(monsterId, monster);
    this.scene.events.emit('monsterSpawned', monster);
  }

  deleteMonster(monsterId: string) {
    this.monsters.delete(monsterId);
  }

  moveMonsters() {
    this.scene.events.emit('monsterMovement', this.monsters);
  }
}
