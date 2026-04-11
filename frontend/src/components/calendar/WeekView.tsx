import React from 'react';
import { ChevronLeft, ChevronRight, Trash2, Plus } from 'lucide-react';
import { type TimeBlock, type Deadline } from './mockData';
import { formatDate, getBlockStyle, blockMatchesDate } from './utils';
import { useBlockInteractions } from './useBlockInteractions';

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
  const { handleDragStart, handleDragEnd, handleDrop, handleResizeStart } = useBlockInteractions(timeBlocks, onUpdateBlock);

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    return new Date(d.setDate(d.getDate() - d.getDay()));
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
          const dateString = formatDate(d);
          const dayDeadlines = deadlines.filter(dl => dl.date === dateString);

          return (
            <div
              key={i}
              className="week-header-cell"
              onClick={() => { onDateChange(d); onViewChange('day'); }}
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
          const dateString = formatDate(d);
          const dayBlocks = timeBlocks.filter(tb => blockMatchesDate(tb, dateString));

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
                  onClick={(e) => { e.stopPropagation(); onOpenBlockModal(tb); }}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, tb.id)}
                  onDragEnd={handleDragEnd}
                  title={tb.description ? `${tb.title}\n\n${tb.description}` : tb.title}
                >
                  <span className="truncate">{tb.title}</span>

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
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
