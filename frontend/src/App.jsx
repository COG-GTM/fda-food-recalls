import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PastRecallsPage from './pages/PastRecallsPage';
import CurrentRecallsPage from './pages/CurrentRecallsPage';
import RecallsByStatePage from './pages/RecallsByStatePage';
import CPSCRecallsPage from './pages/CPSCRecallsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0F172A]">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/past_recalls" element={<PastRecallsPage />} />
          <Route path="/current_recalls" element={<CurrentRecallsPage />} />
          <Route path="/recalls_by_state" element={<RecallsByStatePage />} />
          <Route path="/cpsc_recalls" element={<CPSCRecallsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
