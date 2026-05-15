import { useState, useEffect } from 'react';
import { createLead, updateLeadDetails } from '../api/leads';
import { Lead } from '../types';

interface Props { 
  isOpen: boolean; 
  onClose: () => void; 
  lead: Lead | null; 
  onSave: () => void; 
}

export default function LeadModal({ isOpen, onClose, lead, onSave }: Props) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', source: 'Website' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [touchedEmail, setTouchedEmail] = useState(false); // Tracks if user clicked out of email box

  useEffect(() => {
    if (lead) {
      setFormData({ name: lead.name, email: lead.email, phone: lead.phone || '', source: lead.source || 'Website' });
    } else {
      setFormData({ name: '', email: '', phone: '', source: 'Website' });
    }
    setError('');
    setTouchedEmail(false);
  }, [lead, isOpen]);

  if (!isOpen) return null;

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = formData.name.trim() !== '' && isValidEmail(formData.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setError('');

    const payload = {
      ...formData,
      status: lead ? lead.status : 'NEW',
      updated_at: new Date().toISOString(),
      created_at: lead ? lead.created_at : new Date().toISOString()
    };

    try {
      if (lead) {
        await updateLeadDetails(lead.id, payload);
      } else {
        await createLead(payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setError('Failed to save lead. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{marginTop: 0, marginBottom: '24px'}}>{lead ? 'Edit Lead' : 'New Lead'}</h2>
        
        {error && <div style={{ padding: '12px', background: '#fef2f2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 500 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} noValidate>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Name <span style={{color: '#ef4444'}}>*</span></label>
            <input 
              className="control-input" 
              style={{width: '100%'}} 
              placeholder="e.g. John Doe"
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Email Address <span style={{color: '#ef4444'}}>*</span></label>
            <input 
              className="control-input" 
              type="email" 
              style={{
                width: '100%', 
                // Only turn red if they typed something invalid AND clicked away
                borderColor: touchedEmail && formData.email && !isValidEmail(formData.email) ? '#ef4444' : '#e2e8f0'
              }} 
              placeholder="e.g. john@example.com"
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              onBlur={() => setTouchedEmail(true)} // User clicked away
            />
            {touchedEmail && formData.email && !isValidEmail(formData.email) && (
              <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', display: 'block', fontWeight: 500 }}>
                Please enter a valid email address.
              </span>
            )}
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Phone Number (Optional)</label>
            <input 
              className="control-input" 
              type="tel" 
              style={{width: '100%'}} 
              placeholder="e.g. +1 555 0123"
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Source</label>
            <select className="control-input" style={{width: '100%', cursor: 'pointer'}} value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Campaign">Campaign</option>
              <option value="Cold-Outreach">Cold-Outreach</option>
              <option value="Event">Event</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="submit" className="btn btn-primary" disabled={!isFormValid || isSubmitting} style={{ flex: 1 }}>
              {isSubmitting ? 'Saving...' : 'Save Lead'}
            </button>
            <button type="button" className="btn" onClick={onClose} disabled={isSubmitting} style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}