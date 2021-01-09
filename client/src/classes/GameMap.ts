import 'phaser';
import { keys } from '../game_manager/utils';

export default class GameMap {
  scene: Phaser.Scene;

  map: Phaser.Tilemaps.Tilemap;

  tiles: Phaser.Tilemaps.Tileset;

  backgroundLayer: Phaser.Tilemaps.TilemapLayer;

  blockedLayer: Phaser.Tilemaps.TilemapLayer;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    // Create Map
    this.map = this.scene.make.tilemap({
      key: keys.MAP,
    });
    // update the world bounds
    this.scene.physics.world.bounds.width = this.map.widthInPixels * 2;
    this.scene.physics.world.bounds.height = this.map.heightInPixels * 2;
    // update camera bounds
    this.scene.cameras.main.setBounds(
      0, 0,
      this.map.widthInPixels * 2,
      this.map.heightInPixels * 2,
    );

    // add tileset image to map
    this.tiles = this.map.addTilesetImage(keys.TILE_SET_NAME, keys.TILE_SET_NAME, 32, 32, 1, 2);

    // create background layer
    this.backgroundLayer = this.map.createLayer(keys.BACKGROUND, this.tiles);
    this.backgroundLayer.setScale(2);

    // create blocked layer
    this.blockedLayer = this.map.createLayer(keys.BLOCKED, this.tiles);
    this.blockedLayer.setScale(2);
    this.blockedLayer.setCollisionByExclusion([-1]);
  }
}
