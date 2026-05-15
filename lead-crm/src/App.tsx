import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LeadsPage from './pages/LeadsPage';
import BoardPage from './pages/BoardPage';
import './App.css';

// Prevents sidebar links from looking empty/broken
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="main-content">
    <h1>{title}</h1>
    <p style={{ color: '#64748b', marginTop: '12px' }}>This section is outside the scope of the assessment.</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LeadsPage />} />
            <Route path="/leads/:id/edit" element={<LeadsPage />} />
            <Route path="/board" element={<BoardPage />} />
            <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
            <Route path="/analytics" element={<PlaceholderPage title="Analytics" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}