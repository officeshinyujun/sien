import { Routes, Route } from 'react-router-dom'
import './App.css'
import Main from './pages/Main'
import Lab from './pages/Lab'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/lab/:roomId" element={<Lab />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  )
}

export default App
