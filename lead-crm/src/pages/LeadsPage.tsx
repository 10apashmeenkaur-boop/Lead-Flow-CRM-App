import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchLeads, deleteLead, updateLeadDetails } from '../api/leads';
import LeadModal from '../components/LeadModal';
import { type Lead, type LeadStatus, VALID_TRANSITIONS } from '../types';
import { EyeIcon, PencilIcon, TrashIcon, ChevronDownIcon } from '../components/Icons';

export default function LeadsPage() {
  const { id: urlId } = useParams(); 
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "ALL";

  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await fetchLeads();
      setAllLeads(data);
    } catch (err) {
      setError('Failed to load leads. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, []);

  useEffect(() => {
    if (urlId && allLeads.length > 0) {
      const lead = allLeads.find(l => String(l.id) === String(urlId));
      if (lead) {
        setSelectedLead(lead);
        setIsModalOpen(true);
      } else {
        navigate('/');
      }
    } else if (!urlId) {
      setIsModalOpen(false);
      setSelectedLead(null);
    }
  }, [urlId, allLeads, navigate]);

  const updateFilters = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "ALL") newParams.set(key, value); else newParams.delete(key);
    setSearchParams(newParams);
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const originalLeads = [...allLeads];
    setAllLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    
    try {
      await updateLeadDetails(leadId, { status: newStatus, updated_at: new Date().toISOString() });
    } catch (err) {
      setAllLeads(originalLeads);
      alert('Failed to update status. Reverting changes.');
    }
  };

  const filteredLeads = allLeads.filter(l => 
    (l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === "ALL" || l.status === statusFilter)
  );

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>Lead Overview</h1>
        <button className="btn btn-primary" onClick={() => { setSelectedLead(null); navigate('/'); setIsModalOpen(true); }}>
          + New Lead
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
          <input className="control-input" style={{ width: '300px', paddingLeft: '36px' }} placeholder="Search names or emails..." value={searchTerm} onChange={e => updateFilters("search", e.target.value)} />
        </div>
        
        <div className="status-select-wrapper" style={{ width: '160px' }}>
          <select className="control-input" style={{ appearance: 'none', paddingRight: '32px', width: '100%', cursor: 'pointer' }} value={statusFilter} onChange={e => updateFilters("status", e.target.value)}>
            <option value="ALL">All Statuses</option>
            {Object.keys(VALID_TRANSITIONS).map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
          </select>
          <div className="status-chevron" style={{ color: '#64748b', right: '12px' }}><ChevronDownIcon /></div>
        </div>
      </div>

      {error ? (
        <div style={{ padding: '24px', background: '#fef2f2', color: '#991b1b', borderRadius: '12px', textAlign: 'center' }}>
          {error}
          <br/>
          <button onClick={loadData} className="btn" style={{ marginTop: '12px', background: 'white', border: '1px solid #fecaca' }}>Try Again</button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Contact Details</th>
                <th>Origin</th>
                <th>Last Updated</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Manage</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading leads...</td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No leads found.</td>
                </tr>
              ) : (
                filteredLeads.map(lead => {
                  const transitions = VALID_TRANSITIONS[lead.status];
                  const isLocked = transitions.length === 0; 

                  return (
                    <tr key={lead.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{lead.name}</div>
                        <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>{lead.email}</div>
                      </td>
                      <td style={{ color: '#64748b' }}>{lead.source || 'Website'}</td>
                      <td style={{ color: '#64748b' }}>{new Date(lead.updated_at).toLocaleDateString()}</td>
                      <td>
  {isLocked ? (
    <div className={`status-badge status-${lead.status.toLowerCase()}`} style={{ width: '140px', padding: '6px 16px', display: 'inline-block' }}>
      {lead.status}
    </div>
  ) : (
    <div className="status-select-wrapper">
      <select 
        className={`status-badge status-${lead.status.toLowerCase()}`}
        value={lead.status} 
        onChange={e => handleStatusChange(lead.id, e.target.value as LeadStatus)}
      >
        <option value={lead.status}>{lead.status}</option>
        {transitions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="status-chevron" style={{ color: `var(--status-${lead.status.toLowerCase()}-txt)` }}>
        <ChevronDownIcon />
      </div>
    </div>
  )}
</td>
                      <td style={{ textAlign: 'right' }}>
  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
    {/* Changed from disabled to active, opening the edit modal */}
    <button className="action-btn" title="View" onClick={() => navigate(`/leads/${lead.id}/edit`)}>
      <EyeIcon />
    </button>
    <button className="action-btn" title="Edit" onClick={() => navigate(`/leads/${lead.id}/edit`)}>
      <PencilIcon />
    </button>
    <button className="action-btn delete" title="Delete" onClick={() => { if(window.confirm("Delete lead?")) deleteLead(lead.id).then(loadData); }}>
      <TrashIcon />
    </button>
  </div>
</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <LeadModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); navigate('/'); }} lead={selectedLead} onSave={loadData} />
    </div>
  );
}