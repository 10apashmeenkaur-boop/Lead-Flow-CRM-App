import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LeadsPage from './pages/LeadsPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LeadsPage />} />
            <Route path="/leads/:id/edit" element={<LeadsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}