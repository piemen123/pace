import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { type TimeBlock, type Deadline } from './mockData';

interface DayViewProps {
  currentDate: Date;
  timeBlocks: TimeBlock[];
  deadlines: Deadline[];
  onDateChange: (date: Date) => void;
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  onUpdateBlock: (id: string, block: Partial<TimeBlock>) => void;
  onDeleteBlock: (id: string) => void;
  onOpenDeadlineModal: (deadline?: Deadline) => void;
  onOpenBlockModal: (block?: TimeBlock, defaultDate?: Date, defaultHour?: number) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  timeBlocks,
  deadlines,
  onDateChange,
  onViewChange,
  onUpdateBlock,
  onDeleteBlock,
  onOpenDeadlineModal,
  onOpenBlockModal
}) => {
  const [, setDraggedBlock] = useState<string | null>(null);
  const resizeStateInfo = useRef<{ id: string; isTop: boolean; startY: number; originalEndM: number; originalStartM: number } | null>(null);

  const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
  const dayBlocks = timeBlocks.filter(tb => tb.date === dateString);
  const dayDeadlines = deadlines.filter(dl => dl.date === dateString);

  const prevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d);
  };

  const nextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const shortDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const headerTitle = `${shortDayNames[currentDate.getDay()]}, ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`;

  const getBlockStyle = (sTime: string, eTime: string, c: string) => {
    const [sH, sM] = sTime.split(':').map(Number);
    const [eH, eM] = eTime.split(':').map(Number);
    const top = (sH * 48) + (sM * 0.8);
    const height = ((eH * 48) + (eM * 0.8)) - top;
    return { top: `${top}px`, height: `${height}px`, backgroundColor: c };
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedBlock(id);
    setTimeout(() => {
      const el = e.target as HTMLElement;
      el.classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedBlock(null);
    const el = e.target as HTMLElement;
    el.classList.remove('dragging');
  };

  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    
    const block = timeBlocks.find(tb => tb.id === id);
    if (!block) return;

    const [sH, sM] = block.startTime.split(':').map(Number);
    const [eH, eM] = block.endTime.split(':').map(Number);
    const durationMinutes = ((eH * 60) + eM) - ((sH * 60) + sM);

    const newStartH = hour;
    const newStartM = 0; 
    const newEndTotalM = (newStartH * 60) + newStartM + durationMinutes;
    
    const finalEndH = Math.min(23, Math.floor(newEndTotalM / 60));
    const finalEndM = Math.min(59, newEndTotalM % 60);

    const newStartTime = `${String(newStartH).padStart(2, '0')}:${String(newStartM).padStart(2, '0')}`;
    const newEndTime = `${String(finalEndH).padStart(2, '0')}:${String(finalEndM).padStart(2, '0')}`;

    onUpdateBlock(id, { date: dateString, startTime: newStartTime, endTime: newEndTime });

    const elements = document.querySelectorAll('.drag-over');
    elements.forEach(el => el.classList.remove('drag-over'));
  };

  const handleResizeStart = (e: React.MouseEvent, id: string, isTop: boolean) => {
    e.stopPropagation();
    e.preventDefault();
    
    const block = timeBlocks.find(tb => tb.id === id);
    if (!block) return;

    const [sH, sM] = block.startTime.split(':').map(Number);
    const [eH, eM] = block.endTime.split(':').map(Number);
    
    resizeStateInfo.current = {
      id,
      isTop,
      startY: e.clientY,
      originalStartM: (sH * 60) + sM,
      originalEndM: (eH * 60) + eM
    };

    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = 'ns-resize';
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizeStateInfo.current) return;
    const { id, isTop, startY, originalEndM, originalStartM } = resizeStateInfo.current;
    
    const deltaY = e.clientY - startY; 
    const deltaM = deltaY * 1.25;
    const snappedDeltaM = Math.round(deltaM / 15) * 15;
    
    if (isTop) {
      let newStartM = originalStartM + snappedDeltaM;
      if (newStartM > originalEndM - 15) newStartM = originalEndM - 15;
      if (newStartM < 0) newStartM = 0;
      
      const newStartH = Math.floor(newStartM / 60);
      const newStartMStr = newStartM % 60;
      const formattedStartTime = `${String(newStartH).padStart(2, '0')}:${String(newStartMStr).padStart(2, '0')}`;
      onUpdateBlock(id, { startTime: formattedStartTime });
    } else {
      let newEndM = originalEndM + snappedDeltaM;
      if (newEndM < originalStartM + 15) newEndM = originalStartM + 15;
      if (newEndM > 24 * 60) newEndM = 24 * 60 - 1;
      
      const finalEndH = Math.floor(newEndM / 60);
      const finalEndM = newEndM % 60;
      const formattedEndTime = `${String(finalEndH).padStart(2, '0')}:${String(finalEndM).padStart(2, '0')}`;
      onUpdateBlock(id, { endTime: formattedEndTime });
    }
  };

  const handleResizeEnd = () => {
    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = '';
    resizeStateInfo.current = null;
  };

  const isTodayView = currentDate.getFullYear() === new Date().getFullYear() &&
                      currentDate.getMonth() === new Date().getMonth() &&
                      currentDate.getDate() === new Date().getDate();

  return (
    <div className="day-container">
      <div className="day-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', overflow: 'hidden' }}>
          <h2 className="day-header-title truncate" style={{ margin: 0, flexShrink: 0 }}>{headerTitle}</h2>
        </div>
        <div className="calendar-nav-btns" style={{ flexShrink: 0, marginLeft: 'auto' }}>
          {!isTodayView && (
            <button className="cal-btn" onClick={() => { onDateChange(new Date()); onViewChange('day'); }}>Today</button>
          )}
          <button className="cal-icon-btn" onClick={prevDay}><ChevronLeft size={18} /></button>
          <button className="cal-icon-btn" onClick={nextDay}><ChevronRight size={18} /></button>
          <button className="cal-btn" onClick={() => onViewChange('week')}>Week View</button>
          <button className="cal-btn" onClick={() => onViewChange('month')}>Month View</button>
          <button className="cal-btn primary" onClick={() => onOpenDeadlineModal()}>
            <Plus size={16} /> Add Deadline
          </button>
          <button className="cal-btn primary" onClick={() => onOpenBlockModal(undefined, currentDate)}>
            <Plus size={16} /> Add Block
          </button>
        </div>
      </div>

      <div className="flex-1" style={{ flex: 1 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
             <div className="day-time-col" style={{ width: '80px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem', opacity: 0.8, fontSize: '0.75rem', fontWeight: 'bold' }}>
                Deadlines
             </div>
             <div style={{ padding: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: 'var(--surface-2)', flex: 1 }}>
                {dayDeadlines.map(dl => (
                   <div key={dl.id} className="deadline-popout-container flex-shrink-0">
                     <div 
                       className={`deadline-pill`} 
                       style={{ margin: 0, cursor: 'pointer', borderLeftColor: dl.color || 'var(--accent)', backgroundColor: `${dl.color || '#2563eb'}1A`, color: dl.color || 'var(--accent)' }}
                       onClick={(e) => { e.stopPropagation(); onOpenDeadlineModal(dl); }}
                     >
                       {dl.title}
                     </div>
                     <div className="deadline-popout">
                       <div className="popout-header">
                         ⏳ {dl.type} Deadline
                       </div>
                       <div className="popout-body">
                         <strong>{dl.title}</strong><br/>
                         Scheduled for {dl.date}
                         {dl.description && (
                           <div className="popout-desc" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                             {dl.description}
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                ))}
             </div>
          </div>
        <div className="day-main-grid">
          <div className="day-time-col">
            {HOURS.map(h => (
              <div key={h} className="time-slot-label">
                {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
              </div>
            ))}
          </div>

          <div className="day-content-col" onClick={(e) => {
            if (e.target === e.currentTarget) {
              const rect = e.currentTarget.getBoundingClientRect();
              const y = e.clientY - rect.top;
              const hour = Math.floor(y / 48);
              onOpenBlockModal(undefined, currentDate, hour);
            }
          }}>
            {HOURS.map(h => (
              <div 
                key={`grid-${h}`} 
                className="absolute-grid-slot" 
                style={{top: `${h * 48}px`}} 
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                onDragLeave={(e) => { e.currentTarget.classList.remove('drag-over'); }}
                onDrop={(e) => handleDrop(e, h)}
                onClick={() => onOpenBlockModal(undefined, currentDate, h)}
              />
            ))}

            {dayBlocks.map(tb => (
              <div 
                key={tb.id} 
                className="absolute-block"
                style={getBlockStyle(tb.startTime, tb.endTime, tb.color)}
                onClick={() => onOpenBlockModal(tb)}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, tb.id)}
                onDragEnd={handleDragEnd}
                title={tb.description ? `${tb.title}\n\n${tb.description}` : tb.title}
              >
                <div className="time-block-content text-left">
                  <div className="time-block-header">
                    <span className="truncate" style={{ width: '100%' }}>{tb.title}</span>
                  </div>
                  <div className="time-block-time">{tb.startTime} - {tb.endTime}</div>
                  
                  {/* Delete Button (hover) */}
                  <button 
                    className="delete-btn" 
                    onClick={(e) => { e.stopPropagation(); onDeleteBlock(tb.id); }}
                    title="Delete Block"
                  >
                    <Trash2 size={12} />
                  </button>

                  {/* Resize Handles */}
                  <div 
                    className="resize-handle top" 
                    onMouseDown={(e) => handleResizeStart(e, tb.id, true)}
                    onClick={e => e.stopPropagation()}
                  />
                  <div 
                    className="resize-handle bottom" 
                    onMouseDown={(e) => handleResizeStart(e, tb.id, false)}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
