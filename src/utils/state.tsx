import { proxy } from 'valtio'
import { gridSize } from '../constants'
import { Entity } from '../types'

export const state = proxy<{
  entities: Record<string, Entity>
}>({
  entities: {
    rabbit: {
      id: 'rabbit',
      type: 'rabbit',
      x: Math.floor(gridSize / 2),
      y: Math.floor(gridSize / 2),
    },
    fox: { id: 'fox', type: 'fox', x: 0, y: 0 },
    // bear: { id: 'bear', type: 'bear', x: 0, y: 0 },
    // wolf: { id: 'wolf', type: 'wolf', x: 0, y: 0 },
    // lion: { id: 'lion', type: 'lion', x: 0, y: 0 },
    // tree: { id: 'tree', type: 'tree', x: 0, y: 0 },
    // rock: { id: 'rock', type: 'rock', x: 0, y: 0 },
    // hole: { id: 'hole', type: 'hole', x: 0, y: 0 },
    // carrot: { id: 'carrot', type: 'carrot', x: 0, y: 0 },
  },
})
