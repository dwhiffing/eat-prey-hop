import { EntityType } from './types'

export const gridSize = 9
export const maxWidth = 900
export const DEBUG = true

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
    inactiveSightRange: 3,
    targets: ['fox', 'rabbit'],
  },
  lion: {
    image: 'lion',
    isDynamic: true,
    isPlayer: false,
    speed: 5,
    activeSightRange: 3,
    inactiveSightRange: 3,
    targets: ['wolf', 'fox', 'rabbit'],
  },
  bear: {
    image: 'bear',
    isDynamic: true,
    isPlayer: false,
    speed: 7,
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
