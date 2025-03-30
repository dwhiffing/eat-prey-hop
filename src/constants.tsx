import { EntityType } from './types'

export const gridSize = 9
export const maxWidth = 900

export const ENTITY_TYPES: Record<string, EntityType> = {
  rabbit: {
    image: 'rabbit',
    isDynamic: true,
    isPlayer: true,
    speed: 1,
    targets: [],
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
    targets: ['rabbit'],
  },
  wolf: {
    image: 'wolf',
    isDynamic: true,
    isPlayer: false,
    speed: 3,
    targets: ['fox', 'rabbit'],
  },
  lion: {
    image: 'lion',
    isDynamic: true,
    isPlayer: false,
    speed: 5,
    targets: ['wolf', 'fox', 'rabbit'],
  },
  bear: {
    image: 'bear',
    isDynamic: true,
    isPlayer: false,
    speed: 7,
    targets: ['lion', 'rabbit'],
  },
  rock: {
    image: 'rock',
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
