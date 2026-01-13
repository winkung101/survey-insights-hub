import { SurveyResponse, StatisticsResult, CategoryStats, getLevel, LEVEL_LABELS } from '@/types/survey';

export const calculateMean = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

export const calculateSD = (values: number[]): number => {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
};

export const calculatePercentage = (count: number, total: number): number => {
  if (total === 0) return 0;
  return (count / total) * 100;
};

export const getKnowledgeScores = (response: SurveyResponse): number[] => {
  return [response.knowledge1, response.knowledge2, response.knowledge3];
};

export const getAwarenessScores = (response: SurveyResponse): number[] => {
  return [response.awareness1, response.awareness2, response.awareness3, response.awareness4];
};

export const getIntentionScores = (response: SurveyResponse): number[] => {
  return [response.intention1, response.intention2, response.intention3, response.intention4];
};

export const getAllScores = (response: SurveyResponse): number[] => {
  return [...getKnowledgeScores(response), ...getAwarenessScores(response), ...getIntentionScores(response)];
};

export const calculateCategoryStats = (responses: SurveyResponse[]): CategoryStats => {
  const knowledgeScores = responses.flatMap(getKnowledgeScores);
  const awarenessScores = responses.flatMap(getAwarenessScores);
  const intentionScores = responses.flatMap(getIntentionScores);
  const allScores = responses.flatMap(getAllScores);

  const createStats = (scores: number[]): StatisticsResult => {
    const mean = calculateMean(scores);
    const sd = calculateSD(scores);
    const level = getLevel(mean);
    return {
      count: scores.length,
      percentage: 100,
      mean: Number(mean.toFixed(2)),
      sd: Number(sd.toFixed(2)),
      level: LEVEL_LABELS[level]
    };
  };

  return {
    knowledge: createStats(knowledgeScores),
    awareness: createStats(awarenessScores),
    intention: createStats(intentionScores),
    overall: createStats(allScores)
  };
};

export const calculateIndividualStats = (response: SurveyResponse): CategoryStats => {
  return calculateCategoryStats([response]);
};

export const countByField = <T extends keyof SurveyResponse>(
  responses: SurveyResponse[],
  field: T,
  value: SurveyResponse[T]
): number => {
  return responses.filter(r => r[field] === value).length;
};

export const countByArrayField = (
  responses: SurveyResponse[],
  field: 'purchaseTime' | 'drinkTypes' | 'purchaseFactors',
  value: string
): number => {
  return responses.filter(r => r[field].includes(value)).length;
};
