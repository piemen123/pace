import { useState, useRef } from 'react';
import type { DragEvent, MouseEvent as ReactMouseEvent } from 'react';
import { type TimeBlock } from './mockData';

export function useBlockInteractions(
  timeBlocks: TimeBlock[],
  onUpdateBlock: (id: string, block: Partial<TimeBlock>) => void
) {
  const [, setDraggedBlock] = useState<string | null>(null);
  const resizeStateInfo = useRef<{
    id: string;
    isTop: boolean;
    startY: number;
    originalEndM: number;
    originalStartM: number;
  } | null>(null);

  // Ref so the stable event listener functions always call the latest onUpdateBlock
  const onUpdateBlockRef = useRef(onUpdateBlock);
  onUpdateBlockRef.current = onUpdateBlock;

  // Stable references required for add/removeEventListener to match correctly
  const handleResizeMoveRef = useRef((e: MouseEvent) => {
    if (!resizeStateInfo.current) return;
    const { id, isTop, startY, originalEndM, originalStartM } = resizeStateInfo.current;
    const snappedDeltaM = Math.round((e.clientY - startY) * 1.25 / 15) * 15;

    if (isTop) {
      const newStartM = Math.max(0, Math.min(originalStartM + snappedDeltaM, originalEndM - 15));
      onUpdateBlockRef.current(id, {
        startTime: `${String(Math.floor(newStartM / 60)).padStart(2, '0')}:${String(newStartM % 60).padStart(2, '0')}`
      });
    } else {
      const newEndM = Math.max(originalStartM + 15, Math.min(originalEndM + snappedDeltaM, 24 * 60 - 1));
      onUpdateBlockRef.current(id, {
        endTime: `${String(Math.floor(newEndM / 60)).padStart(2, '0')}:${String(newEndM % 60).padStart(2, '0')}`
      });
    }
  });

  const handleResizeEndRef = useRef(() => {
    window.removeEventListener('mousemove', handleResizeMoveRef.current);
    window.removeEventListener('mouseup', handleResizeEndRef.current);
    document.body.style.cursor = '';
    resizeStateInfo.current = null;
  });

  const handleDragStart = (e: DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedBlock(id);
    setTimeout(() => {
      (e.target as HTMLElement).classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e: DragEvent) => {
    setDraggedBlock(null);
    (e.target as HTMLElement).classList.remove('dragging');
  };

  const handleDrop = (e: DragEvent, dateString: string, hour: number) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;

    const block = timeBlocks.find(tb => tb.id === id);
    if (!block) return;

    const [sH, sM] = block.startTime.split(':').map(Number);
    const [eH, eM] = block.endTime.split(':').map(Number);
    const durationMinutes = ((eH * 60) + eM) - ((sH * 60) + sM);
    const newEndTotalM = hour * 60 + durationMinutes;

    onUpdateBlock(id, {
      date: dateString,
      startTime: `${String(hour).padStart(2, '0')}:00`,
      endTime: `${String(Math.min(23, Math.floor(newEndTotalM / 60))).padStart(2, '0')}:${String(Math.min(59, newEndTotalM % 60)).padStart(2, '0')}`,
    });

    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  };

  const handleResizeStart = (e: ReactMouseEvent, id: string, isTop: boolean) => {
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
      originalEndM: (eH * 60) + eM,
    };

    window.addEventListener('mousemove', handleResizeMoveRef.current);
    window.addEventListener('mouseup', handleResizeEndRef.current);
    document.body.style.cursor = 'ns-resize';
  };

  return { handleDragStart, handleDragEnd, handleDrop, handleResizeStart };
}
