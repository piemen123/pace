import { Brain, Clock, BookOpen, GraduationCap, Calendar, Zap } from 'lucide-react';

export const QUICK_PROMPTS = [
  { icon: <Brain size={15} />,         label: 'I have an upcoming exam',   sub: 'Build a study plan'          },
  { icon: <Clock size={15} />,         label: 'Help me plan my week',       sub: 'Optimise your schedule'      },
  { icon: <BookOpen size={15} />,      label: 'Give me study tips',         sub: 'Evidence-based techniques'   },
  { icon: <GraduationCap size={15} />, label: 'Review my workload',         sub: 'Credits & time analysis'     },
  { icon: <Calendar size={15} />,      label: 'When is my next deadline?',  sub: 'Check your timeline'         },
  { icon: <Zap size={15} />,           label: 'Start a focus session',      sub: 'Pomodoro + live guidance'    },
];
