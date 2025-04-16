import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SimulationDashboard from './simulationDashboard'

function App() {
  const [count, setCount] = useState(0)

  return <SimulationDashboard />
}

export default App
