export type BlockType = 'Class' | 'Test' | 'Work' | 'Study' | 'Leisure' | 'Sleep' | 'Custom';
export type DeadlineType = 'Project' | 'Test' | 'Homework';

export interface TimeBlock {
  id: string;
  title: string;
  type: BlockType;
  color: string;
  date: string; // YYYY-MM-DD (start date)
  startTime: string; // HH:MM (24h)
  endTime: string; // HH:MM (24h)
  description?: string;
  recurrence?: {
    type: 'weekly';
    endsAfter?: number; // number of total occurrences (undefined = indefinite)
  };
}

export interface Deadline {
  id: string;
  title: string;
  type: string;
  color: string;
  date: string; // YYYY-MM-DD
  description?: string;
}

// Preset NCSU colors and types
export const PRESET_COLORS: Record<BlockType, string> = {
  Class: '#CC0000', // NCSU Red
  Test: '#8B0000',  // Darker Red
  Work: '#2563eb',  // Blue
  Study: '#16a34a', // Green
  Leisure: '#d97706', // Amber
  Sleep: '#6b7280', // Gray
  Custom: '#CC0000',
};

// Base date for relative data generation
const today = new Date();
const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

export const initialTimeBlocks: TimeBlock[] = [
  {
    id: '1',
    title: 'CS 101 Lecture',
    type: 'Class',
    color: PRESET_COLORS.Class,
    date: `${currentYearMonth}-06`,
    startTime: '09:00',
    endTime: '10:30',
  },
  {
    id: '2',
    title: 'Math Tutoring',
    type: 'Work',
    color: PRESET_COLORS.Work,
    date: `${currentYearMonth}-06`,
    startTime: '13:00',
    endTime: '15:00',
  },
  {
    id: '3',
    title: 'Study Session',
    type: 'Study',
    color: PRESET_COLORS.Study,
    date: `${currentYearMonth}-07`,
    startTime: '18:00',
    endTime: '20:00',
  },
  {
    id: '4',
    title: 'CS 101 Lecture',
    type: 'Class',
    color: PRESET_COLORS.Class,
    date: `${currentYearMonth}-08`,
    startTime: '09:00',
    endTime: '10:30',
  },
  {
    id: '5',
    title: 'Gym',
    type: 'Leisure',
    color: PRESET_COLORS.Leisure,
    date: `${currentYearMonth}-08`,
    startTime: '16:00',
    endTime: '17:00',
  }
];

export const initialDeadlines: Deadline[] = [
  {
    id: 'd1',
    title: 'CS 101 Midterm',
    type: 'Test',
    color: PRESET_COLORS.Test,
    date: `${currentYearMonth}-15`, // 9 days from Apr 6
  },
  {
    id: 'd2',
    title: 'Math Assignment 4',
    type: 'Study',
    color: PRESET_COLORS.Study,
    date: `${currentYearMonth}-10`,
  },
  {
    id: 'd3',
    title: 'Final Project Milestone',
    type: 'Work',
    color: '#9333ea', // Purple
    date: `${currentYearMonth}-28`,
  }
];
