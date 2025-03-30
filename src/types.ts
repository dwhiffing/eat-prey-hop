type EntityTypeKey =
  | 'bear'
  | 'carrot'
  | 'eagle'
  | 'fox'
  | 'hole'
  | 'lion'
  | 'rabbit'
  | 'rock'
  | 'snake'
  | 'tree'
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
}

export type Coord = { x: number; y: number }
