import { SurveyResponse } from '@/types/survey';
import { calculateIndividualStats, calculateCategoryStats, calculateMean, calculateSD } from '@/lib/statistics';
import { getLevel, LEVEL_LABELS } from '@/types/survey';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const LABELS = {
  gender: { male: 'Male', female: 'Female' },
  ageGroup: { '12-15': '12-15 years', '16-18': '16-18 years' },
  educationLevel: { junior: 'Junior High', senior: 'Senior High' },
  bmi: { underweight: 'Underweight', normal: 'Normal', overweight: 'Overweight', obese: 'Obese' },
  dailyAllowance: { below50: '<50 THB', '51-100': '51-100 THB', '101-150': '101-150 THB', above150: '>150 THB' },
  purchaseFrequency: { daily: 'Daily', '3-4times': '3-4 times/week', '1-2times': '1-2 times/week', rarely: 'Rarely' },
  sugarLevel: { '100%': 'Normal (100%)', '50%': 'Less (50%)', extra: 'Extra', none: 'No sugar' },
  dailyExpense: { below20: '<20 THB', '20-40': '20-40 THB', '41-60': '41-60 THB', above60: '>60 THB' },
  purchaseTime: { morning: 'Morning', lunch: 'Lunch', afternoon: 'After school', break: 'Break' },
  drinkTypes: { soda: 'Soft drink', tea: 'Tea', yogurt: 'Yogurt', juice: 'Juice', energy: 'Energy drink' },
  purchaseReason: { taste: 'Taste', thirst: 'Thirst', price: 'Price', friends: 'Friends', habit: 'Habit' },
  purchaseFactors: { rule: 'School rules', only: 'Only option', time: 'Limited time', convenience: 'Convenience', none: 'No restriction' }
};

const QUESTION_LABELS = {
  knowledge1: '1.1 Sugar limit (6 tsp/day)',
  knowledge2: '1.2 Drinks exceed sugar limit',
  knowledge3: '1.3 Read nutrition labels',
  awareness1: '2.1 Diabetes risk',
  awareness2: '2.2 Fatigue without sweet drinks',
  awareness3: '2.3 Weight gain from drinks',
  awareness4: '2.4 Tooth decay concern',
  intention1: '3.1 Intent to reduce sugar',
  intention2: '3.2 Self-control ability',
  intention3: '3.3 Choose water instead',
  intention4: '3.4 Advise others'
};

const getLabel = (category: keyof typeof LABELS, value: string): string => {
  const labels = LABELS[category] as Record<string, string>;
  return labels[value] || value;
};

const getArrayLabels = (category: keyof typeof LABELS, values: string[]): string => {
  return values.map(v => getLabel(category, v)).join(', ');
};

const getLevelFromMean = (mean: number): string => {
  const level = getLevel(mean);
  return LEVEL_LABELS[level];
};

export const generateIndividualPDF = (response: SurveyResponse): void => {
  const doc = new jsPDF();
  const stats = calculateIndividualStats(response);
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(13, 148, 136);
  doc.text('Survey Response Report', 105, 20, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`ID: ${response.id.substring(0, 8)}`, 20, 32);
  doc.text(`Date: ${response.createdAt.toLocaleDateString('th-TH')}`, 20, 38);

  // Part 1 - General Info
  doc.setFontSize(12);
  doc.setTextColor(13, 148, 136);
  doc.text('Part 1: General Information', 20, 50);
  
  autoTable(doc, {
    startY: 54,
    head: [['Field', 'Value']],
    body: [
      ['Gender', getLabel('gender', response.gender)],
      ['Age Group', getLabel('ageGroup', response.ageGroup)],
      ['Education', getLabel('educationLevel', response.educationLevel)],
      ['BMI', getLabel('bmi', response.bmi)],
      ['Daily Allowance', getLabel('dailyAllowance', response.dailyAllowance)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] },
    styles: { fontSize: 9 }
  });

  // Part 2 - Behavior
  let yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(13, 148, 136);
  doc.text('Part 2: Purchase Behavior', 20, yPos);

  autoTable(doc, {
    startY: yPos + 4,
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
    headStyles: { fillColor: [13, 148, 136] },
    styles: { fontSize: 9 }
  });

  // Part 3 - Detailed Scores
  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(13, 148, 136);
  doc.text('Part 3: Health Risk Assessment - Detailed Scores', 20, yPos);

  // Knowledge items
  autoTable(doc, {
    startY: yPos + 4,
    head: [['Item', 'Score', 'Level']],
    body: [
      [QUESTION_LABELS.knowledge1, response.knowledge1, getLevelFromMean(response.knowledge1)],
      [QUESTION_LABELS.knowledge2, response.knowledge2, getLevelFromMean(response.knowledge2)],
      [QUESTION_LABELS.knowledge3, response.knowledge3, getLevelFromMean(response.knowledge3)],
      ['Knowledge Average', stats.knowledge.mean.toFixed(2), stats.knowledge.level],
    ],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 8 }
  });

  // Awareness items
  yPos = (doc as any).lastAutoTable.finalY + 5;
  autoTable(doc, {
    startY: yPos,
    head: [['Item', 'Score', 'Level']],
    body: [
      [QUESTION_LABELS.awareness1, response.awareness1, getLevelFromMean(response.awareness1)],
      [QUESTION_LABELS.awareness2, response.awareness2, getLevelFromMean(response.awareness2)],
      [QUESTION_LABELS.awareness3, response.awareness3, getLevelFromMean(response.awareness3)],
      [QUESTION_LABELS.awareness4, response.awareness4, getLevelFromMean(response.awareness4)],
      ['Awareness Average', stats.awareness.mean.toFixed(2), stats.awareness.level],
    ],
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68] },
    styles: { fontSize: 8 }
  });

  // Intention items
  yPos = (doc as any).lastAutoTable.finalY + 5;
  autoTable(doc, {
    startY: yPos,
    head: [['Item', 'Score', 'Level']],
    body: [
      [QUESTION_LABELS.intention1, response.intention1, getLevelFromMean(response.intention1)],
      [QUESTION_LABELS.intention2, response.intention2, getLevelFromMean(response.intention2)],
      [QUESTION_LABELS.intention3, response.intention3, getLevelFromMean(response.intention3)],
      [QUESTION_LABELS.intention4, response.intention4, getLevelFromMean(response.intention4)],
      ['Intention Average', stats.intention.mean.toFixed(2), stats.intention.level],
    ],
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
    styles: { fontSize: 8 }
  });

  // Overall Summary
  yPos = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setTextColor(13, 148, 136);
  doc.text('Overall Summary', 20, yPos);

  autoTable(doc, {
    startY: yPos + 4,
    head: [['Category', 'n', 'Mean (x)', 'S.D.', 'Level']],
    body: [
      ['Knowledge', '3', stats.knowledge.mean.toFixed(2), stats.knowledge.sd.toFixed(2), stats.knowledge.level],
      ['Awareness', '4', stats.awareness.mean.toFixed(2), stats.awareness.sd.toFixed(2), stats.awareness.level],
      ['Intention', '4', stats.intention.mean.toFixed(2), stats.intention.sd.toFixed(2), stats.intention.level],
      ['OVERALL', '11', stats.overall.mean.toFixed(2), stats.overall.sd.toFixed(2), stats.overall.level],
    ],
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] },
    styles: { fontSize: 9 }
  });

  // Suggestions
  if (response.suggestions && response.suggestions.trim()) {
    yPos = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setTextColor(13, 148, 136);
    doc.text('Part 4: Suggestions', 20, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    const splitText = doc.splitTextToSize(response.suggestions, 170);
    doc.text(splitText, 20, yPos + 6);
  }

  doc.save(`survey-report-${response.id.substring(0, 8)}.pdf`);
};

export const generateSummaryPDF = (responses: SurveyResponse[]): void => {
  const doc = new jsPDF();
  const stats = calculateCategoryStats(responses);
  const total = responses.length;

  // Title
  doc.setFontSize(18);
  doc.setTextColor(13, 148, 136);
  doc.text('Survey Summary Report', 105, 20, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Total Responses: ${total}`, 20, 32);
  doc.text(`Generated: ${new Date().toLocaleDateString('th-TH')}`, 20, 38);

  // Demographics
  doc.setFontSize(12);
  doc.setTextColor(13, 148, 136);
  doc.text('Demographics Summary', 20, 50);

  const genderCounts = {
    male: responses.filter(r => r.gender === 'male').length,
    female: responses.filter(r => r.gender === 'female').length
  };

  const ageCounts = {
    '12-15': responses.filter(r => r.ageGroup === '12-15').length,
    '16-18': responses.filter(r => r.ageGroup === '16-18').length
  };

  const eduCounts = {
    junior: responses.filter(r => r.educationLevel === 'junior').length,
    senior: responses.filter(r => r.educationLevel === 'senior').length
  };

  autoTable(doc, {
    startY: 54,
    head: [['Category', 'Value', 'n', '%']],
    body: [
      ['Gender', 'Male', genderCounts.male, `${((genderCounts.male/total)*100).toFixed(1)}`],
      ['Gender', 'Female', genderCounts.female, `${((genderCounts.female/total)*100).toFixed(1)}`],
      ['Age', '12-15 years', ageCounts['12-15'], `${((ageCounts['12-15']/total)*100).toFixed(1)}`],
      ['Age', '16-18 years', ageCounts['16-18'], `${((ageCounts['16-18']/total)*100).toFixed(1)}`],
      ['Education', 'Junior High', eduCounts.junior, `${((eduCounts.junior/total)*100).toFixed(1)}`],
      ['Education', 'Senior High', eduCounts.senior, `${((eduCounts.senior/total)*100).toFixed(1)}`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] },
    styles: { fontSize: 9 }
  });

  // Detailed Item Analysis
  let yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(13, 148, 136);
  doc.text('Part 3: Health Risk - Item Analysis', 20, yPos);

  // Calculate per-item statistics
  const calcItemStats = (field: keyof SurveyResponse) => {
    const values = responses.map(r => r[field] as number);
    const mean = calculateMean(values);
    const sd = calculateSD(values);
    return { n: values.length, mean, sd, level: getLevelFromMean(mean) };
  };

  // Knowledge items
  const k1 = calcItemStats('knowledge1');
  const k2 = calcItemStats('knowledge2');
  const k3 = calcItemStats('knowledge3');

  autoTable(doc, {
    startY: yPos + 4,
    head: [['1. Knowledge', 'n', 'Mean (x)', 'S.D.', 'Level']],
    body: [
      ['1.1 Sugar limit awareness', k1.n, k1.mean.toFixed(2), k1.sd.toFixed(2), k1.level],
      ['1.2 Drinks exceed limit', k2.n, k2.mean.toFixed(2), k2.sd.toFixed(2), k2.level],
      ['1.3 Read nutrition labels', k3.n, k3.mean.toFixed(2), k3.sd.toFixed(2), k3.level],
      ['Knowledge Total', total, stats.knowledge.mean.toFixed(2), stats.knowledge.sd.toFixed(2), stats.knowledge.level],
    ],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 8 }
  });

  // Awareness items
  const a1 = calcItemStats('awareness1');
  const a2 = calcItemStats('awareness2');
  const a3 = calcItemStats('awareness3');
  const a4 = calcItemStats('awareness4');

  yPos = (doc as any).lastAutoTable.finalY + 5;
  autoTable(doc, {
    startY: yPos,
    head: [['2. Health Awareness', 'n', 'Mean (x)', 'S.D.', 'Level']],
    body: [
      ['2.1 Diabetes risk perception', a1.n, a1.mean.toFixed(2), a1.sd.toFixed(2), a1.level],
      ['2.2 Fatigue symptoms', a2.n, a2.mean.toFixed(2), a2.sd.toFixed(2), a2.level],
      ['2.3 Weight gain awareness', a3.n, a3.mean.toFixed(2), a3.sd.toFixed(2), a3.level],
      ['2.4 Tooth decay concern', a4.n, a4.mean.toFixed(2), a4.sd.toFixed(2), a4.level],
      ['Awareness Total', total, stats.awareness.mean.toFixed(2), stats.awareness.sd.toFixed(2), stats.awareness.level],
    ],
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68] },
    styles: { fontSize: 8 }
  });

  // Intention items  
  const i1 = calcItemStats('intention1');
  const i2 = calcItemStats('intention2');
  const i3 = calcItemStats('intention3');
  const i4 = calcItemStats('intention4');

  yPos = (doc as any).lastAutoTable.finalY + 5;
  autoTable(doc, {
    startY: yPos,
    head: [['3. Behavior Intention', 'n', 'Mean (x)', 'S.D.', 'Level']],
    body: [
      ['3.1 Intent to reduce sugar', i1.n, i1.mean.toFixed(2), i1.sd.toFixed(2), i1.level],
      ['3.2 Self-control ability', i2.n, i2.mean.toFixed(2), i2.sd.toFixed(2), i2.level],
      ['3.3 Choose water instead', i3.n, i3.mean.toFixed(2), i3.sd.toFixed(2), i3.level],
      ['3.4 Advise others', i4.n, i4.mean.toFixed(2), i4.sd.toFixed(2), i4.level],
      ['Intention Total', total, stats.intention.mean.toFixed(2), stats.intention.sd.toFixed(2), stats.intention.level],
    ],
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
    styles: { fontSize: 8 }
  });

  // Overall Summary
  yPos = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setTextColor(13, 148, 136);
  doc.text('Overall Summary', 20, yPos);

  autoTable(doc, {
    startY: yPos + 4,
    head: [['Category', 'Items', 'n', 'Mean (x)', 'S.D.', 'Level']],
    body: [
      ['Knowledge', '3', total * 3, stats.knowledge.mean.toFixed(2), stats.knowledge.sd.toFixed(2), stats.knowledge.level],
      ['Awareness', '4', total * 4, stats.awareness.mean.toFixed(2), stats.awareness.sd.toFixed(2), stats.awareness.level],
      ['Intention', '4', total * 4, stats.intention.mean.toFixed(2), stats.intention.sd.toFixed(2), stats.intention.level],
      ['OVERALL', '11', total * 11, stats.overall.mean.toFixed(2), stats.overall.sd.toFixed(2), stats.overall.level],
    ],
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] },
    styles: { fontSize: 9, fontStyle: 'bold' }
  });

  // Purchase Frequency
  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setTextColor(13, 148, 136);
  doc.text('Purchase Frequency Distribution', 20, yPos);

  const freqCounts = {
    daily: responses.filter(r => r.purchaseFrequency === 'daily').length,
    '3-4times': responses.filter(r => r.purchaseFrequency === '3-4times').length,
    '1-2times': responses.filter(r => r.purchaseFrequency === '1-2times').length,
    rarely: responses.filter(r => r.purchaseFrequency === 'rarely').length
  };

  autoTable(doc, {
    startY: yPos + 4,
    head: [['Frequency', 'n', '%']],
    body: [
      ['Daily', freqCounts.daily, `${((freqCounts.daily/total)*100).toFixed(1)}`],
      ['3-4 times/week', freqCounts['3-4times'], `${((freqCounts['3-4times']/total)*100).toFixed(1)}`],
      ['1-2 times/week', freqCounts['1-2times'], `${((freqCounts['1-2times']/total)*100).toFixed(1)}`],
      ['Rarely', freqCounts.rarely, `${((freqCounts.rarely/total)*100).toFixed(1)}`],
      ['Total', total, '100.0'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] },
    styles: { fontSize: 9 }
  });

  // Interpretation guide
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(13, 148, 136);
  doc.text('Score Interpretation Guide', 105, 20, { align: 'center' });

  autoTable(doc, {
    startY: 30,
    head: [['Mean Score Range', 'Level', 'Interpretation']],
    body: [
      ['4.51 - 5.00', 'Highest', 'Very high awareness/intention'],
      ['3.51 - 4.50', 'High', 'High awareness/intention'],
      ['2.51 - 3.50', 'Moderate', 'Moderate awareness/intention'],
      ['1.51 - 2.50', 'Low', 'Low awareness/intention'],
      ['1.00 - 1.50', 'Lowest', 'Very low awareness/intention'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [13, 148, 136] },
    styles: { fontSize: 10 }
  });

  doc.save(`survey-summary-${new Date().toISOString().split('T')[0]}.pdf`);
};
