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
  fox: {
    image: 'fox',
    isDynamic: true,
    isPlayer: false,
    speed: 4,
    targets: ['rabbit'],
  },
  eagle: {
    image: 'eagle',
    isDynamic: true,
    isPlayer: false,
    speed: 1,
    targets: ['fox'],
  },
  wolf: {
    image: 'wolf',
    isDynamic: true,
    isPlayer: false,
    speed: 1,
    targets: ['fox', 'eagle'],
  },
  lion: {
    image: 'lion',
    isDynamic: true,
    isPlayer: false,
    speed: 5,
    targets: ['wolf'],
  },
  bear: {
    image: 'bear',
    isDynamic: true,
    isPlayer: false,
    speed: 7,
    targets: ['lion', 'rabbit'],
  },
}
