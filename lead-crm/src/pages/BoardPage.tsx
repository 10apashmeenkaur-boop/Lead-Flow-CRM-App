import { useState, useEffect } from 'react';
import { DndContext, closestCorners, type DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useSearchParams } from 'react-router-dom';
import { fetchLeads, updateLeadDetails } from '../api/leads';
import { BoardColumn } from '../components/BoardColumn';
import { type Lead, type LeadStatus, VALID_TRANSITIONS } from '../types';

const COLUMNS: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];

const getColumnColor = (status: string) => {
  switch(status) {
    case 'NEW': return { bg: '#e0f2fe', text: '#0f172a' }; 
    case 'CONTACTED': return { bg: '#ffedd5', text: '#0f172a' }; 
    case 'QUALIFIED': return { bg: '#dcfce7', text: '#0f172a' }; 
    case 'CONVERTED': return { bg: '#ccfbf1', text: '#0f172a' }; 
    case 'LOST': return { bg: '#fee2e2', text: '#0f172a' }; 
    default: return { bg: '#f8fafc', text: '#0f172a' }; 
  }
};

const getColumnTitle = (status: string) => {
  switch(status) {
    case 'NEW': return 'New Leads';
    case 'CONTACTED': return 'Contacted';
    case 'QUALIFIED': return 'Qualified';
    case 'CONVERTED': return 'Converted';
    case 'LOST': return 'Lost';
    default: return status;
  }
};

export default function BoardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await fetchLeads();
      setLeads(data);
    } catch (err) {
      setError('Failed to load leads.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;
    const lead = leads.find(l => String(l.id) === leadId);

    if (!lead || lead.status === newStatus) return;
    
    if (!VALID_TRANSITIONS[lead.status].includes(newStatus)) {
      alert(`Invalid drop! Cannot move from ${lead.status} to ${newStatus}.`); 
      return;
    }

    const originalLeads = [...leads];
    setLeads(prev => prev.map(l => String(l.id) === leadId ? { ...l, status: newStatus } : l));
    
    try {
      await updateLeadDetails(leadId, { status: newStatus, updated_at: new Date().toISOString() });
    } catch {
      setLeads(originalLeads);
      alert('Failed to update status. Reverting changes.');
    }
  };

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>Pipeline View</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <input 
            className="control-input" 
            placeholder="Search leads..." 
            value={searchTerm} 
            onChange={e => {
              const newParams = new URLSearchParams(searchParams);
              if (e.target.value) newParams.set("search", e.target.value); else newParams.delete("search");
              setSearchParams(newParams);
            }} 
            style={{ width: '250px' }} 
          />
        </div>
      </div>

      {error ? (
        <div style={{ padding: '24px', background: '#fef2f2', color: '#991b1b', borderRadius: '12px', textAlign: 'center' }}>
          {error}
        </div>
      ) : isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading pipeline...</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '16px', minHeight: '70vh' }}>
            {COLUMNS.map(col => (
              <BoardColumn 
                key={col} id={col} title={getColumnTitle(col)} color={getColumnColor(col)}
                leads={leads.filter(l => l.status === col && (l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.email.toLowerCase().includes(searchTerm.toLowerCase())))} 
              />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}