import { useSnapshot } from 'valtio'
import { state } from '../utils/state'
import { Game } from './Game'
import { Menu } from './Menu'

function App() {
  const snap = useSnapshot(state)

  return snap.gameOver ? <Menu /> : <Game />
}

export default App
