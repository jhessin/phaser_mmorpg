// setup Keys
export const keys = {
  BUTTON1: 'button1',
  BUTTON2: 'button2',
  ITEMS: 'items',
  CHARACTERS: 'characters',
  MOBS: 'monsters',
  GOLD_SOUND: 'goldsound',
  ENEMY_DEATH: 'enemyDeath',
  PLAYER_ATTACK: 'playerAttack',
  PLAYER_DAMAGE: 'playerDamage',
  PLAYER_DEATH: 'playerDeath',
  MAP: 'map',
  TILE_SET_NAME: 'background',
  BACKGROUND: 'background',
  BLOCKED: 'blocked',
  PLAYER_LAYER: 'player_locations',
  CHEST_LAYER: 'chest_locations',
  MOB_LAYER: 'monster_locations',
};

export function getTiledProperty(obj: any, propertyName: string) {
  for (let i = 0; i < obj.properties.length; i += 1) {
    const property = obj.properties[i];
    if (property.name === propertyName) {
      return property.value;
    }
  }
  return null;
}

export function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function randomPick(arr: Array<any>) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default keys;
