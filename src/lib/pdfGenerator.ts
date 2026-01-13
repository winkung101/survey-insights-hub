import { SurveyResponse, CategoryStats } from '@/types/survey';
import { calculateIndividualStats, calculateCategoryStats } from '@/lib/statistics';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Thai font base64 (subset) - using built-in helvetica for simplicity
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const LABELS = {
  gender: { male: 'ชาย', female: 'หญิง' },
  ageGroup: { '12-15': '12-15 ปี', '16-18': '16-18 ปี' },
  educationLevel: { junior: 'ม.ต้น', senior: 'ม.ปลาย' },
  bmi: { underweight: 'ผอม', normal: 'สมส่วน', overweight: 'ท้วม', obese: 'อ้วน' },
  dailyAllowance: { below50: '<50 บาท', '51-100': '51-100 บาท', '101-150': '101-150 บาท', above150: '>150 บาท' },
  purchaseFrequency: { daily: 'ทุกวัน', '3-4times': '3-4 ครั้ง/สัปดาห์', '1-2times': '1-2 ครั้ง/สัปดาห์', rarely: 'นานๆ ครั้ง' },
  sugarLevel: { '100%': 'หวานปกติ', '50%': 'หวานน้อย', extra: 'หวานมาก', none: 'ไม่ใส่น้ำตาล' },
  dailyExpense: { below20: '<20 บาท', '20-40': '20-40 บาท', '41-60': '41-60 บาท', above60: '>60 บาท' },
  purchaseTime: { morning: 'เช้า', lunch: 'กลางวัน', afternoon: 'เย็น', break: 'พักเบรก' },
  drinkTypes: { soda: 'น้ำอัดลม', tea: 'ชา', yogurt: 'นมเปรี้ยว', juice: 'น้ำผลไม้', energy: 'เครื่องดื่มชูกำลัง' },
  purchaseReason: { taste: 'รสชาติ', thirst: 'แก้กระหาย', price: 'ราคา', friends: 'เพื่อน', habit: 'ความเคยชิน' },
  purchaseFactors: { rule: 'กฎโรงเรียน', only: 'ทางเลือกเดียว', time: 'เวลาจำกัด', convenience: 'สะดวก', none: 'ไม่มีข้อจำกัด' }
};

const getLabel = (category: keyof typeof LABELS, value: string): string => {
  const labels = LABELS[category] as Record<string, string>;
  return labels[value] || value;
};

const getArrayLabels = (category: keyof typeof LABELS, values: string[]): string => {
  return values.map(v => getLabel(category, v)).join(', ');
};

export const generateIndividualPDF = (response: SurveyResponse): void => {
  const doc = new jsPDF();
  const stats = calculateIndividualStats(response);
  
  // Title
  doc.setFontSize(18);
  doc.text('Survey Response Report', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`ID: ${response.id}`, 20, 35);
  doc.text(`Date: ${response.createdAt.toLocaleDateString('th-TH')}`, 20, 42);

  // Part 1 - General Info
  doc.setFontSize(14);
  doc.text('Part 1: General Information', 20, 55);
  
  doc.autoTable({
    startY: 60,
    head: [['Field', 'Value']],
    body: [
      ['Gender', getLabel('gender', response.gender)],
      ['Age Group', getLabel('ageGroup', response.ageGroup)],
      ['Education', getLabel('educationLevel', response.educationLevel)],
      ['BMI', getLabel('bmi', response.bmi)],
      ['Daily Allowance', getLabel('dailyAllowance', response.dailyAllowance)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] }
  });

  // Part 2 - Behavior
  let yPos = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('Part 2: Purchase Behavior', 20, yPos);

  doc.autoTable({
    startY: yPos + 5,
    head: [['Field', 'Value']],
    body: [
      ['Purchase Frequency', getLabel('purchaseFrequency', response.purchaseFrequency)],
      ['Purchase Time', getArrayLabels('purchaseTime', response.purchaseTime)],
      ['Drink Types', getArrayLabels('drinkTypes', response.drinkTypes)],
      ['Sugar Level', getLabel('sugarLevel', response.sugarLevel)],
      ['Purchase Reason', getLabel('purchaseReason', response.purchaseReason)],
      ['Daily Expense', getLabel('dailyExpense', response.dailyExpense)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] }
  });

  // Part 3 - Statistics
  yPos = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('Part 3: Health Risk Assessment', 20, yPos);

  doc.autoTable({
    startY: yPos + 5,
    head: [['Category', 'Mean (x̄)', 'S.D.', 'Level']],
    body: [
      ['Knowledge', stats.knowledge.mean.toFixed(2), stats.knowledge.sd.toFixed(2), stats.knowledge.level],
      ['Awareness', stats.awareness.mean.toFixed(2), stats.awareness.sd.toFixed(2), stats.awareness.level],
      ['Intention', stats.intention.mean.toFixed(2), stats.intention.sd.toFixed(2), stats.intention.level],
      ['Overall', stats.overall.mean.toFixed(2), stats.overall.sd.toFixed(2), stats.overall.level],
    ],
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] }
  });

  // Suggestions
  if (response.suggestions) {
    yPos = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Part 4: Suggestions', 20, yPos);
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(response.suggestions, 170);
    doc.text(splitText, 20, yPos + 10);
  }

  doc.save(`survey-report-${response.id.substring(0, 8)}.pdf`);
};

export const generateSummaryPDF = (responses: SurveyResponse[]): void => {
  const doc = new jsPDF();
  const stats = calculateCategoryStats(responses);
  const total = responses.length;

  // Title
  doc.setFontSize(18);
  doc.text('Survey Summary Report', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Total Responses: ${total}`, 20, 35);
  doc.text(`Generated: ${new Date().toLocaleDateString('th-TH')}`, 20, 42);

  // Demographics
  doc.setFontSize(14);
  doc.text('Demographics Summary', 20, 55);

  const genderCounts = {
    male: responses.filter(r => r.gender === 'male').length,
    female: responses.filter(r => r.gender === 'female').length
  };

  const ageCounts = {
    '12-15': responses.filter(r => r.ageGroup === '12-15').length,
    '16-18': responses.filter(r => r.ageGroup === '16-18').length
  };

  doc.autoTable({
    startY: 60,
    head: [['Category', 'Value', 'Count', 'Percentage']],
    body: [
      ['Gender', 'Male', genderCounts.male, `${((genderCounts.male/total)*100).toFixed(1)}%`],
      ['Gender', 'Female', genderCounts.female, `${((genderCounts.female/total)*100).toFixed(1)}%`],
      ['Age', '12-15 years', ageCounts['12-15'], `${((ageCounts['12-15']/total)*100).toFixed(1)}%`],
      ['Age', '16-18 years', ageCounts['16-18'], `${((ageCounts['16-18']/total)*100).toFixed(1)}%`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] }
  });

  // Health Risk Statistics
  let yPos = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('Health Risk Assessment Summary', 20, yPos);

  doc.autoTable({
    startY: yPos + 5,
    head: [['Category', 'n', 'Mean (x̄)', 'S.D.', 'Level']],
    body: [
      ['Knowledge', stats.knowledge.count, stats.knowledge.mean.toFixed(2), stats.knowledge.sd.toFixed(2), stats.knowledge.level],
      ['Awareness', stats.awareness.count, stats.awareness.mean.toFixed(2), stats.awareness.sd.toFixed(2), stats.awareness.level],
      ['Intention', stats.intention.count, stats.intention.mean.toFixed(2), stats.intention.sd.toFixed(2), stats.intention.level],
      ['Overall', stats.overall.count, stats.overall.mean.toFixed(2), stats.overall.sd.toFixed(2), stats.overall.level],
    ],
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] }
  });

  // Purchase Behavior
  yPos = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('Purchase Frequency', 20, yPos);

  const freqCounts = {
    daily: responses.filter(r => r.purchaseFrequency === 'daily').length,
    '3-4times': responses.filter(r => r.purchaseFrequency === '3-4times').length,
    '1-2times': responses.filter(r => r.purchaseFrequency === '1-2times').length,
    rarely: responses.filter(r => r.purchaseFrequency === 'rarely').length
  };

  doc.autoTable({
    startY: yPos + 5,
    head: [['Frequency', 'Count', 'Percentage']],
    body: [
      ['Daily', freqCounts.daily, `${((freqCounts.daily/total)*100).toFixed(1)}%`],
      ['3-4 times/week', freqCounts['3-4times'], `${((freqCounts['3-4times']/total)*100).toFixed(1)}%`],
      ['1-2 times/week', freqCounts['1-2times'], `${((freqCounts['1-2times']/total)*100).toFixed(1)}%`],
      ['Rarely', freqCounts.rarely, `${((freqCounts.rarely/total)*100).toFixed(1)}%`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] }
  });

  doc.save(`survey-summary-${new Date().toISOString().split('T')[0]}.pdf`);
};
