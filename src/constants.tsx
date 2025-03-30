import { EntityType } from './types'

export const gridSize = 9
export const maxWidth = 900

export const ENTITY_TYPES: Record<string, EntityType> = {
  rabbit: {
    image: 'rabbit',
    isDynamic: true,
    isPlayer: true,
    speed: 1,
  },
  fox: {
    image: 'fox',
    isDynamic: true,
    isPlayer: false,
    speed: 2,
  },
}
