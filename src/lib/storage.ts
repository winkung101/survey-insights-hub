import { supabase } from '@/lib/supabase'; // ต้องมีไฟล์ supabase.ts ก่อนนะ
import { SurveyResponse } from '@/types/survey';

// แปลงข้อมูลจาก App (camelCase) -> Database (snake_case)
const toDbPayload = (response: SurveyResponse) => {
  // ตัด id ออก ให้ Database สร้างเอง หรือจะใช้ id เดิมก็ได้
  const { id, createdAt, ...rest } = response;
  
  return {
    // id: id, // ถ้าอยากใช้ UUID จากฝั่ง Client ให้เปิดบรรทัดนี้
    gender: rest.gender,
    age_group: rest.ageGroup,
    education_level: rest.educationLevel,
    bmi: rest.bmi,
    daily_allowance: rest.dailyAllowance,
    purchase_frequency: rest.purchaseFrequency,
    purchase_time: rest.purchaseTime,
    drink_types: rest.drinkTypes,
    sugar_level: rest.sugarLevel,
    purchase_reason: rest.purchaseReason,
    purchase_factors: rest.purchaseFactors,
    daily_expense: rest.dailyExpense,
    knowledge1: rest.knowledge1,
    knowledge2: rest.knowledge2,
    knowledge3: rest.knowledge3,
    awareness1: rest.awareness1,
    awareness2: rest.awareness2,
    awareness3: rest.awareness3,
    awareness4: rest.awareness4,
    intention1: rest.intention1,
    intention2: rest.intention2,
    intention3: rest.intention3,
    intention4: rest.intention4,
    suggestions: rest.suggestions,
  };
};

// แปลงข้อมูลจาก Database (snake_case) -> App (camelCase)
const fromDbPayload = (dbData: any): SurveyResponse => {
  return {
    id: dbData.id,
    createdAt: new Date(dbData.created_at),
    gender: dbData.gender,
    ageGroup: dbData.age_group,
    educationLevel: dbData.education_level,
    bmi: dbData.bmi,
    dailyAllowance: dbData.daily_allowance,
    purchaseFrequency: dbData.purchase_frequency,
    purchaseTime: dbData.purchase_time || [],
    drinkTypes: dbData.drink_types || [],
    sugarLevel: dbData.sugar_level,
    purchaseReason: dbData.purchase_reason,
    purchaseFactors: dbData.purchase_factors || [],
    dailyExpense: dbData.daily_expense,
    knowledge1: dbData.knowledge1,
    knowledge2: dbData.knowledge2,
    knowledge3: dbData.knowledge3,
    awareness1: dbData.awareness1,
    awareness2: dbData.awareness2,
    awareness3: dbData.awareness3,
    awareness4: dbData.awareness4,
    intention1: dbData.intention1,
    intention2: dbData.intention2,
    intention3: dbData.intention3,
    intention4: dbData.intention4,
    suggestions: dbData.suggestions || '',
  };
};

// --- ฟังก์ชันหลัก ---

export const saveResponse = async (response: SurveyResponse): Promise<void> => {
  const payload = toDbPayload(response);
  
  const { error } = await supabase
    .from('survey_responses')
    .insert([payload]);

  if (error) {
    console.error('Error saving to Supabase:', error);
    throw error; // ส่ง Error กลับไปให้ SurveyForm รับรู้
  }
};

export const getResponses = async (): Promise<SurveyResponse[]> => {
  const { data, error } = await supabase
    .from('survey_responses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching responses:', error);
    return [];
  }

  return data.map(fromDbPayload);
};

export const clearResponses = async (): Promise<void> => {
    // ฟังก์ชันนี้อันตราย ควรใช้อย่างระวังในระบบจริง
    const { error } = await supabase
      .from('survey_responses')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // ลบทุกแถวที่มี ID ไม่ว่างเปล่า
      
    if (error) throw error;
};