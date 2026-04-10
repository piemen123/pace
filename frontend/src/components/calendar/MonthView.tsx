import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { type Deadline, type TimeBlock } from './mockData';

interface MonthViewProps {
  currentDate: Date;
  deadlines: Deadline[];
  onDateChange: (date: Date) => void;
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  onOpenDeadlineModal: (deadline?: Deadline) => void;
  onOpenBlockModal: (block?: TimeBlock, defaultDate?: Date, defaultHour?: number) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  deadlines,
  onDateChange,
  onViewChange,
  onOpenDeadlineModal,
  onOpenBlockModal
}) => {
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    onDateChange(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    onDateChange(new Date(year, month + 1, 1));
  };

  const today = new Date();
  
  // Find next test safely based on UTC midnight boundaries
  const upcomingTests = deadlines
    .filter(d => d.type === 'Test')
    .map(d => {
      const parts = d.date.split('-');
      const dObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return { ...d, dateObj: dObj };
    })
    .filter(d => d.dateObj.getTime() + 86400000 > today.getTime()) // Use +1 day logic so today tests show up
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    
  const nextTest = upcomingTests.length > 0 ? upcomingTests[0] : null;
  let daysUntilNextTest = null;
  if (nextTest) {
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    daysUntilNextTest = Math.ceil((nextTest.dateObj.getTime() - todayMidnight.getTime()) / (1000 * 3600 * 24));
  }

  const days: React.ReactNode[] = [];
  
  // Padding for previous month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="month-cell not-current-month" />);
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = 
      d === today.getDate() && 
      month === today.getMonth() && 
      year === today.getFullYear();
      
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayDeadlines = deadlines.filter(dl => dl.date === dateString);

    days.push(
      <div 
        key={`day-${d}`} 
        className={`month-cell ${isToday ? 'today' : ''}`}
        onClick={() => {
          onDateChange(new Date(year, month, d));
          onViewChange('day');
        }}
      >
        <span className="month-cell-day">{d}</span>
        <div className="month-cell-content" style={{ overflowY: 'auto', flex: 1 }}>
          {dayDeadlines.slice(0, 3).map(dl => (
            <div key={dl.id} className="deadline-popout-container" style={{ width: '100%', display: 'flex' }} onClick={(e) => e.stopPropagation()}>
              <div 
                className={`deadline-pill`} 
                style={{ width: '100%', cursor: 'pointer', borderLeftColor: dl.color || 'var(--accent)', backgroundColor: `${dl.color || '#2563eb'}1A`, color: dl.color || 'var(--accent)' }}
                onClick={(e) => { e.stopPropagation(); onOpenDeadlineModal(dl); }}
              >
                {dl.title}
              </div>
              <div className="deadline-popout">
                <div className="popout-header">
                  ⏳ {dl.type}
                </div>
                <div className="popout-body">
                  <strong>{dl.title}</strong><br/>
                  Scheduled for {dateString}
                </div>
              </div>
            </div>
          ))}
          {dayDeadlines.length > 3 && (
            <div className="more-pill">
              +{dayDeadlines.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  }

  // Calculate remaining cells to forcefully complete 6 full weeks (42 cells) to keep height consistent across all months! (User elected Option B)
  const totalCells = days.length;
  const remainingCells = 42 - totalCells;
  for (let i = 0; i < remainingCells; i++) {
    days.push(<div key={`empty-end-${i}`} className="month-cell not-current-month" />);
  }

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return (
    <>
      {nextTest && daysUntilNextTest !== null && (
        <div className="next-test-banner">
          <CalendarIcon size={18} />
          <span>{daysUntilNextTest === 0 ? "Test is Today! Good luck!" : `${daysUntilNextTest} Days Until Next Test: ${nextTest.title}`}</span>
        </div>
      )}
      
      <div className="calendar-header">
        <h2 className="calendar-title">{monthNames[month]} {year}</h2>
        <div className="calendar-nav-btns">
          <button className="cal-btn" onClick={() => { onDateChange(new Date()); onViewChange('day'); }}>Today</button>
          <button className="cal-icon-btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
          <button className="cal-icon-btn" onClick={nextMonth}><ChevronRight size={18} /></button>
          <button className="cal-btn" onClick={() => onViewChange('week')}>Week View</button>
          <button className="cal-btn primary" onClick={() => onOpenDeadlineModal()}>
            <Plus size={16} /> Add Deadline
          </button>
          <button className="cal-btn primary" onClick={() => onOpenBlockModal(undefined, new Date(year, month, 1))}>
            <Plus size={16} /> Add Block
          </button>
        </div>
      </div>

      <div className="month-header-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--border)', borderBottom: 'none' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="month-col-header" style={{ borderBottom: 'none' }}>{day}</div>
        ))}
      </div>
      <div className="month-grid" style={{ borderTop: '1px solid var(--border)' }}>
        {days}
      </div>
    </>
  );
};
