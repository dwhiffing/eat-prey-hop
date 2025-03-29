import { gridSize } from '../constants'
import { state } from './state'

export const moveEntity = (id: string, dx: number, dy: number) => {
  const entity = state.entities[id]
  if (!entity) return

  entity.x = Math.min(gridSize - 1, Math.max(0, entity.x + dx))
  entity.y = Math.min(gridSize - 1, Math.max(0, entity.y + dy))
}
