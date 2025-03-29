import { proxy } from 'valtio'
import { gridSize } from '../constants'
import { Entity } from '../types'

export const state = proxy<{
  entities: Record<string, Entity>
}>({
  entities: {
    rabbit: {
      id: 'rabbit',
      x: Math.floor(gridSize / 2),
      y: Math.floor(gridSize / 2),
      index: 1,
    },
  },
})
