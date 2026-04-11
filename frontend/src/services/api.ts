const BASE_URL = 'http://127.0.0.1:8000';

export interface ProfileData {
  id: string;
  major: string;
  workload_credits: number;
  employment_status: string;
  schedule_preferences: {
    preferred_study_time: string;
    off_days: string[];
  };
}

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

export interface ChatResponse {
  reply: string;
}

export interface SyllabusProject {
  name: string;
  date: string;
}

export interface SyllabusData {
  course_name: string;
  exam_dates: string[];
  project_deadlines: SyllabusProject[];
}

export const createProfile = async (profileData: ProfileData): Promise<ProfileData> => {
  const response = await fetch(`${BASE_URL}/profiles/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });
  if (!response.ok) throw new Error('Failed to create profile');
  return response.json();
};

export const sendChatMessage = async (message: string, history: ChatMessage[]): Promise<ChatResponse> => {
  const response = await fetch(`${BASE_URL}/chat/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
};

export const extractSyllabus = async (file: File): Promise<SyllabusData> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/syllabus/extract/`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to extract');
  return response.json();
};
