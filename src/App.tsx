import { Routes, Route } from 'react-router-dom'
import './App.css'
import Main from './pages/Main'
import Lab from './pages/Lab'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/lab" element={<Lab />} />
    </Routes>
  )
}

export default App
