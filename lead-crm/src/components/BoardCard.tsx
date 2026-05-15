import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Lead, VALID_TRANSITIONS } from '../types';
import { MailIcon, CalendarIcon } from './Icons';

export function BoardCard({ lead }: { lead: Lead }) {
  const isLocked = VALID_TRANSITIONS[lead.status].length === 0;
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(lead.id), disabled: isLocked, 
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isLocked ? 'not-allowed' : 'grab',
    background: 'white', 
    padding: '12px', // Reduced from 16px for a more concise look
    borderRadius: '8px', 
    marginBottom: '10px', // Reduced spacing between cards
    boxShadow: isDragging ? '0 10px 15px -3px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
    border: isLocked ? '1px solid #fecaca' : '1px solid #e2e8f0',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>{lead.name}</h4>
        {isLocked && <span style={{ fontSize: '9px', color: '#ef4444', fontWeight: 700, padding: '2px 4px', background: '#fef2f2', borderRadius: '4px' }}>LOCKED</span>}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '11px', marginBottom: '12px' }}>
        <MailIcon /> <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{lead.email}</span>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#94a3b8' }}>
        <span style={{ background: '#f1f5f9', padding: '4px 6px', borderRadius: '4px', fontWeight: 500, color: '#64748b' }}>{lead.source || 'Website'}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CalendarIcon /> {new Date(lead.updated_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}