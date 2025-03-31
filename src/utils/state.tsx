import { proxy } from 'valtio'
import { DEBUG, INITIAL_STATE, SAVE_KEY } from '../constants'
import { Coord, Entity, EntityTypeKey } from '../types'

export const state = proxy<{
  gameOver: boolean
  gridSize: number
  highScore: number
  score: number
  lastScore: string
  spawnTimer: number
  nextSpawn?: { key: EntityTypeKey; coords: Coord }
  spawnPool: EntityTypeKey[]
  entities: Record<string, Entity>
}>({
  ...JSON.parse(JSON.stringify(INITIAL_STATE)),
  lastScore: '0',
  gameOver: DEBUG ? false : true,
  highScore: +(localStorage.getItem(SAVE_KEY) ?? '0'),
})
