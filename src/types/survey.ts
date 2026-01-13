export interface SurveyResponse {
  id: string;
  createdAt: Date;
  
  // ตอนที่ 1 - ข้อมูลทั่วไป
  gender: 'male' | 'female';
  ageGroup: '12-15' | '16-18';
  educationLevel: 'junior' | 'senior';
  bmi: 'underweight' | 'normal' | 'overweight' | 'obese';
  dailyAllowance: 'below50' | '51-100' | '101-150' | 'above150';
  
  // ตอนที่ 2 - พฤติกรรมการเลือกซื้อ
  purchaseFrequency: 'daily' | '3-4times' | '1-2times' | 'rarely';
  purchaseTime: string[];
  drinkTypes: string[];
  sugarLevel: '100%' | '50%' | 'extra' | 'none';
  purchaseReason: string;
  purchaseFactors: string[];
  dailyExpense: 'below20' | '20-40' | '41-60' | 'above60';
  
  // ตอนที่ 3 - ความเสี่ยงต่อสุขภาพ (1-5 scale)
  knowledge1: number;
  knowledge2: number;
  knowledge3: number;
  awareness1: number;
  awareness2: number;
  awareness3: number;
  awareness4: number;
  intention1: number;
  intention2: number;
  intention3: number;
  intention4: number;
  
  // ตอนที่ 4 - ข้อเสนอแนะ
  suggestions: string;
}

export interface StatisticsResult {
  count: number;
  percentage: number;
  mean: number;
  sd: number;
  level: string;
}

export interface CategoryStats {
  knowledge: StatisticsResult;
  awareness: StatisticsResult;
  intention: StatisticsResult;
  overall: StatisticsResult;
}

export const LEVEL_LABELS: Record<string, string> = {
  'highest': 'มากที่สุด',
  'high': 'มาก',
  'moderate': 'ปานกลาง',
  'low': 'น้อย',
  'lowest': 'น้อยที่สุด'
};

export const getLevel = (mean: number): string => {
  if (mean >= 4.51) return 'highest';
  if (mean >= 3.51) return 'high';
  if (mean >= 2.51) return 'moderate';
  if (mean >= 1.51) return 'low';
  return 'lowest';
};
