import 'phaser';
import { keys, randomPick } from './utils';
import {
  PlayerContainer as Player, GameMap, Weapon,
  Monster as Mob, Chest as Pickup,
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

  spawners: Map<string, Spawner>;

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
    this.spawners = new Map();
    this.chests = new Map();
    this.monsters = new Map();
    this.players = new Map();

    this.playerLocations = [];
    this.chestLocations = {};
    this.monsterLocations = {};
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
          this.chestLocations.push([obj.x * 2, obj.y * 2]);
        });
      } else if (layer.name === keys.MOB_LAYER) {
        // Mob locations
        layer.objects.forEach((obj) => {
          this.monsterLocations.push([obj.x * 2, obj.y * 2]);
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
        this.spawners.get(chest.spawnerId).removeObject(chestId);
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
          this.spawners.get(monster.spawnerId).removeObject(monsterId);
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

    this.scene.events.on('respawnPlayer', (player: Player) => {
      const [x, y] = randomPick(this.playerLocations);
      player.setPosition(x, y);
    });

    // Setup Audio
    this.goldSound = this.scene.sound.add(keys.GOLD_SOUND, {
      loop: false,
      volume: 0.2,
    });
    this.playerDeathSound = this.scene.sound.add(keys.PLAYER_DEATH, {
      loop: false,
      volume: 0.2,
    });
    this.playerDamageSound = this.scene.sound.add(keys.PLAYER_DAMAGE, {
      loop: false,
      volume: 0.2,
    });
    this.playerAttackSound = this.scene.sound.add(keys.PLAYER_ATTACK, {
      loop: false,
      volume: 0.2,
    });
    this.enemyDeathSound = this.scene.sound.add(keys.ENEMY_DEATH, {
      loop: false,
      volume: 0.2,
    });

    // Setup Spawners
    this.spawners[keys.CHEST_LAYER] = new Spawner({
      id: 'Chest_Spawner',
      scene: this.scene,
      spawnIntervalTime: 3000,
      limit: 5,
      objectType: keys.CHEST_LAYER,
      spawnLocations: chestLocations,
    });

    this.spawners[keys.MOB_LAYER] = new Spawner({
      id: 'Mob_Spawner',
      scene: this.scene,
      spawnIntervalTime: 5000,
      limit: 10,
      objectType: keys.MOB_LAYER,
      spawnLocations: mobLocations,
      deathSound: this.enemyDeathSound,
    });

    // Spawn Player
    // Get a random location
    const pos = randomPick(this.playerLocations);
    this.player = new Player(this.scene, pos[0], pos[1], 0, this.playerAttackSound);

    // setup collisions
    // ... for map layer and player
    this.scene.physics.add.collider(this.player, this.gameMap.blockedLayer);
    // ... for map layer and mobs
    this.scene.physics.add.collider(
      this.spawners[keys.MOB_LAYER].objects,
      this.gameMap.blockedLayer,
    );

    // ... for player weapon and mobs
    this.scene.physics.add.overlap(
      this.player.weapon,
      this.spawners[keys.MOB_LAYER].objects,
      this.enemyHit,
      null,
      this,
    );

    // ... for chests
    this.scene.physics.add.overlap(
      this.player,
      this.spawners[keys.CHEST_LAYER].objects,
      this.chestOverlap,
      null,
      this,
    );
  }

  chestOverlap(_: any, chest: Pickup) {
    this.player.gold += chest.coins;
    this.scene.events.emit('updateScore', this.player.gold);
    chest.makeInactive();
    this.goldSound.play();
  }

  enemyHit(weapon: Weapon, mob: Mob) {
    if (this.player.playerAttacking && !this.player.swordHit) {
      this.playerDamageSound.play();
      this.player.swordHit = true;
      weapon.attack(mob, this);
      if (this.player.health <= 0) {
        this.player.gold /= 2;
        this.player.gold = Math.floor(this.player.gold);
        this.scene.events.emit('updateScore', this.player.gold);
        this.playerDeathSound.play();
        this.player.respawn();
      }
    }
  }

  update() {
    // update player input
    this.player.update();
  }
}
