import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Trash2, Plus } from 'lucide-react';
import { type TimeBlock, type Deadline } from './mockData';

interface WeekViewProps {
  currentDate: Date;
  timeBlocks: TimeBlock[];
  deadlines: Deadline[];
  onDateChange: (date: Date) => void;
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  onUpdateBlock: (id: string, updatedBlock: Partial<TimeBlock>) => void;
  onDeleteBlock: (id: string) => void;
  onOpenDeadlineModal: (deadline?: Deadline) => void;
  onOpenBlockModal: (block?: TimeBlock, defaultDate?: Date, defaultHour?: number) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const WeekView: React.FC<WeekViewProps> = ({
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

  // Resize State
  const resizeStateInfo = useRef<{ id: string; isTop: boolean; startY: number; originalEndM: number; originalStartM: number } | null>(null);

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);

  const prevWeek = () => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() - 7);
    onDateChange(d);
  };

  const nextWeek = () => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + 7);
    onDateChange(d);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const title = `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${monthNames[weekDays[6].getMonth()]} ${weekDays[6].getDate()}, ${startOfWeek.getFullYear()}`;

  const getBlockStyle = (startTime: string, endTime: string, color: string) => {
    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);

    const top = (sH * 48) + (sM * 0.8);
    const height = ((eH * 48) + (eM * 0.8)) - top;

    return {
      top: `${top}px`,
      height: `${height}px`,
      backgroundColor: color
    };
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

  const handleDrop = (e: React.DragEvent, dateString: string, hour: number) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;

    const block = timeBlocks.find(tb => tb.id === id);
    if (!block) return;

    // Calculate duration in minutes
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

    onUpdateBlock(id, {
      date: dateString,
      startTime: newStartTime,
      endTime: newEndTime
    });

    const elements = document.querySelectorAll('.drag-over');
    elements.forEach(el => el.classList.remove('drag-over'));
  };

  // Resize Handlers
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
    const deltaM = deltaY * 1.25; // 60 mins / 48 px = 1.25 mins per px
    const snappedDeltaM = Math.round(deltaM / 15) * 15; // wrap to 15m intervals

    if (isTop) {
      let newStartM = originalStartM + snappedDeltaM;
      if (newStartM > originalEndM - 15) newStartM = originalEndM - 15; // Min 15m length
      if (newStartM < 0) newStartM = 0;

      const newStartH = Math.floor(newStartM / 60);
      const newStartMStr = newStartM % 60;
      const formattedStartTime = `${String(newStartH).padStart(2, '0')}:${String(newStartMStr).padStart(2, '0')}`;
      onUpdateBlock(id, { startTime: formattedStartTime });
    } else {
      let newEndM = originalEndM + snappedDeltaM;
      if (newEndM < originalStartM + 15) newEndM = originalStartM + 15; // Min 15m length
      if (newEndM > 24 * 60) newEndM = 24 * 60 - 1; // Limit to 23:59

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

  const today = new Date();

  return (
    <div className="week-container">
      <div className="calendar-header">
        <h2 className="calendar-title">{title}</h2>
        <div className="calendar-nav-btns">
          <button className="cal-btn" onClick={() => { onDateChange(today); onViewChange('day'); }}>Today</button>
          <button className="cal-icon-btn" onClick={prevWeek}><ChevronLeft size={18} /></button>
          <button className="cal-icon-btn" onClick={nextWeek}><ChevronRight size={18} /></button>
          <button className="cal-btn" onClick={() => onViewChange('month')}>Month View</button>
          <button className="cal-btn primary" onClick={() => onOpenDeadlineModal()}>
            <Plus size={16} /> Add Deadline
          </button>
          <button className="cal-btn primary" onClick={() => onOpenBlockModal(undefined, startOfWeek)}>
            <Plus size={16} /> Add Block
          </button>
        </div>
      </div>

      <div className="week-header">
        <div className="week-header-cell flex-1 bg-surface" style={{ borderLeft: 'none' }} />
        {weekDays.map((d, i) => {
          const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
          const dayStr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
          const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          const dayDeadlines = deadlines.filter(dl => dl.date === dateString);

          return (
            <div
              key={i}
              className="week-header-cell"
              onClick={() => {
                onDateChange(d);
                onViewChange('day');
              }}
            >
              <div className="week-header-day">{dayStr}</div>
              <div className={`week-header-date ${isToday ? 'today' : ''}`}>{d.getDate()}</div>

              <div className="week-header-deadlines">
                {dayDeadlines.map(dl => (
                  <div key={dl.id} className="deadline-popout-container" style={{ margin: '0 2px' }}>
                    <div
                      className="week-deadline-dot"
                      style={{ backgroundColor: dl.color || 'var(--accent)', cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); onOpenDeadlineModal(dl); }}
                    />
                    <div className={`deadline-popout downward ${i >= 4 ? 'right-aligned' : ''}`}>
                      <div className="popout-header">
                        ⏳ {dl.type} Deadline
                      </div>
                      <div className="popout-body">
                        <strong>{dl.title}</strong><br />
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
          );
        })}
      </div>

      <div className="week-grid flex-1" style={{ flex: 1 }}>
        <div className="time-col">
          {HOURS.map(h => (
            <div key={h} className="time-slot-label">
              {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
            </div>
          ))}
        </div>

        {weekDays.map((d, i) => {
          const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
          const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          const dayBlocks = timeBlocks.filter(tb => tb.date === dateString);

          return (
            <div
              key={i}
              className={`day-col ${isToday ? 'today' : ''}`}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove('drag-over'); }}
            >
              {HOURS.map(h => (
                <div
                  key={`grid-${h}`}
                  className="grid-slot"
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                  onDragLeave={(e) => { e.currentTarget.classList.remove('drag-over'); }}
                  onDrop={(e) => handleDrop(e, dateString, h)}
                />
              ))}

              {dayBlocks.map(tb => (
                <div
                  key={tb.id}
                  className="absolute-block"
                  style={getBlockStyle(tb.startTime, tb.endTime, tb.color)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBlockModal(tb);
                  }}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, tb.id)}
                  onDragEnd={handleDragEnd}
                  title={tb.description ? `${tb.title}\n\n${tb.description}` : tb.title}
                >
                  <span className="truncate">{tb.title}</span>

                  {/* Delete Button (hover) */}
                  <button
                    className="delete-btn"
                    onClick={(e) => { e.stopPropagation(); onDeleteBlock(tb.id); }}
                    title="Delete Block"
                  >
                    <Trash2 size={12} />
                  </button>

                  {/* Resize Handles for Week View */}
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
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
