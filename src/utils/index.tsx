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
  if (!entity) return false

  const newX = Math.min(state.gridSize - 1, Math.max(0, entity.x + x))
  const newY = Math.min(state.gridSize - 1, Math.max(0, entity.y + y))
  const dest = Object.values(state.entities).find((e) =>
    overlap({ x: newX, y: newY }, e),
  )
  const type = ENTITY_TYPES[entity.type]!
  const enemies = getEnemies()
  if (
    entity.type !== 'eagle' &&
    dest &&
    enemies.some(
      (e) =>
        !type.targets!.includes(e.type) && e.x === dest.x && e.y === dest.y,
    )
  )
    return false
  if (entity.type !== 'eagle' && dest && !getPassable(entity, dest))
    return false
  entity.x = newX
  entity.y = newY
  return true
}

export const getScoreMulti = () => {
  const bears = getEntitiesByType('bear').length * 16
  const lions = getEntitiesByType('lion').length * 8
  const wolves = getEntitiesByType('wolf').length * 4
  const foxes = getEntitiesByType('fox').length
  return 1 + bears + lions + wolves + foxes
}

let _id = 0
const spawnEntity = (type: EntityTypeKey, position: Coord) => {
  if (type === 'rock' || type === 'tree') {
    const e = Object.values(state.entities)
    // if we are trying to spawn a rock/tree and there is already a rock/tree adjacent to it, bail
    if (
      getCoordsInDistance(position, 1).some((c) => {
        const thing = e.find((_c) => c.x === _c.x && c.y === _c.y)
        return thing && (thing.type === 'rock' || thing.type === 'tree')
      })
    )
      return
  }
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
  setTimeout(() => {
    delete state.entities[entity.id]
  }, 0)
  if (entity.id === 'rabbit') {
    const { score, highScore } = state
    setTimeout(() => {
      const cloned = JSON.parse(JSON.stringify(INITIAL_STATE))
      Object.assign(state, cloned)
      state.nextSpawn = undefined
      if (score > highScore) {
        state.highScore = score
        localStorage.setItem(SAVE_KEY, `${score}`)
      }
    }, 1000)
  }
}

const getEntitiesByType = (type: EntityTypeKey) =>
  Object.values(state.entities).filter((s) => s.type === type)
const getEntityByType = (type: EntityTypeKey) => getEntitiesByType(type)[0]

const getSpawnKey = (): EntityTypeKey => {
  const enemies = getEnemies()
  const foxCount = enemies.filter((e) => e.type === 'fox').length
  const wolfCount = enemies.filter((e) => e.type === 'wolf').length
  const lionCount = enemies.filter(
    (e) => e.type === 'lion' || e.type === 'bear',
  ).length

  if (foxCount === 0) return 'fox'
  if (wolfCount === 0) return 'wolf'
  if (lionCount > 0 && wolfCount === 1) return 'wolf'
  const totalCells = state.gridSize * state.gridSize
  if (enemies.length / totalCells > 0.1) return 'eagle'
  return 'fox'
}

export const movePlayer = (dx: number, y: number) => {
  if (!state.entities.rabbit) return

  moveEntity('rabbit', dx, y)
  // Restore this to disable waiting move
  // const didMove = moveEntity('rabbit', dx, y)
  // if (!didMove) return

  const carrot = getEntityByType('carrot')
  if (carrot) {
    if (overlap(state.entities.rabbit, carrot)) {
      const score = 10 * getScoreMulti()
      state.lastScore = `${score}-${Date.now()}`
      state.score += score
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
          Math.random() > 0.35
            ? undefined
            : spawnEntity(
                pick([
                  'bush',
                  // 'tree',
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
    const key = getSpawnKey()
    const c = Math.floor(state.gridSize / 2)
    const nearRabbit =
      key === 'eagle'
        ? getCoordsInDistance({ x: c, y: c }, c - 1)
        : getCoordsInDistance(state.entities.rabbit, 2)

    const blacklist = [...Object.values(state.entities), ...nearRabbit]
      .filter(Boolean)
      .map(coordToKey)
    const coords = getRandomPosition(state.gridSize, blacklist)
    if (coords) state.nextSpawn = { key, coords }
  }
  if (state.spawnTimer === 0 && state.nextSpawn) {
    state.spawnTimer = 12
    spawnEnemy(state.nextSpawn.key)
    if (
      state.nextSpawn.coords.x === state.entities.rabbit.x &&
      state.nextSpawn.coords.y === state.entities.rabbit.y
    ) {
      removeEntity(state.entities.rabbit)
    }
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
  const enemies = getEnemies()
  const targetedEnemies = enemies.filter((e) =>
    enemies.some((_e) => _e.activeTargetId === e.id),
  )
  const untargetedEnemies = enemies.filter(
    (e) => !enemies.some((_e) => _e.activeTargetId === e.id),
  )
  const all = [...untargetedEnemies, ...targetedEnemies]
  all.forEach((enemy) => moveEnemy(enemy.id))
  consumeEnemies()
  all.forEach((enemy) => {
    if (enemy.type === 'eagle') return
    // determine next move if we dont have one
    // if we are currently a target of something, run away from that instead of toward prey
    const predator = Object.values(state.entities).find(
      (e) => e.activeTargetId === enemy.id,
    )
    const target = state.entities[enemy.activeTargetId ?? '']
    // lose target if they are too far away
    // if (target && !activeCoords.includes(coordToKey(target))) {
    //   enemy.activeTargetId = undefined
    //   enemy.nextMove = undefined
    // }
    if (target) {
      enemy.nextMove = getMoveDirection(enemy, target, false)
    } else if (predator) {
      enemy.nextMove = getMoveDirection(enemy, predator, true)
    }
  })
}

const moveEnemy = (id: string) => {
  const enemy = state.entities[id]
  const rabbit = state.entities.rabbit

  const { targets, speed, activeSightRange, inactiveSightRange } =
    ENTITY_TYPES[enemy.type]
  if (enemy.shouldDie) {
    removeEntity(enemy)
    return
  }
  if (enemy.type === 'eagle') {
    if (!enemy.line) {
      enemy.line = getLine(enemy, rabbit, state.gridSize)
      const t = enemy.line[enemy.line.length - 1]
      enemy.nextMove = { x: t.x - enemy.x, y: t.y - enemy.y }
      enemy.activeTargetId = 'rabbit'
    } else {
      moveEntity(enemy.id, enemy.nextMove!.x, enemy.nextMove!.y)
      if (enemy.line.some((c) => c.x === rabbit.x && c.y === rabbit.y)) {
        removeEntity(rabbit)
      }
      enemy.shouldDie = true
      enemy.line = undefined
      enemy.nextMove = undefined
    }
    return
  }

  if (!targets) return

  enemy.pace = enemy.pace ?? 0
  enemy.pace++
  const bushes = Object.values(state.entities)
    .filter((b) => b.type === 'bush')
    .map(coordToKey)

  const activeCoords = getCoordsInDistance(enemy, activeSightRange ?? 0)
    .map(coordToKey)
    .filter((c) => !bushes.includes(c))
  const inactiveCoords = getCoordsInDistance(enemy, inactiveSightRange ?? 0)
    .map(coordToKey)
    .filter((c) => !bushes.includes(c))
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
    .sort(
      (a, b) =>
        (targets.indexOf(a.type) - targets.indexOf(b.type)) * 100 +
        (getDistance(enemy.x, enemy.y, a.x, a.y) -
          getDistance(enemy.x, enemy.y, b.x, b.y)),
    )
  if (possibleTargets[0]) enemy.activeTargetId = possibleTargets[0].id

  // if we are ready to move and we have somewhere to move, move
  if (enemy.pace >= (speed ?? 0)) {
    if (enemy.nextMove) moveEntity(id, enemy.nextMove.x, enemy.nextMove.y)
    enemy.pace = 0
  }
}

const coordToKey = (coord: Partial<Coord>) => `${coord.x},${coord.y}`
const getMoveDirection = (src: Entity, dest: Entity, invert = false) => {
  if (!src || !dest) return { x: 0, y: 0 }

  let options: { change: Coord; coord: Coord }[] = [
    { change: { x: 1, y: 0 }, coord: { x: src.x + 1, y: src.y } },
    { change: { x: -1, y: 0 }, coord: { x: src.x - 1, y: src.y } },
    { change: { x: 0, y: 1 }, coord: { x: src.x, y: src.y + 1 } },
    { change: { x: 0, y: -1 }, coord: { x: src.x, y: src.y - 1 } },
  ]

  options.push(
    { change: { x: 1, y: 1 }, coord: { x: src.x + 1, y: src.y + 1 } },
    { change: { x: 1, y: -1 }, coord: { x: src.x + 1, y: src.y - 1 } },
    { change: { x: -1, y: 1 }, coord: { x: src.x - 1, y: src.y + 1 } },
    { change: { x: -1, y: -1 }, coord: { x: src.x - 1, y: src.y - 1 } },
  )

  const unpassable = Object.values(state.entities)
    .filter((e) => !getPassable(src, e))
    .map(coordToKey)
  if (state.nextSpawn) unpassable.push(coordToKey(state.nextSpawn.coords))

  options = options
    .filter((o) => !unpassable.includes(coordToKey(o.coord)))
    .filter(
      ({ coord: b }) =>
        b.x >= 0 && b.y >= 0 && b.x < state.gridSize && b.y < state.gridSize,
    )
    .map((o) => ({
      ...o,
      score: getDistance(dest.x, dest.y, o.coord.x, o.coord.y),
    }))
    .sort((_a, _b) => {
      const a = invert ? _b : _a
      const b = invert ? _a : _b

      return a.score - b.score
    })

  return options[0]?.change ?? { x: 0, y: 0 }
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

function getLine(start: Coord, through: Coord, gridSize: number): Coord[] {
  const dx = through.x - start.x
  const dy = through.y - start.y
  const stepX = dx === 0 ? 0 : dx / Math.abs(dx)
  const stepY = dy === 0 ? 0 : dy / Math.abs(dy)

  let x = start.x,
    y = start.y
  const line: Coord[] = []

  while (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
    line.push({ x, y })
    x += stepX
    y += stepY
  }

  return line
}

function pick<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined
  return array[Math.floor(Math.random() * array.length)]
}

const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}
