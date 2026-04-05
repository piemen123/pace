const BASE_URL = 'http://127.0.0.1:8000';

export const createProfile = async (profileData: any) => {
  const response = await fetch(`${BASE_URL}/profiles/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });
  if (!response.ok) throw new Error('Failed to create profile');
  return response.json();
};

export const sendChatMessage = async (message: string, history: any[]) => {
  const response = await fetch(`${BASE_URL}/chat/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
};

export const extractSyllabus = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${BASE_URL}/syllabus/extract/`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to extract');
  return response.json();
};
