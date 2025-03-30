export type EntityTypeKey =
  | 'bear'
  | 'carrot'
  | 'eagle'
  | 'fox'
  | 'hole'
  | 'lion'
  | 'rabbit'
  | 'snake'
  | 'rock'
  | 'tree'
  | 'bush'
  | 'wolf'
export interface Entity {
  id: string
  type: EntityTypeKey
  x: number
  y: number
  pace?: number
}
export interface EntityType {
  image: EntityTypeKey
  isDynamic: boolean
  isPlayer: boolean
  speed?: number
  targets?: EntityTypeKey[]
  passable?: EntityTypeKey[]
}

export type Coord = { x: number; y: number }
