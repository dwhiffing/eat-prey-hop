import { EntityType, EntityTypeKey } from './types'

export const DEBUG = false
export const initialGridSize = 3
export const maxWidth = 900
export const SCORE_FOR_GRID_SIZE_INCREASE = 100
export const SAVE_KEY = 'eat-prey-hop-highscore'
export const INITIAL_STATE = {
  gameOver: true,
  score: 0,
  gridSize: initialGridSize,
  highScore: 0,
  spawnPool: ['fox', 'wolf'] as EntityTypeKey[],
  nextSpawn: undefined,
  spawnTimer: 10,
  entities: {
    rabbit: {
      id: 'rabbit',
      type: 'rabbit' as EntityTypeKey,
      x: Math.floor(initialGridSize / 2),
      y: Math.floor(initialGridSize / 2),
    },
    carrot: {
      id: 'carrot',
      type: 'carrot' as EntityTypeKey,
      x: Math.floor(initialGridSize / 2) + 1,
      y: Math.floor(initialGridSize / 2),
    },
    // carrot0: { id: 'carrot0', type: 'carrot' as EntityTypeKey, x: 0, y: 1 },
    // carrot1: { id: 'carrot1', type: 'carrot' as EntityTypeKey, x: 1, y: 1 },
    // carrot2: { id: 'carrot2', type: 'carrot' as EntityTypeKey, x: 2, y: 1 },
    // carrot3: { id: 'carrot3', type: 'carrot' as EntityTypeKey, x: 3, y: 1 },
    // carrot4: { id: 'carrot4', type: 'carrot' as EntityTypeKey, x: 4, y: 1 },
    // carrot5: { id: 'carrot5', type: 'carrot' as EntityTypeKey, x: 5, y: 1 },
    // eagle: { id: 'eagle', type: 'eagle', x: 0, y: 0 },
    // fox: { id: 'fox', type: 'fox', x: 1, y: 0 },
    // wolf: { id: 'wolf', type: 'wolf', x: 2, y: 0 },
    // lion: { id: 'lion', type: 'lion', x: 3, y: 0 },
    // bear: { id: 'bear', type: 'bear', x: 4, y: 0 },
    // rock0: { id: 'rock0', type: 'rock', x: 5, y: 1 },
    // rock1: { id: 'rock1', type: 'rock', x: 5, y: 0 },
    // rock2: { id: 'rock2', type: 'rock', x: 4, y: 1 },
    // rock3: { id: 'rock3', type: 'rock', x: 3, y: 1 },
    // rock6: { id: 'rock6', type: 'rock', x: 2, y: 1 },
    // rock4: { id: 'rock4', type: 'rock', x: 1, y: 1 },
    // rock5: { id: 'rock5', type: 'rock', x: 0, y: 1 },
    // tree: { id: 'tree', type: 'tree', x: 0, y: 0 },
    // rock: { id: 'rock', type: 'rock', x: 0, y: 0 },
    // hole: { id: 'hole', type: 'hole', x: 0, y: 0 },
    // carrot: { id: 'carrot', type: 'carrot', x: 0, y: 0 },
  },
}

export const ENTITY_TYPES: Record<string, EntityType> = {
  rabbit: {
    image: 'rabbit',
    isDynamic: true,
    isPlayer: true,
    speed: 1,
    targets: ['carrot'],
    passable: ['bush'],
  },
  carrot: {
    image: 'carrot',
    isDynamic: false,
    isPlayer: false,
  },
  fox: {
    image: 'fox',
    isDynamic: true,
    isPlayer: false,
    speed: 2,
    food: 1,
    activeSightRange: 4,
    inactiveSightRange: 2,
    targets: ['rabbit'],
    passable: ['bush'],
  },
  wolf: {
    image: 'wolf',
    isDynamic: true,
    isPlayer: false,
    speed: 3,
    activeSightRange: 4,
    food: 2,
    maxFood: 4,
    evolveType: 'lion',
    inactiveSightRange: 3,
    targets: ['fox', 'rabbit'],
  },
  lion: {
    image: 'lion',
    isDynamic: true,
    isPlayer: false,
    speed: 5,
    food: 4,
    maxFood: 16,
    evolveType: 'bear',
    activeSightRange: 3,
    inactiveSightRange: 3,
    targets: ['wolf', 'fox', 'rabbit'],
  },
  bear: {
    image: 'bear',
    isDynamic: true,
    isPlayer: false,
    speed: 7,
    food: 8,
    activeSightRange: 3,
    inactiveSightRange: 2,
    targets: ['lion', 'rabbit'],
  },
  rock: {
    image: 'rock',
    isDynamic: false,
    isPlayer: false,
  },
  tree: {
    image: 'tree',
    isDynamic: false,
    isPlayer: false,
  },
  bush: {
    image: 'bush',
    isDynamic: false,
    isPlayer: false,
  },
  eagle: {
    image: 'eagle',
    isDynamic: true,
    isPlayer: false,
    speed: 1,
    targets: ['rabbit'],
  },
}
