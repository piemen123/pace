import { type TimeBlock } from './mockData';

export function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getBlockStyle(startTime: string, endTime: string, color: string) {
  const [sH, sM] = startTime.split(':').map(Number);
  const [eH, eM] = endTime.split(':').map(Number);
  const top = (sH * 48) + (sM * 0.8);
  const height = ((eH * 48) + (eM * 0.8)) - top;
  return { top: `${top}px`, height: `${height}px`, backgroundColor: color };
}

export function blockMatchesDate(block: TimeBlock, dateString: string): boolean {
  if (!block.recurrence) return block.date === dateString;
  if (dateString < block.date) return false;

  const start = new Date(block.date + 'T12:00:00');
  const target = new Date(dateString + 'T12:00:00');
  const diffDays = Math.round((target.getTime() - start.getTime()) / 86400000);

  if (diffDays % 7 !== 0) return false;

  const occurrence = diffDays / 7; // 0-based index
  if (block.recurrence.endsAfter !== undefined && occurrence >= block.recurrence.endsAfter) return false;

  return true;
}
