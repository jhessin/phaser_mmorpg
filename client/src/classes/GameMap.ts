import 'phaser';
import { keys } from '../game_manager/utils';

export default class GameMap {
  scene: Phaser.Scene;

  key: string;

  tilemap: Phaser.Tilemaps.Tilemap;

  tileSetName: string;

  tiles: Phaser.Tilemaps.Tileset;

  bgLayerName: string;

  backgroundLayer: Phaser.Tilemaps.TilemapLayer;

  blockedLayerName: string;

  blockedLayer: Phaser.Tilemaps.TilemapLayer;

  constructor(scene: Phaser.Scene,
    key: string = keys.MAP,
    tileSetName: string = keys.TILE_SET_NAME,
    bgLayerName: string = keys.BACKGROUND,
    blockedLayerName: string = keys.BLOCKED) {
    this.scene = scene;
    // Tiled JSON file key name
    this.key = key;
    // Tiled Tileset image key name
    this.tileSetName = tileSetName;
    // the name of the layer created in tiled for the map background
    this.bgLayerName = bgLayerName;
    // the name of the layer created in tiled for the blocked areas
    this.blockedLayerName = blockedLayerName;

    this.createMap();
  }

  createMap() {
    // Create Map
    this.tilemap = this.scene.make.tilemap({
      key: this.key,
    });

    // add tileset image to map
    this.tiles = this.tilemap.addTilesetImage(this.tileSetName, this.tileSetName, 32, 32, 1, 2);

    // create background layer
    this.backgroundLayer = this.tilemap.createLayer(this.bgLayerName, this.tiles);
    this.backgroundLayer.setScale(2);

    // create blocked layer
    this.blockedLayer = this.tilemap.createLayer(this.blockedLayerName, this.tiles);
    this.blockedLayer.setScale(2);
    this.blockedLayer.setCollisionByExclusion([-1]);

    // update the world bounds
    this.scene.physics.world.bounds.width = this.tilemap.widthInPixels * 2;
    this.scene.physics.world.bounds.height = this.tilemap.heightInPixels * 2;

    // update camera bounds
    this.scene.cameras.main.setBounds(
      0, 0,
      this.tilemap.widthInPixels * 2,
      this.tilemap.heightInPixels * 2,
    );
  }
}
