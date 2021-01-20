import 'phaser';
import GameManager, { ChestModel, MonsterModel, PlayerModel } from '../game_manager';
import Game from '../game';

import {
  Chest, GameMap, Monster, PlayerContainer,
} from '../classes';
import { PlayerData } from '../utils/types';

export default class GameScene extends Phaser.Scene {
  socket: SocketIOClient.Socket;

  goldPickupAudio: Phaser.Sound.BaseSound;

  playerAttackAudio: Phaser.Sound.BaseSound;

  playerDamageAudio: Phaser.Sound.BaseSound;

  playerDeathAudio: Phaser.Sound.BaseSound;

  monsterDeathAudio: Phaser.Sound.BaseSound;

  player: PlayerContainer;

  chests: Phaser.Physics.Arcade.Group;

  monsters: Phaser.Physics.Arcade.Group;

  cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  gameMap: GameMap;

  gameManager: GameManager;

  otherPlayers: Phaser.Physics.Arcade.Group;

  constructor() {
    super('Game');
  }

  init() {
    this.scene.launch('Ui');

    // get a reference to our socket
    const game = this.sys.game as Game;
    this.socket = game.globals.socket;

    // Listen for socket events
    this.listenForSocketEvents();
  }

  listenForSocketEvents() {
    // spawn player game objects
    this.socket.on('currentPlayers', (players: Record<string, PlayerModel>) => {
      console.log('existing players: ');
      console.log(players);
      Object.keys(players).forEach((id) => {
        if (players[id].id === this.socket.id) {
          this.createPlayer(players[id], true);
          this.addCollisions();
        } else {
          this.createPlayer(players[id], false);
        }
      });
    });

    // remove disconnected players
    this.socket.on('disconnectPlayer', (id: string) => {
      this.otherPlayers.getChildren().forEach((player: PlayerContainer) => {
        if (player.id === id) {
          player.healthBar.clear();
          this.otherPlayers.remove(player, true);
        }
      });
    });

    // spawn monster game objects
    this.socket.on('currentMonsters', (monsters: Record<string, MonsterModel>) => {
      Object.keys(monsters).forEach((id: string) => {
        this.spawnMonster(monsters[id]);
      });
    });

    // spawn chest game objects
    this.socket.on('currentChests', (chests: Record<string, ChestModel>) => {
      Object.keys(chests).forEach((id: string) => {
        this.spawnChest(chests[id]);
      });
    });

    // spawn player game objects
    this.socket.on('spawnPlayer', (player: PlayerModel) => {
      this.createPlayer(player, false);
    });

    // listen for movement events
    this.socket.on('playerMoved', (player: PlayerData) => {
      this.otherPlayers.getChildren().forEach((otherPlayer: PlayerContainer) => {
        if (player.id === otherPlayer.id) {
          otherPlayer.updateHealthBar();
          otherPlayer.flipX = player.flipX;
          otherPlayer.setPosition(player.x, player.y);
          if (player.playerAttacking && !otherPlayer.playerAttacking) {
            otherPlayer.playerAttacking = player.playerAttacking;
            otherPlayer.attack();
          }
          otherPlayer.currentDirection = player.currentDirection;
        }
      });
    });

    this.socket.on('chestSpawned', (chest: ChestModel) => {
      this.spawnChest(chest);
    });

    this.socket.on('monsterSpawned', (monster: MonsterModel) => {
      this.spawnMonster(monster);
    });

    this.socket.on('chestRemoved', (chestId: string) => {
      this.chests.getChildren().forEach((chest: Chest) => {
        if (chest.id === chestId) {
          chest.makeInactive();
        }
      });
    });

    this.socket.on('monsterRemoved', (monsterId: string) => {
      this.monsters.getChildren().forEach((monster: Monster) => {
        if (monster.id === monsterId) {
          monster.makeInactive();
          this.monsterDeathAudio.play();
        }
      });
    });

    this.socket.on('monsterMovement', (monsters: Map<string, MonsterModel>) => {
      this.monsters.getChildren().forEach((monster: Monster) => {
        Object.keys(monsters).forEach((monsterId: string) => {
          if (monster.id === monsterId) {
            this.physics.moveToObject(monster, monsters.get(monsterId), 40);
          }
        });
      });
    });

    this.socket.on('updateScore', (goldAmount: number) => {
      this.events.emit('updateScore', goldAmount);
    });
  }

  createGameManager() {
    // this.events.on('spawnPlayer', (playerObject: PlayerModel) => {
    //   this.createPlayer(playerObject, true);
    //   this.addCollisions();
    // });

    this.events.on('updateMonsterHealth', (monsterId: string, health: number) => {
      this.monsters.getChildren().forEach((monster: Monster) => {
        if (monster.id === monsterId) {
          monster.updateHealth(health);
        }
      });
    });

    this.events.on('updatePlayerHealth', (_playerId: string, health: number) => {
      if (health < this.player.health) {
        this.playerDamageAudio.play();
      }
      this.player.updateHealth(health);
    });

    this.events.on('respawnPlayer', (playerObject: PlayerModel) => {
      this.playerDeathAudio.play();
      this.player.respawn(playerObject);
    });

    this.gameManager = new GameManager(this, this.gameMap.tilemap.objects);
    this.gameManager.setup();
  }

  create() {
    this.createMap();
    this.createAudio();
    this.createGroups();
    this.createInput();

    // this.createGameManager();

    // emit event to server that a new player joined
    this.socket.emit('newPlayer');
  }

  update() {
    if (this.player) this.player.update(this.cursors);

    if (this.player) {
      // emit player movement to the server
      const {
        id,
        x, y,
        flipX,
        playerAttacking,
        currentDirection,
      } = this.player;
      if (this.player.oldPosition
        && (x !== this.player.oldPosition.x
          || y !== this.player.oldPosition.y
          || flipX !== this.player.oldPosition.flipX
          || playerAttacking !== this.player.oldPosition.playerAttacking
          || currentDirection !== this.player.oldPosition.currentDirection
        )) {
        const playerData: PlayerData = {
          id,
          x,
          y,
          flipX,
          playerAttacking,
          currentDirection,
        };
        this.socket.emit('playerMovement', playerData);
      }

      // save old position data
      this.player.oldPosition = {
        id,
        x,
        y,
        flipX,
        playerAttacking,
        currentDirection,
      };
    }
  }

  createAudio() {
    this.goldPickupAudio = this.sound.add('goldSound', { loop: false, volume: 0.3 });
    this.playerAttackAudio = this.sound.add('playerAttack', { loop: false, volume: 0.01 });
    this.playerDamageAudio = this.sound.add('playerDamage', { loop: false, volume: 0.2 });
    this.playerDeathAudio = this.sound.add('playerDeath', { loop: false, volume: 0.2 });
    this.monsterDeathAudio = this.sound.add('enemyDeath', { loop: false, volume: 0.2 });
  }

  createPlayer(playerObject: PlayerModel, mainPlayer: boolean) {
    const player = new PlayerContainer(
      this,
      playerObject.x * 2,
      playerObject.y * 2,
      'characters',
      0,
      playerObject.health,
      playerObject.maxHealth,
      playerObject.id,
      this.playerAttackAudio,
      mainPlayer,
    );

    if (mainPlayer) {
      this.player = player;
    } else {
      this.otherPlayers.add(player);
    }
  }

  createGroups() {
    // create a chest group
    this.chests = this.physics.add.group();
    // create a monster group
    this.monsters = this.physics.add.group();
    this.monsters.runChildUpdate = true;

    // create an other players group
    this.otherPlayers = this.physics.add.group();
    this.otherPlayers.runChildUpdate = true;
  }

  spawnChest(chestObject: ChestModel) {
    let chest = this.chests.getFirstDead();
    if (!chest) {
      chest = new Chest(this, chestObject.x * 2, chestObject.y * 2, 'items', 0, chestObject.gold, chestObject.id);
      // add chest to chests group
      this.chests.add(chest);
    } else {
      chest.coins = chestObject.gold;
      chest.id = chestObject.id;
      chest.setPosition(chestObject.x * 2, chestObject.y * 2);
      chest.makeActive();
    }
  }

  spawnMonster(monsterObject: MonsterModel) {
    let monster = this.monsters.getFirstDead();
    if (!monster) {
      monster = new Monster(
        this,
        monsterObject.x,
        monsterObject.y,
        'monsters',
        monsterObject.frame,
        monsterObject.id,
        monsterObject.health,
        monsterObject.maxHealth,
      );
      // add monster to monsters group
      this.monsters.add(monster);
    } else {
      monster.id = monsterObject.id;
      monster.health = monsterObject.health;
      monster.maxHealth = monsterObject.maxHealth;
      monster.setTexture('monsters', monsterObject.frame);
      monster.setPosition(monsterObject.x, monsterObject.y);
      monster.makeActive();
    }
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  addCollisions() {
    // check for collisions between the player and the tiled blocked layer
    this.physics.add.collider(this.player, this.gameMap.blockedLayer);
    // check for overlaps between player and chest game objects
    this.physics.add.overlap(this.player, this.chests, this.collectChest, null, this);
    // check for collisions between the monster group and the tiled blocked layer
    this.physics.add.collider(this.monsters, this.gameMap.blockedLayer);
    // check for overlaps between the player's weapon and monster game objects
    this.physics.add.overlap(this.player.weapon, this.monsters, this.enemyOverlap, null, this);
  }

  enemyOverlap(_: any, enemy: Monster) {
    if (this.player.playerAttacking && !this.player.swordHit) {
      this.player.swordHit = true;
      this.events.emit('monsterAttacked', enemy.id, this.player.id);
    }
  }

  collectChest(player: PlayerContainer, chest: Chest) {
    // play gold pickup sound
    this.goldPickupAudio.play();
    this.socket.emit('pickUpChest', chest.id);
  }

  createMap() {
    // create map
    this.gameMap = new GameMap(this, 'map', 'background', 'background', 'blocked');
  }
}
