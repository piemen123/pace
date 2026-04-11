import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { type TimeBlock, type Deadline } from './mockData';
import { formatDate, getBlockStyle, blockMatchesDate } from './utils';
import { useBlockInteractions } from './useBlockInteractions';

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
  const { handleDragStart, handleDragEnd, handleDrop, handleResizeStart } = useBlockInteractions(timeBlocks, onUpdateBlock);

  const dateString = formatDate(currentDate);
  const dayBlocks = timeBlocks.filter(tb => blockMatchesDate(tb, dateString));
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

  const today = new Date();
  const isTodayView = currentDate.getFullYear() === today.getFullYear() &&
                      currentDate.getMonth() === today.getMonth() &&
                      currentDate.getDate() === today.getDate();

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
                  className="deadline-pill"
                  style={{ margin: 0, cursor: 'pointer', borderLeftColor: dl.color || 'var(--accent)', backgroundColor: `${dl.color || '#2563eb'}1A`, color: dl.color || 'var(--accent)' }}
                  onClick={(e) => { e.stopPropagation(); onOpenDeadlineModal(dl); }}
                >
                  {dl.title}
                </div>
                <div className="deadline-popout">
                  <div className="popout-header">⏳ {dl.type} Deadline</div>
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
              const hour = Math.floor((e.clientY - rect.top) / 48);
              onOpenBlockModal(undefined, currentDate, hour);
            }
          }}>
            {HOURS.map(h => (
              <div
                key={`grid-${h}`}
                className="absolute-grid-slot"
                style={{ top: `${h * 48}px` }}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                onDragLeave={(e) => { e.currentTarget.classList.remove('drag-over'); }}
                onDrop={(e) => handleDrop(e, dateString, h)}
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

                  <button
                    className="delete-btn"
                    onClick={(e) => { e.stopPropagation(); onDeleteBlock(tb.id); }}
                    title="Delete Block"
                  >
                    <Trash2 size={12} />
                  </button>

                  <div className="resize-handle top" onMouseDown={(e) => handleResizeStart(e, tb.id, true)} onClick={e => e.stopPropagation()} />
                  <div className="resize-handle bottom" onMouseDown={(e) => handleResizeStart(e, tb.id, false)} onClick={e => e.stopPropagation()} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
