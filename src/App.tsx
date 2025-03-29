function App() {
  const width = 50
  return (
    <div className="flex-1 flex items-center justify-center h-full bg-green-950">
      <div className="grid grid-cols-12" style={{ width: width * 12 }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].flatMap(() =>
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((s) => (
            <div
              style={{ width, height: width }}
              className="aspect-square bg-green-500 border border-black flex justify-center items-center text-5xl cursor-pointer"
            >
              {strings[Math.floor(Math.random() * (strings.length + 5))]}
            </div>
          )),
        )}
      </div>
    </div>
  )
}

const strings = ['🐰', '🦊', '🐻', '🐺', '🦁', '🪨', '🌲', '🕳️']
console.log(strings)
export default App
