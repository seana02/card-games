import { useState } from 'react'
import { conn } from './socket'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={conn}>Connect</button>
  )
}

export default App
