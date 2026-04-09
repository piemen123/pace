import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import './Calendar.css';
import { initialTimeBlocks, initialDeadlines, type TimeBlock, type Deadline, type BlockType, PRESET_COLORS } from './mockData';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';

export const CalendarShell = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');

  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(initialTimeBlocks);
  const [deadlines, setDeadlines] = useState<Deadline[]>(initialDeadlines);

  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | undefined>(undefined);
  const [deadlineTitle, setDeadlineTitle] = useState('');
  const [deadlineType, setDeadlineType] = useState<string>('Test');
  const [deadlineColor, setDeadlineColor] = useState(PRESET_COLORS.Test);
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineDescription, setDeadlineDescription] = useState('');

  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [blockTitle, setBlockTitle] = useState('');
  const [blockType, setBlockType] = useState<BlockType>('Class');
  const [blockColor, setBlockColor] = useState(PRESET_COLORS.Class);
  const [blockDate, setBlockDate] = useState('');
  const [blockStartTime, setBlockStartTime] = useState('09:00');
  const [blockEndTime, setBlockEndTime] = useState('10:00');
  const [blockRepeatWeeks, setBlockRepeatWeeks] = useState(0);
  const [blockDescription, setBlockDescription] = useState('');

  const handleOpenBlockModal = (block?: TimeBlock, defaultDate?: Date, defaultHour?: number) => {
    if (block) {
      setEditingBlockId(block.id);
      setBlockTitle(block.title);
      setBlockType(block.type);
      setBlockColor(block.color);
      setBlockDate(block.date);
      setBlockStartTime(block.startTime);
      setBlockEndTime(block.endTime);
      setBlockDescription(block.description || '');
      setBlockRepeatWeeks(0);
    } else {
      setEditingBlockId(null);
      setBlockTitle('');
      setBlockType('Class');
      setBlockColor(PRESET_COLORS.Class);
      setBlockDescription('');

      const d = defaultDate || currentDate;
      setBlockDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);

      if (defaultHour !== undefined) {
        setBlockStartTime(`${String(defaultHour).padStart(2, '0')}:00`);
        setBlockEndTime(`${String(defaultHour + 1).padStart(2, '0')}:00`);
      } else {
        setBlockStartTime('09:00');
        setBlockEndTime('10:00');
      }
      setBlockRepeatWeeks(0);
    }
    setIsBlockModalOpen(true);
  };

  const handleSaveBlockFromModal = () => {
    if (!blockTitle.trim()) return;

    if (editingBlockId) {
      handleUpdateBlock(editingBlockId, {
        title: blockTitle,
        type: blockType,
        color: blockColor,
        date: blockDate,
        startTime: blockStartTime,
        endTime: blockEndTime,
        description: blockDescription
      });
    } else {
      handleAddBlock({
        title: blockTitle,
        type: blockType,
        color: blockColor,
        date: blockDate,
        startTime: blockStartTime,
        endTime: blockEndTime,
        description: blockDescription
      }, blockRepeatWeeks);
    }
    setIsBlockModalOpen(false);
  };

  const handleOpenDeadlineModal = (deadline?: Deadline) => {
    if (deadline) {
      setEditingDeadline(deadline);
      setDeadlineTitle(deadline.title);
      setDeadlineType(deadline.type);
      setDeadlineColor(deadline.color || PRESET_COLORS.Test);
      setDeadlineDate(deadline.date);
      setDeadlineDescription(deadline.description || '');
    } else {
      setEditingDeadline(undefined);
      setDeadlineTitle('');
      setDeadlineType('Test');
      setDeadlineDescription('');
      setDeadlineColor(PRESET_COLORS.Test);
      setDeadlineDate(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`);
    }
    setIsDeadlineModalOpen(true);
  };

  const handleSaveDeadline = () => {
    if (!deadlineTitle.trim()) return;
    if (editingDeadline) {
      setDeadlines(prev => prev.map(dl => dl.id === editingDeadline.id ? { ...dl, title: deadlineTitle, type: deadlineType, color: deadlineColor, date: deadlineDate, description: deadlineDescription } : dl));
    } else {
      setDeadlines(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), title: deadlineTitle, type: deadlineType, color: deadlineColor, date: deadlineDate, description: deadlineDescription }]);
    }
    setIsDeadlineModalOpen(false);
  };

  const handleDeleteDeadline = (id: string) => {
    setDeadlines(prev => prev.filter(dl => dl.id !== id));
    setIsDeadlineModalOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        setCurrentDate(prev => {
          const nextDate = new Date(prev);
          if (currentView === 'month') {
            nextDate.setMonth(nextDate.getMonth() - 1);
            nextDate.setDate(1); // Avoid day overflow
          } else if (currentView === 'week') {
            nextDate.setDate(nextDate.getDate() - 7);
          } else if (currentView === 'day') {
            nextDate.setDate(nextDate.getDate() - 1);
          }
          return nextDate;
        });
      } else if (e.key === 'ArrowRight') {
        setCurrentDate(prev => {
          const nextDate = new Date(prev);
          if (currentView === 'month') {
            nextDate.setMonth(nextDate.getMonth() + 1);
            nextDate.setDate(1); // Avoid day overflow
          } else if (currentView === 'week') {
            nextDate.setDate(nextDate.getDate() + 7);
          } else if (currentView === 'day') {
            nextDate.setDate(nextDate.getDate() + 1);
          }
          return nextDate;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);

  const handleAddBlock = (block: Omit<TimeBlock, 'id'>, weeksToRepeat: number = 0) => {
    const newBlocks: TimeBlock[] = [];

    // Generate original block
    const originalDate = new Date(block.date + 'T12:00:00'); // Use mid-day to avoid timezone offset issues
    newBlocks.push({ ...block, id: Math.random().toString(36).substr(2, 9) });

    // Generate repeat blocks
    for (let i = 1; i <= weeksToRepeat; i++) {
      const nextDate = new Date(originalDate);
      nextDate.setDate(originalDate.getDate() + (i * 7));

      const dateString = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
      newBlocks.push({
        ...block,
        date: dateString,
        id: Math.random().toString(36).substr(2, 9)
      });
    }

    setTimeBlocks(prev => [...prev, ...newBlocks]);
  };

  const handleUpdateBlock = (id: string, updatedBlock: Partial<TimeBlock>) => {
    setTimeBlocks(prev => prev.map(tb => tb.id === id ? { ...tb, ...updatedBlock } : tb));
  };

  const handleDeleteBlock = (id: string) => {
    setTimeBlocks(prev => prev.filter(tb => tb.id !== id));
  };

  return (
    <div className="calendar-shell" style={{ position: 'relative' }}>
      {currentView === 'month' && (
        <MonthView
          currentDate={currentDate}
          deadlines={deadlines}
          onDateChange={setCurrentDate}
          onViewChange={setCurrentView}
          onOpenDeadlineModal={handleOpenDeadlineModal}
          onOpenBlockModal={handleOpenBlockModal}
        />
      )}

      {currentView === 'week' && (
        <WeekView
          currentDate={currentDate}
          timeBlocks={timeBlocks}
          deadlines={deadlines}
          onDateChange={setCurrentDate}
          onViewChange={setCurrentView}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
          onOpenDeadlineModal={handleOpenDeadlineModal}
          onOpenBlockModal={handleOpenBlockModal}
        />
      )}

      {currentView === 'day' && (
        <DayView
          currentDate={currentDate}
          timeBlocks={timeBlocks}
          deadlines={deadlines}
          onDateChange={setCurrentDate}
          onViewChange={setCurrentView}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
          onOpenDeadlineModal={handleOpenDeadlineModal}
          onOpenBlockModal={handleOpenBlockModal}
        />
      )}

      {isDeadlineModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDeadlineModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingDeadline ? 'Edit Deadline' : 'Add Deadline'}</h3>
              <button className="modal-close" onClick={() => setIsDeadlineModalOpen(false)}>×</button>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={deadlineTitle} onChange={e => setDeadlineTitle(e.target.value)} placeholder="e.g. CS 101 Midterm" />
            </div>

            <div className="form-group">
              <label className="form-label">Color & Tag</label>
              <div className="color-swatches">
                {Object.entries(PRESET_COLORS).map(([typeName, hexColor]) => (
                  <div
                    key={typeName}
                    className={`color-swatch-btn ${deadlineColor === hexColor && deadlineType === typeName ? 'selected' : ''}`}
                    style={{ backgroundColor: hexColor }}
                    onClick={() => { setDeadlineType(typeName); setDeadlineColor(hexColor); }}
                    title={typeName}
                  />
                ))}

                {/* Custom Color Input disguised as a swatch */}
                <div style={{ position: 'relative', width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', border: deadlineType === 'Custom' ? '2px solid var(--text-1)' : '1px solid var(--border)' }}>
                  <input
                    type="color"
                    style={{ position: 'absolute', top: -10, left: -10, width: '44px', height: '44px', cursor: 'pointer', opacity: deadlineType === 'Custom' ? 1 : 0 }}
                    value={deadlineType === 'Custom' ? deadlineColor : '#e5e7eb'}
                    onChange={e => { setDeadlineType('Custom'); setDeadlineColor(e.target.value); }}
                    title="Custom Color"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={deadlineDate} onChange={e => setDeadlineDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea className="form-input" value={deadlineDescription} onChange={e => setDeadlineDescription(e.target.value)} placeholder="Add any details or notes here..." rows={3} style={{ resize: 'vertical' }} />
            </div>

            <div className="modal-footer">
              {editingDeadline && (
                <button
                  className="cal-btn btn-danger mr-auto"
                  onClick={() => handleDeleteDeadline(editingDeadline.id)}
                >
                  <Trash2 size={16} /> Delete
                </button>
              )}
              <button className="cal-btn" onClick={() => setIsDeadlineModalOpen(false)}>Cancel</button>
              <button className="cal-btn primary" onClick={handleSaveDeadline}>{editingDeadline ? 'Save Deadline' : 'Add Deadline'}</button>
            </div>
          </div>
        </div>
      )}

      {isBlockModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBlockModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingBlockId ? 'Edit Activity' : 'Add Activity'}</h3>
              <button className="modal-close" onClick={() => setIsBlockModalOpen(false)}>×</button>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={blockTitle} onChange={e => setBlockTitle(e.target.value)} placeholder="e.g. Study for CS 101" />
            </div>

            <div className="form-group">
              <label className="form-label">Color & Tag</label>
              <div className="color-swatches">
                {Object.entries(PRESET_COLORS).map(([typeName, hexColor]) => (
                  <div
                    key={typeName}
                    className={`color-swatch-btn ${blockColor === hexColor && blockType === typeName ? 'selected' : ''}`}
                    style={{ backgroundColor: hexColor }}
                    onClick={() => { setBlockType(typeName as BlockType); setBlockColor(hexColor); }}
                    title={typeName}
                  />
                ))}

                {/* Custom Color Input disguised as a swatch */}
                <div style={{ position: 'relative', width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', border: blockType === 'Custom' ? '2px solid var(--text-1)' : '1px solid var(--border)' }}>
                  <input
                    type="color"
                    style={{ position: 'absolute', top: -10, left: -10, width: '44px', height: '44px', cursor: 'pointer', opacity: blockType === 'Custom' ? 1 : 0 }}
                    value={blockType === 'Custom' ? blockColor : '#e5e7eb'}
                    onChange={e => { setBlockType('Custom'); setBlockColor(e.target.value); }}
                    title="Custom Color"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={blockDate} onChange={e => setBlockDate(e.target.value)} />
            </div>

            <div className="flex-row-gap-m">
              <div className="form-group flex-1">
                <label className="form-label">Start Time</label>
                <input type="time" className="form-input" value={blockStartTime} onChange={e => setBlockStartTime(e.target.value)} />
              </div>
              <div className="form-group flex-1">
                <label className="form-label">End Time</label>
                <input type="time" className="form-input" value={blockEndTime} onChange={e => setBlockEndTime(e.target.value)} />
              </div>
            </div>

            {!editingBlockId && (
              <div className="form-group">
                <label className="form-label">Repeat Options</label>
                <select className="form-select" value={blockRepeatWeeks} onChange={e => setBlockRepeatWeeks(Number(e.target.value))}>
                  <option value={0}>Do not repeat</option>
                  <option value={1}>Repeat weekly for 1 week</option>
                  <option value={2}>Repeat weekly for 2 weeks</option>
                  <option value={4}>Repeat weekly for 1 month</option>
                  <option value={12}>Repeat weekly for 3 months</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea className="form-input" value={blockDescription} onChange={e => setBlockDescription(e.target.value)} placeholder="Add any details or notes here..." rows={3} style={{ resize: 'vertical' }} />
            </div>

            <div className="modal-footer">
              {editingBlockId && (
                <button
                  className="cal-btn btn-danger mr-auto"
                  onClick={() => { handleDeleteBlock(editingBlockId); setIsBlockModalOpen(false); }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              )}
              <button className="cal-btn" onClick={() => setIsBlockModalOpen(false)}>Cancel</button>
              <button className="cal-btn primary" onClick={handleSaveBlockFromModal}>{editingBlockId ? 'Save Block' : 'Add Block'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
