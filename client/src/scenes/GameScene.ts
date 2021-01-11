import 'phaser';
import {
  Player, PlayerContainer, Chest, Monster, GameMap, Weapon,
} from '../classes';
import GameManager, {
  ChestModel, keys, MonsterModel, PlayerModel,
} from '../game_manager';
import Game from '../game';

export default class GameScene extends Phaser.Scene {
  gameManager: GameManager;

  socket: SocketIOClient.Socket;

  player: PlayerContainer;

  goldPickupAudio: Phaser.Sound.BaseSound;

  playerAttackAudio: Phaser.Sound.BaseSound;

  playerDamageAudio: Phaser.Sound.BaseSound;

  playerDeathAudio: Phaser.Sound.BaseSound;

  monsterDeathAudio: Phaser.Sound.BaseSound;

  chests: Phaser.Physics.Arcade.Group;

  monsters: Phaser.Physics.Arcade.Group;

  cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  gameMap: GameMap;

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
    this.createMap();
    this.createAudio();
    this.createGroups();
    this.createInput();
    this.createGameManager();

    // emit an event to server that a new player joined
    this.socket.emit('newPlayer', { test: 1234 });
  }

  update() {
    if (this.player) this.player.update();
  }

  createAudio() {
    this.goldPickupAudio = this.sound.add(keys.GOLD_SOUND, {
      loop: false,
      volume: 0.3,
    });
    this.playerAttackAudio = this.sound.add(keys.PLAYER_ATTACK, {
      loop: false,
      volume: 0.01,
    });
    this.playerDamageAudio = this.sound.add(keys.PLAYER_DAMAGE, {
      loop: false,
      volume: 0.2,
    });
    this.playerDeathAudio = this.sound.add(keys.PLAYER_DEATH, {
      loop: false,
      volume: 0.2,
    });
    this.monsterDeathAudio = this.sound.add(keys.ENEMY_DEATH, {
      loop: false,
      volume: 0.2,
    });
  }

  createPlayer(playerObject: PlayerModel) {
    this.player = new PlayerContainer(
      this,
      playerObject.x * 2,
      playerObject.y * 2,
      keys.CHARACTERS,
      0,
      playerObject.health,
      playerObject.maxHealth,
      playerObject.id,
      this.playerAttackAudio,
    );
  }

  createGroups() {
    // create a chest group
    this.chests = this.physics.add.group();

    // create a monster Group
    this.monsters = this.physics.add.group();
  }

  spawnChest(chestObject: ChestModel) {
    let chest = this.chests.getFirstDead();
    if (!chest) {
      chest = new Chest(
        this,
        chestObject.x * 2,
        chestObject.y * 2,
        keys.ITEMS,
        0, chestObject.gold,
        chestObject.id,
      );
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
        monsterObject.x * 2,
        monsterObject.y * 2,
        keys.MOBS,
        monsterObject.frame,
        monsterObject.id,
        monsterObject.health,
        monsterObject.maxHealth,
      );
      this.monsters.add(monster);
    } else {
      monster.id = monsterObject.id;
      monster.health = monsterObject.health;
      monster.maxHealth = monsterObject.maxHealth;
      monster.setTexture(keys.MOBS, monsterObject.frame);
      monster.setPosition(monsterObject.x * 2, monsterObject.y * 2);
      monster.makeActive();
    }
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  addCollisions() {
    // check for collisions between the player and the tiled blocked layer
    this.physics.add.collider(this.player, this.gameMap.blockedLayer);

    // check for overlaps between player and chest
    this.physics.add.overlap(this.player, this.chests, this.collectChest, null, this);

    // check for collesions between the monsters and the tiled blocked layer
    this.physics.add.collider(this.monsters, this.gameMap.blockedLayer);

    // check for overlaps between the player's weapon and the monster game objects
    this.physics.add.overlap(this.player.weapon, this.monsters, this.enemyOverlap, null, this);
  }

  enemyOverlap(_weapon: Weapon, enemy: Monster) {
    if (this.player.playerAttacking && !this.player.swordHit) {
      this.player.swordHit = true;
      this.events.emit('monsterAttacked', enemy.id, this.player.id);
    }
  }

  collectChest(player: Player, chest: Chest) {
    // play gold pickup sound
    this.goldPickupAudio.play();
    this.events.emit('pickUpChest', chest.id, player.id);
  }

  createMap() {
    this.gameMap = new GameMap(
      this,
      keys.MAP,
      keys.BACKGROUND,
      keys.BACKGROUND,
      keys.BLOCKED,
    );
  }

  createGameManager() {
    // setup the game manager
    this.gameManager = new GameManager(this);
    this.gameManager.setup();
  }
}
