import { proxy } from 'valtio'
import { gridSize } from '../constants'
import { Entity } from '../types'

export const state = proxy<{
  entities: Record<string, Entity>
}>({
  entities: {
    rabbit: {
      id: 'rabbit',
      image: 'rabbit',
      x: Math.floor(gridSize / 2),
      y: Math.floor(gridSize / 2),
    },
    fox: {
      id: 'fox',
      image: 'fox',
      x: Math.floor(gridSize / 2) - 2,
      y: Math.floor(gridSize / 2) - 2,
    },
    bear: {
      id: 'bear',
      image: 'bear',
      x: Math.floor(gridSize / 2) + 2,
      y: Math.floor(gridSize / 2) + 2,
    },
    foxa: {
      id: 'wolf',
      image: 'wolf',
      x: Math.floor(gridSize / 2) - 2,
      y: Math.floor(gridSize / 2) + 2,
    },
    foxb: {
      id: 'lion',
      image: 'lion',
      x: Math.floor(gridSize / 2) + 2,
      y: Math.floor(gridSize / 2) - 2,
    },
    tree: {
      id: 'tree',
      image: 'tree',
      x: Math.floor(gridSize / 2) + 3,
      y: Math.floor(gridSize / 2) - 2,
    },
    rock: {
      id: 'rock',
      image: 'rock',
      x: Math.floor(gridSize / 2) + 1,
      y: Math.floor(gridSize / 2) - 2,
    },
    hole: {
      id: 'hole',
      image: 'hole',
      x: Math.floor(gridSize / 2) + 1,
      y: Math.floor(gridSize / 2) - 3,
    },
    carrot: {
      id: 'carrot',
      image: 'carrot',
      x: Math.floor(gridSize / 2) + 1,
      y: Math.floor(gridSize / 2) - 4,
    },
  },
})
