import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLeads, createLead, deleteLead, updateLeadDetails } from '../api/leads';

// 🔥 The Relaxed State Machine (Allows jumping to CONVERTED)
const VALID_TRANSITIONS: Record<string, string[]> = {
  NEW: ['CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'],
  CONTACTED: ['QUALIFIED', 'CONVERTED', 'LOST'],
  QUALIFIED: ['CONVERTED', 'LOST'],
  CONVERTED: [], 
  LOST: [],
};

export default function LeadsPage() {
  const { id: urlId } = useParams(); 
  const navigate = useNavigate();

  const [leads, setLeads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingLead, setViewingLead] = useState<any | null>(null); 
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', source: '', status: '' });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchLeads(searchTerm, statusFilter);
      setLeads(data);
    } catch (err) { 
      setError("Failed to connect to the server. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [searchTerm, statusFilter]);

  // Deep Linking logic
  useEffect(() => {
    if (urlId && leads.length > 0) {
      const leadToEdit = leads.find(l => String(l.id) === String(urlId));
      if (leadToEdit) {
        setEditingId(leadToEdit.id);
        setFormData({ 
          name: leadToEdit.name, 
          email: leadToEdit.email, 
          phone: leadToEdit.phone || '',
          source: leadToEdit.source || '', 
          status: leadToEdit.status 
        });
        setIsModalOpen(true);
      }
    }
  }, [urlId, leads]);

  const closeModal = () => {
    setIsModalOpen(false);
    setViewingLead(null);
    setEditingId(null);
    navigate('/'); 
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this lead?")) return;
    try {
      await deleteLead(id);
      loadData();
    } catch (err) { alert("Failed to delete lead."); }
  };

  const handleStatusChange = async (lead: any, newStatus: string) => {
    setUpdatingId(lead.id);
    const timestamp = new Date().toISOString();

    setLeads((prev) => prev.map((l) => 
      l.id === lead.id ? { ...l, status: newStatus, updated_at: timestamp } : l
    ));

    try {
      const payload = { ...lead, status: newStatus, updated_at: timestamp };
      await updateLeadDetails(lead.id, payload);
    } catch (err) { 
      alert("Error updating status. Ensure server is running on port 4000."); 
      loadData(); 
    } finally {
      setTimeout(() => setUpdatingId(null), 300);
    }
  };

  const openNewLeadModal = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', source: '', status: 'NEW' });
    setIsModalOpen(true);
  };

  const openEditModal = (lead: any) => {
    navigate(`/leads/${lead.id}/edit`);
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const timestamp = new Date().toISOString();
      const payload = { ...formData, updated_at: timestamp };
      
      if (editingId) {
        await updateLeadDetails(editingId, payload);
      } else {
        await createLead({ ...payload, created_at: timestamp });
      }
      closeModal();
      await loadData(); 
    } catch (err) { 
      alert("Error saving lead. Ensure server is running on port 4000."); 
    }
  };

  const isEmailInvalid = formData.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isFormValid = formData.name.trim().length > 0 && !isEmailInvalid && formData.email.length > 0;

  return (
    <div>
      <div className="header">
        <h1 className="title">Lead Overview</h1>
        <button onClick={openNewLeadModal} className="btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          New Lead
        </button>
      </div>

      <div className="controls-group" style={{ marginBottom: '24px' }}>
        <input 
          type="text" placeholder="Search names or emails..." className="control-input" 
          onChange={e => setSearchTerm(e.target.value)} 
        />
        <select className="control-input" onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="NEW">NEW</option>
          <option value="CONTACTED">CONTACTED</option>
          <option value="QUALIFIED">QUALIFIED</option>
          <option value="CONVERTED">CONVERTED</option>
          <option value="LOST">LOST</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Contact Details</th>
              <th>Origin</th>
              <th>Last Updated</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'right' }}>Manage</th>
            </tr>
          </thead>
          
          {isLoading ? (
            <tbody><tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>Loading data...</td></tr></tbody>
          ) : error ? (
            <tbody><tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>{error}</td></tr></tbody>
          ) : (
            <tbody>
              {leads.map(lead => {
                const isLocked = !VALID_TRANSITIONS[lead.status] || VALID_TRANSITIONS[lead.status].length === 0;
                return (
                  <tr 
                    key={lead.id} 
                    style={{ 
                      opacity: updatingId === lead.id ? 0.4 : 1, 
                      transition: 'opacity 0.2s ease-in-out' 
                    }}
                  >
                    <td>
                      <p className="lead-name">{lead.name}</p>
                      <p className="lead-email">{lead.email}</p>
                    </td>
                    <td style={{ textTransform: 'capitalize', color: '#64748b', fontSize: '13px' }}>
                      {lead.source || 'Direct'}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '13px' }}>
                      {lead.updated_at ? new Date(lead.updated_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <select 
                        className={`badge status-${lead.status} interactive-select`}
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead, e.target.value)}
                        disabled={isLocked}
                      >
                        <option value={lead.status} disabled>{lead.status}</option>
                        {(VALID_TRANSITIONS[lead.status] || []).map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setViewingLead(lead)} className="icon-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                        <button onClick={() => openEditModal(lead)} className="icon-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                        <button onClick={() => handleDelete(lead.id)} className="icon-btn delete"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingId ? "Edit Lead" : "Add New Lead"}</h2>
            <form onSubmit={handleSubmitLead}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="control-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input 
                  type="email" 
                  className="control-input" 
                  style={{ 
                    width: '100%', 
                    boxSizing: 'border-box', 
                    borderColor: isEmailInvalid ? '#ef4444' : '#cbd5e1',
                    outlineColor: isEmailInvalid ? '#ef4444' : ''
                  }} 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  placeholder="john@example.com" 
                  required 
                />
                {isEmailInvalid && (
                  <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: '500' }}>
                    Please enter a valid email address.
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" className="control-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="form-group">
                <label className="form-label">Origin</label>
                <input type="text" className="control-input" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} placeholder="e.g. Website, Referral" />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-primary" disabled={!isFormValid}>{editingId ? "Save Changes" : "Create Lead"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingLead && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Lead Details</h2>
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Name:</strong> {viewingLead.name}</p>
              <p><strong>Email:</strong> {viewingLead.email}</p>
              <p><strong>Status:</strong> {viewingLead.status}</p>
              <p><strong>Updated:</strong> {viewingLead.updated_at ? new Date(viewingLead.updated_at).toLocaleString() : 'N/A'}</p>
            </div>
            <div className="modal-actions"><button type="button" onClick={closeModal} className="btn-primary">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}