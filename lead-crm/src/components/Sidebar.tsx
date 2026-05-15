import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || (path === '/' && location.pathname.startsWith('/leads/'));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div style={{ background: '#2563eb', color: 'white', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>LF</div>
        <div>
          <h2 style={{ color: '#0f172a', margin: 0, fontSize: '16px', fontWeight: 700 }}>LeadFlow</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '11px' }}>Sales CRM</p>
        </div>
      </div>
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Link to={`/dashboard${location.search}`} className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>⊞ Dashboard</Link>
        <Link to={`/${location.search}`} className={`nav-item ${isActive('/') ? 'active' : ''}`}>👥 All Leads</Link>
        <Link to={`/board${location.search}`} className={`nav-item ${isActive('/board') ? 'active' : ''}`}>📈 Pipeline View</Link>
        <Link to={`/analytics${location.search}`} className={`nav-item ${isActive('/analytics') ? 'active' : ''}`}>📊 Analytics</Link>
      </nav>
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div className="nav-item">↑ Import</div>
        <div className="nav-item">↓ Export</div>
        <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>⚙️ Settings</Link>
      </div>
    </aside>
  );
}