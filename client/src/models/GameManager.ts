import 'phaser';
import { keys, randomPick } from './utils';
import { Spawner } from './Spawner';
import {
  Pickup, PlayerContainer as Player, GameMap, Weapon, Mob,
} from '../classes';

export class ClientManager {
  scene: Phaser.Scene;

  gameMap: GameMap;

  player: Player;

  goldSound: Phaser.Sound.BaseSound;

  playerDeathSound: Phaser.Sound.BaseSound;

  playerAttackSound: Phaser.Sound.BaseSound;

  playerDamageSound: Phaser.Sound.BaseSound;

  enemyDeathSound: Phaser.Sound.BaseSound;

  mapData: Array<Phaser.Tilemaps.ObjectLayer>;

  spawners: { [_: string]: Spawner };

  playerLocations: [[number, number]?];

  constructor(scene: Phaser.Scene) {
    // The game scene used for access to phaser systems
    this.scene = scene;

    // Create the gameMap
    this.gameMap = new GameMap(scene);
    // get the map data
    this.mapData = this.gameMap.map.objects;

    // An array of spawners for spawning various game objects
    this.spawners = {};

    this.playerLocations = [];
  }

  setup() {
    // Parse GameMap Data
    // Chest and mob locations in arrays
    const chestLocations: [[number, number]?] = [];
    const mobLocations: [[number, number]?] = [];

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
          chestLocations.push([obj.x * 2, obj.y * 2]);
        });
      } else if (layer.name === keys.MOB_LAYER) {
        // Mob locations
        layer.objects.forEach((obj) => {
          mobLocations.push([obj.x * 2, obj.y * 2]);
        });
      }
    });
    // Setup Event Listeners
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
    this.player.gold += chest.gold;
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

export default ClientManager;
