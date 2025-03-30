import { proxy } from 'valtio'
import { INITIAL_STATE, SAVE_KEY } from '../constants'
import { Coord, Entity, EntityTypeKey } from '../types'

export const state = proxy<{
  gameOver: boolean
  highScore: number
  score: number
  spawnTimer: number
  nextSpawn?: { key: EntityTypeKey; coords: Coord }
  spawnPool: EntityTypeKey[]
  entities: Record<string, Entity>
}>({
  ...JSON.parse(JSON.stringify(INITIAL_STATE)),
  highScore: +(localStorage.getItem(SAVE_KEY) ?? '0'),
})
