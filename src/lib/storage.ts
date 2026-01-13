import { SurveyResponse } from '@/types/survey';

const STORAGE_KEY = 'survey_responses';

export const saveResponse = (response: SurveyResponse): void => {
  const responses = getResponses();
  responses.push(response);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
};

export const getResponses = (): SurveyResponse[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return JSON.parse(data).map((r: SurveyResponse) => ({
    ...r,
    createdAt: new Date(r.createdAt)
  }));
};

export const clearResponses = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getResponseById = (id: string): SurveyResponse | undefined => {
  return getResponses().find(r => r.id === id);
};
