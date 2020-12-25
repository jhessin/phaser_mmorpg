import 'phaser';
import { keys, randomPick } from './utils';
import { Spawner } from './Spawner';
import {
  Pickup, PlayerContainer as Player, Map, Weapon, Mob,
} from '../classes';

export class GameManager {
  scene: Phaser.Scene;

  map: Map;

  player: Player;

  mapData: Array<Phaser.Tilemaps.ObjectLayer>;

  spawners: {[_: string]: Spawner };

  playerLocations: [[number, number]?];

  constructor(scene: Phaser.Scene) {
    // The game scene used for access to phaser systems
    this.scene = scene;

    // Create the map
    this.map = new Map(scene);
    // get the map data
    this.mapData = this.map.map.objects;

    // An array of spawners for spawning various game objects
    this.spawners = {};

    this.playerLocations = [];
  }

  setup() {
    // Parse Map Data
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

    // Setup Spawners
    this.spawners[keys.CHEST_LAYER] = new Spawner({
      id: 'Chest_Spawner',
      scene: this.scene,
      spawnInterval: 3000,
      limit: 5,
      objectType: keys.CHEST_LAYER,
      spawnLocations: chestLocations,
    });
    this.spawners[keys.MOB_LAYER] = new Spawner({
      id: 'Mob_Spawner',
      scene: this.scene,
      spawnInterval: 5000,
      limit: 10,
      objectType: keys.MOB_LAYER,
      spawnLocations: mobLocations,
    });

    // Spawn Player
    // Get a random location
    const pos = randomPick(this.playerLocations);
    this.player = new Player(this.scene, pos[0], pos[1], 0);

    // setup collisions
    // ... for map layer and player
    this.scene.physics.add.collider(this.player, this.map.blockedLayer);
    // ... for map layer and mobs
    this.scene.physics.add.collider(this.spawners[keys.MOB_LAYER].objects, this.map.blockedLayer);

    // ... for player and mobs
    this.scene.physics.add.overlap(
      this.player.weapon,
      this.spawners[keys.MOB_LAYER].objects,
      this.playerAttack,
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
    chest.sound.play();
  }

  playerAttack(weapon: Weapon, mob: Mob) {
    if (this.player.playerAttacking && !this.player.swordHit) {
      this.player.swordHit = true;
      weapon.attack(mob, this);
      if (this.player.health <= 0) {
        this.player.gold /= 2;
        this.player.gold = Math.floor(this.player.gold);
        this.scene.events.emit('updateScore', this.player.gold);
        this.player.respawn();
      }
    }
  }

  update() {
    // update player input
    this.player.update();
  }
}

export default GameManager;
