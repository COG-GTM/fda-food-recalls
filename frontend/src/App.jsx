import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import PastRecalls from './pages/PastRecalls'
import RecentRecalls from './pages/RecentRecalls'
import RecallsByState from './pages/RecallsByState'
import CPSCRecalls from './pages/CPSCRecalls'

function App() {
  return (
    <div className="min-h-screen bg-navy">
      <Navbar />
      <main className="container mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/past-recalls" element={<PastRecalls />} />
          <Route path="/recent-recalls" element={<RecentRecalls />} />
          <Route path="/recalls-by-state" element={<RecallsByState />} />
          <Route path="/cpsc-recalls" element={<CPSCRecalls />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
