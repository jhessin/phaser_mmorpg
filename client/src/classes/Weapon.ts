import 'phaser';
import { keys } from '../models/utils';
import { PlayerContainer } from './player';
import { ClientManager } from '../models';
import { Mob } from './Mob';

export class Weapon extends Phaser.Physics.Arcade.Image {
  damage: number;

  constructor(container: PlayerContainer, damage: number = 1) {
    super(container.scene, 40, 0, keys.ITEMS, 4);
    this.scene = container.scene;
    this.damage = damage;

    this.setScale(1.5);
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    container.add(this);
    this.alpha = 0;
  }

  attack(mob: Mob, manager: ClientManager) {
    const { gold, attack } = mob;
    const { player } = manager;
    player.updateHealth(-attack);
    // mob.health -= this.damage;
    mob.updateHealth(mob.health - this.damage);
    if (mob.health <= 0) {
      player.gold += gold;
      // add bonus health to player
      player.updateHealth(2);
      this.scene.events.emit('updateScore', player.gold);
      mob.kill();
    }
    mob.drawHealthBar();
  }
}

export default Weapon;
