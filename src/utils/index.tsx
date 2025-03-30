import {
  ENTITY_TYPES,
  EXPAND_POINTS,
  INITIAL_STATE,
  initialGridSize,
  SAVE_KEY,
} from '../constants'
import { Coord, Entity, EntityTypeKey } from '../types'
import { state } from './state'

const overlap = (a: Coord, b: Coord) => a.x === b.x && a.y === b.y

const getPassable = (a: Entity, b: Entity) => {
  const { targets, passable } = ENTITY_TYPES[a.type]
  return targets?.includes(b.type) || passable?.includes(b.type)
}

const moveEntity = (id: string, x: number, y: number) => {
  const entity = state.entities[id]
  if (!entity) return

  const newX = Math.min(state.gridSize - 1, Math.max(0, entity.x + x))
  const newY = Math.min(state.gridSize - 1, Math.max(0, entity.y + y))
  const dest = Object.values(state.entities).find((e) =>
    overlap({ x: newX, y: newY }, e),
  )
  if (dest && !getPassable(entity, dest)) return
  entity.x = newX
  entity.y = newY
}

export const getScoreMulti = () => {
  const bears = getEntitiesByType('bear').length * 16
  const lions = getEntitiesByType('lion').length * 8
  const wolves = getEntitiesByType('wolf').length * 4
  const foxes = Math.max(getEntitiesByType('fox').length * 2, 1)
  return bears + lions + wolves + foxes
}

let _id = 0
const spawnEntity = (type: EntityTypeKey, position: Coord) => {
  state.entities[`${type}-${_id}`] = {
    x: position.x,
    y: position.y,
    id: `${type}-${_id}`,
    type: type,
  }
  _id++
}

const spawnEnemy = (key: EntityTypeKey) => {
  if (state.nextSpawn) spawnEntity(key, state.nextSpawn.coords)
}

const removeEntity = (entity: Entity) => {
  delete state.entities[entity.id]
  if (entity.id === 'rabbit') {
    setTimeout(() => {
      const { score, highScore } = state
      const cloned = JSON.parse(JSON.stringify(INITIAL_STATE))
      Object.assign(state, JSON.parse(JSON.stringify(INITIAL_STATE)))
      state.nextSpawn = undefined
      state.spawnPool = cloned.spawnPool
      state.highScore = highScore
      if (score > highScore) {
        localStorage.setItem(SAVE_KEY, `${state.highScore}`)
      }
    }, 1000)
  }
}

const getEntitiesByType = (type: EntityTypeKey) =>
  Object.values(state.entities).filter((s) => s.type === type)
const getEntityByType = (type: EntityTypeKey) => getEntitiesByType(type)[0]

export const movePlayer = (dx: number, y: number) => {
  if (!state.entities.rabbit) return

  moveEntity('rabbit', dx, y)
  const carrot = getEntityByType('carrot')
  if (carrot) {
    if (overlap(state.entities.rabbit, carrot)) {
      state.score += 10 * getScoreMulti()
      const m = 1 + (state.gridSize - initialGridSize) / 2
      if (state.score >= EXPAND_POINTS[m - 1] && state.gridSize < 17) {
        state.gridSize = initialGridSize + m * 2
        Object.values(state.entities).forEach((e) => {
          e.x += 1
          e.y += 1
        })
        if (state.nextSpawn) {
          state.nextSpawn.coords.x += 1
          state.nextSpawn.coords.y += 1
        }
        getOuterRing(state.gridSize).map((c) =>
          Math.random() > 0.33
            ? undefined
            : spawnEntity(
                pick([
                  'bush',
                  'bush',
                  'bush',
                  'bush',
                  'bush',
                  'bush',
                  'tree',
                  'rock',
                ]) as EntityTypeKey,
                c,
              ),
        )
      }
      removeEntity(carrot)
    }
  } else {
    const blacklist = Object.values(state.entities).map(coordToKey)
    if (state.nextSpawn) blacklist.push(coordToKey(state.nextSpawn.coords))
    const pos = getRandomPosition(state.gridSize, blacklist)
    if (pos) spawnEntity('carrot', pos)
  }

  moveEnemies()

  state.spawnTimer--

  if (!state.nextSpawn) {
    const nearRabbit = getCoordsInDistance(state.entities.rabbit, 2)
    const blacklist = [...Object.values(state.entities), ...nearRabbit]
      .filter(Boolean)
      .map(coordToKey)
    const pos = getRandomPosition(state.gridSize, blacklist)
    if (pos) {
      state.nextSpawn = {
        key: state.spawnPool.shift()!,
        coords: pos,
      }
    }
  }
  if (state.spawnPool.length === 0) {
    // prettier-ignore
    // 90% fox
    state.spawnPool = shuffle(['fox', 'fox', 'fox', 'fox', 'fox', 'fox', 'fox', 'fox', 'fox', 'wolf'])
  }
  if (state.spawnTimer === 0 && state.nextSpawn) {
    state.spawnTimer = 10 + 1 * getScoreMulti()
    spawnEnemy(state.nextSpawn.key)
    state.nextSpawn = undefined
  }
}

const getRandomPosition = (
  gridSize: number,
  blacklist: string[],
): Coord | undefined => {
  let x, y, key
  let max = 99
  do {
    x = Math.floor(Math.random() * gridSize)
    y = Math.floor(Math.random() * gridSize)
    key = `${x},${y}`
    if (max-- <= 0) return undefined
  } while (blacklist.includes(key))
  return { x, y }
}

function getCoordsInDistance(center: Coord, distance: number): Coord[] {
  const coords: Coord[] = []

  for (let dx = -distance; dx <= distance; dx++) {
    for (let dy = -distance; dy <= distance; dy++) {
      coords.push({ x: center.x + dx, y: center.y + dy })
    }
  }

  return coords
}

const getEnemies = () =>
  Object.values(state.entities).filter((e) => {
    const entityType = ENTITY_TYPES[e.type]
    return entityType.isDynamic && !entityType.isPlayer
  })

const consumeEnemies = () => {
  const entities = Object.values(state.entities).filter(
    (e) => ENTITY_TYPES[e.type].isDynamic,
  )
  entities.forEach((pred) => {
    entities.forEach((prey) => {
      if (pred === prey || !overlap(pred, prey)) return

      const { food: preyFoodValue } = ENTITY_TYPES[prey.type]
      const {
        targets: predTargets,
        maxFood: requiredPredFood,
        evolveType,
      } = ENTITY_TYPES[pred.type]
      if (!predTargets?.includes(prey.type)) return

      pred.food ??= 0
      pred.food += preyFoodValue ?? 1

      if (pred.food >= (requiredPredFood ?? 1) && evolveType) {
        pred.type = evolveType
        pred.food = 0
      }

      removeEntity(prey)
    })
  })
}
const moveEnemies = () => {
  getEnemies().forEach((enemy) => moveEnemy(enemy.id))
  setTimeout(() => consumeEnemies(), 100)
}

const moveEnemy = (id: string) => {
  const enemy = state.entities[id]
  const { targets, speed, activeSightRange, inactiveSightRange } =
    ENTITY_TYPES[enemy.type]

  if (!targets) return

  enemy.pace = enemy.pace ?? 0
  enemy.pace++

  const excludeBush = (e: Coord) =>
    !Object.values(state.entities).some(
      (b) => b.type === 'bush' && e.x === b.x && e.y == b.y,
    )

  const activeCoords = getCoordsInDistance(enemy, activeSightRange ?? 0)
    .filter(excludeBush)
    .map(coordToKey)
  const inactiveCoords = getCoordsInDistance(enemy, inactiveSightRange ?? 0)
    .filter(excludeBush)
    .map(coordToKey)
  // if target is hidden in bush, lose target
  const _activeTarget = state.entities[enemy.activeTargetId ?? '']
  if (
    _activeTarget &&
    !activeCoords.some((c) => {
      const [x, y] = c.split(',').map(Number)
      return x === _activeTarget.x && y === _activeTarget.y
    })
  ) {
    enemy.activeTargetId = undefined
  }

  // check active target, change to better target if possible
  const possibleTargets = Object.values(state.entities)
    .filter(
      (e) => targets.includes(e.type) && inactiveCoords.includes(coordToKey(e)),
    )
    .sort((a, b) => targets.indexOf(a.type) - targets.indexOf(b.type))
  const activeTarget = state.entities[enemy.activeTargetId ?? '']
  if (
    !activeTarget ||
    (possibleTargets[0] &&
      targets.indexOf(possibleTargets[0].type) <
        targets.indexOf(activeTarget.type))
  ) {
    const target = possibleTargets[0]
    if (target) enemy.activeTargetId = target.id
  }

  // lose target if they are too far away
  const target = state.entities[enemy.activeTargetId ?? '']
  if (target && !activeCoords.includes(coordToKey(target))) {
    enemy.activeTargetId = undefined
    enemy.nextMove = undefined
  }

  // if we are ready to move and we have somewhere to move, move
  if (enemy.pace >= (speed ?? 0)) {
    if (enemy.nextMove) moveEntity(id, enemy.nextMove.x, enemy.nextMove.y)
    enemy.nextMove = undefined
    enemy.pace = 0
  }

  if (!enemy.nextMove) {
    // determine next move if we dont have one
    // if we are currently a target of something, run away from that instead of toward prey
    const predator = Object.values(state.entities).find(
      (e) => e.activeTargetId === id,
    )
    if (predator) {
      enemy.nextMove = getMoveDirection(enemy, predator, true, true)
    } else if (target && !overlap(enemy, target)) {
      enemy.nextMove = getMoveDirection(enemy, target, true, false)
    }
  }
}

const coordToKey = (coord: Partial<Coord>) => `${coord.x},${coord.y}`
const getMoveDirection = (
  src: Entity,
  dest: Entity,
  allowDiagonals = true,
  invert = false,
) => {
  if (!src || !dest) return { x: 0, y: 0 }

  let options: { change: Coord; coord: Coord }[] = [
    { change: { x: 1, y: 0 }, coord: { x: src.x + 1, y: src.y } },
    { change: { x: -1, y: 0 }, coord: { x: src.x - 1, y: src.y } },
    { change: { x: 0, y: 1 }, coord: { x: src.x, y: src.y + 1 } },
    { change: { x: 0, y: -1 }, coord: { x: src.x, y: src.y - 1 } },
  ]

  if (allowDiagonals) {
    options.push(
      { change: { x: 1, y: 1 }, coord: { x: src.x + 1, y: src.y + 1 } },
      { change: { x: 1, y: -1 }, coord: { x: src.x + 1, y: src.y - 1 } },
      { change: { x: -1, y: 1 }, coord: { x: src.x - 1, y: src.y + 1 } },
      { change: { x: -1, y: -1 }, coord: { x: src.x - 1, y: src.y - 1 } },
    )
  }

  const unpassable = Object.values(state.entities)
    .filter((e) => !getPassable(src, e))
    .map(coordToKey)
  options = options
    .filter((o) => !unpassable.includes(coordToKey(o.coord)))
    .filter(
      ({ coord: b }) =>
        b.x >= 0 && b.y >= 0 && b.x < state.gridSize && b.y < state.gridSize,
    )
    .sort((_a, _b) => {
      const a = invert ? _b : _a
      const b = invert ? _a : _b
      return (
        Math.abs(a.coord.x - dest.x) +
        Math.abs(a.coord.y - dest.y) -
        (Math.abs(b.coord.x - dest.x) + Math.abs(b.coord.y - dest.y))
      )
    })

  return options[0].change
}

const getOuterRing = (x: number): Coord[] => {
  if (x <= 1) return [{ x: 0, y: 0 }]

  const coordinates: Coord[] = []
  for (let col = 0; col < x; col++) coordinates.push({ x: 0, y: col })
  for (let row = 1; row < x; row++) coordinates.push({ x: row, y: x - 1 })
  for (let col = x - 2; col >= 0; col--) coordinates.push({ x: x - 1, y: col })
  for (let row = x - 2; row > 0; row--) coordinates.push({ x: row, y: 0 })

  return coordinates
}

function pick<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined
  return array[Math.floor(Math.random() * array.length)]
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// function getCoordsInRadius(center: Coord, radius: number): Coord[] {
//   const coords: Coord[] = []

//   for (let dx = -radius; dx <= radius; dx++) {
//     for (let dy = -radius; dy <= radius; dy++) {
//       if (dx * dx + dy * dy <= radius * radius) {
//         coords.push({ x: center.x + dx, y: center.y + dy })
//       }
//     }
//   }

//   return coords
// }
