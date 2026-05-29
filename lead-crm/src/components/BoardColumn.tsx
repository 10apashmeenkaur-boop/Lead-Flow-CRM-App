import { useDroppable } from '@dnd-kit/core';
import { BoardCard } from './BoardCard';
import type { Lead } from '../types';

interface Props { id: string; title: string; color: {bg: string, text: string}; leads: Lead[]; }

export function BoardColumn({ id, title, color, leads }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div style={{ background: '#f8fafc', borderRadius: '12px', minWidth: '270px', width: '270px', display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', maxHeight: '80vh' }}>
      <div style={{ background: color.bg, padding: '12px 16px', borderBottom: '1px solid #e2e8f0', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, color: color.text, fontSize: '12px', textTransform: 'uppercase' }}>{title}</span>
        <span style={{ background: 'white', color: color.text, padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>{leads.length}</span>
      </div>
      <div ref={setNodeRef} style={{ flex: 1, overflowY: 'auto', padding: '12px', background: isOver ? '#f1f5f9' : 'transparent' }}>
        {leads.map(lead => <BoardCard key={lead.id} lead={lead} />)}
      </div>
    </div>
  );
}