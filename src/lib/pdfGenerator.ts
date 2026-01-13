import { SurveyResponse } from '@/types/survey';
import { calculateIndividualStats, calculateCategoryStats, calculateMean, calculateSD } from '@/lib/statistics';
import { getLevel, LEVEL_LABELS } from '@/types/survey';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Configuration & Labels ---
const THAI_FONT = 'THSarabunNew';

const LABELS = {
  gender: { male: 'ชาย', female: 'หญิง' },
  ageGroup: { '12-15': '12-15 ปี', '16-18': '16-18 ปี' },
  educationLevel: { junior: 'ม.ต้น (ม.1-ม.3)', senior: 'ม.ปลาย (ม.4-ม.6)' },
  bmi: { underweight: 'ผอมกว่าเกณฑ์', normal: 'สมส่วน', overweight: 'ท้วม/เริ่มอ้วน', obese: 'อ้วน' },
  dailyAllowance: { below50: 'ต่ำกว่า 50 บาท', '51-100': '51-100 บาท', '101-150': '101-150 บาท', above150: 'มากกว่า 150 บาท' },
  purchaseFrequency: { daily: 'ทุกวัน', '3-4times': '3-4 ครั้ง/สัปดาห์', '1-2times': '1-2 ครั้ง/สัปดาห์', rarely: 'นานๆ ครั้ง' },
  sugarLevel: { '100%': 'หวานปกติ (100%)', '50%': 'หวานน้อย (50%)', extra: 'หวานมาก', none: 'ไม่ใส่น้ำตาล' },
  dailyExpense: { below20: 'ต่ำกว่า 20 บาท', '20-40': '20-40 บาท', '41-60': '41-60 บาท', above60: 'มากกว่า 60 บาท' },
  purchaseTime: { morning: 'ก่อนเข้าเรียน', lunch: 'พักกลางวัน', afternoon: 'หลังเลิกเรียน', break: 'พักเบรก' },
  drinkTypes: { soda: 'น้ำอัดลม', tea: 'ชาเขียว/ชานม', yogurt: 'นมเปรี้ยว/โยเกิร์ต', juice: 'น้ำผลไม้', energy: 'เครื่องดื่มชูกำลัง' },
  purchaseReason: { taste: 'รสชาติอร่อย', thirst: 'แก้กระหาย', price: 'ราคาถูก', friends: 'เพื่อนชวน', habit: 'ความเคยชิน' },
  purchaseFactors: { rule: 'กฎโรงเรียน', only: 'ทางเลือกเดียว', time: 'เวลาจำกัด', convenience: 'สะดวก', none: 'ไม่มีข้อจำกัด' }
};

// Colors
const COLORS = {
  primary: [13, 148, 136] as [number, number, number],      // Teal
  knowledge: [59, 130, 246] as [number, number, number],    // Blue
  awareness: [239, 68, 68] as [number, number, number],     // Red
  intention: [34, 197, 94] as [number, number, number],     // Green
  gray: [107, 114, 128] as [number, number, number],        // Gray
  lightGray: [243, 244, 246] as [number, number, number],   // Light gray
  dark: [31, 41, 55] as [number, number, number],           // Dark
};

// --- Helpers ---
const getLabel = (category: keyof typeof LABELS, value: string): string => {
  const labels = LABELS[category] as Record<string, string>;
  return labels[value] || value;
};

const getArrayLabels = (category: keyof typeof LABELS, values: string[]): string => {
  if (!values || values.length === 0) return '-';
  return values.map(v => getLabel(category, v)).join(', ');
};

const getLevelFromMean = (mean: number): string => {
  const level = getLevel(mean);
  return LEVEL_LABELS[level];
};

// --- Font Loading ---
let fontBase64Cache: string | null = null;
let fontLoadPromise: Promise<string> | null = null;

const loadFontBase64 = async (): Promise<string> => {
  if (fontBase64Cache) return fontBase64Cache;
  if (fontLoadPromise) return fontLoadPromise;

  fontLoadPromise = new Promise(async (resolve, reject) => {
    try {
      // 1. Try Local
      let fontUrl = '/fonts/THSarabunNew.ttf';
      let response = await fetch(fontUrl);
      
      // 2. Try CDN
      if (!response.ok) {
        fontUrl = 'https://cdn.jsdelivr.net/gh/nicedoc/jsPDF-TH-regular@main/fonts/THSarabunNew.ttf';
        response = await fetch(fontUrl);
      }
      
      if (!response.ok) throw new Error('Font load failed');
      
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        fontBase64Cache = base64;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);

    } catch (error) {
      reject(error);
    }
  });
  return fontLoadPromise;
};

const setupThaiFont = async (doc: jsPDF) => {
  try {
    const base64 = await loadFontBase64();
    doc.addFileToVFS('THSarabunNew.ttf', base64);
    doc.addFont('THSarabunNew.ttf', THAI_FONT, 'normal');
    doc.setFont(THAI_FONT);
  } catch (e) {
    console.error('Font Error', e);
    alert('ไม่สามารถโหลดฟอนต์ไทยได้');
  }
};

// --- PDF Components ---
const addHeader = (doc: jsPDF, title: string, subtitle?: string) => {
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(THAI_FONT, 'normal');
  doc.text(title, 105, 12, { align: 'center' });
  if (subtitle) {
    doc.setFontSize(12);
    doc.text(subtitle, 105, 20, { align: 'center' });
  }
  doc.setTextColor(0, 0, 0);
};

const addFooter = (doc: jsPDF, pageNum: number, totalPages: number) => {
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.gray);
  doc.setFont(THAI_FONT, 'normal');
  doc.text(`หน้า ${pageNum} / ${totalPages}`, 105, pageHeight - 10, { align: 'center' });
};

const addSectionTitle = (doc: jsPDF, title: string, yPos: number, color = COLORS.primary) => {
  doc.setFillColor(...color);
  doc.roundedRect(14, yPos - 5, 182, 8, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont(THAI_FONT, 'normal');
  doc.text(title, 18, yPos);
  doc.setTextColor(0, 0, 0);
  return yPos + 8;
};

// --- Main Functions ---

export const generateIndividualPDF = async (response: SurveyResponse): Promise<void> => {
  const doc = new jsPDF();
  await setupThaiFont(doc);
  const stats = calculateIndividualStats(response);

  // Header
  addHeader(doc, 'รายงานผลแบบสอบถามรายบุคคล', `รหัส: ${response.id.substring(0, 8).toUpperCase()}`);

  let yPos = 40;

  // 1. General Info
  yPos = addSectionTitle(doc, 'ส่วนที่ 1: ข้อมูลทั่วไป', yPos);
  autoTable(doc, {
    startY: yPos + 2,
    body: [
      ['เพศ', getLabel('gender', response.gender), 'อายุ', getLabel('ageGroup', response.ageGroup)],
      ['ระดับชั้น', getLabel('educationLevel', response.educationLevel), 'BMI', getLabel('bmi', response.bmi)],
      ['เงินค่าขนม', getLabel('dailyAllowance', response.dailyAllowance), '', '']
    ],
    theme: 'grid',
    styles: { font: THAI_FONT, fontSize: 11 },
    headStyles: { fillColor: COLORS.primary, textColor: 255 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30 }, 2: { fontStyle: 'bold', cellWidth: 30 } },
    margin: { left: 14, right: 14 }
  });

  // 2. Behavior
  yPos = (doc as any).lastAutoTable.finalY + 10;
  yPos = addSectionTitle(doc, 'ส่วนที่ 2: พฤติกรรมการบริโภค', yPos);
  autoTable(doc, {
    startY: yPos + 2,
    body: [
      ['ความถี่ในการซื้อ', getLabel('purchaseFrequency', response.purchaseFrequency)],
      ['ช่วงเวลาที่ซื้อ', getArrayLabels('purchaseTime', response.purchaseTime)],
      ['ประเภทเครื่องดื่ม', getArrayLabels('drinkTypes', response.drinkTypes)],
      ['ระดับความหวาน', getLabel('sugarLevel', response.sugarLevel)],
      ['เหตุผลในการซื้อ', getLabel('purchaseReason', response.purchaseReason)],
      ['ค่าใช้จ่ายต่อวัน', getLabel('dailyExpense', response.dailyExpense)],
    ],
    theme: 'grid',
    styles: { font: THAI_FONT, fontSize: 11 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
    margin: { left: 14, right: 14 }
  });

  // 3. Risk Assessment
  yPos = (doc as any).lastAutoTable.finalY + 10;
  yPos = addSectionTitle(doc, 'ส่วนที่ 3: การประเมินความเสี่ยงต่อสุขภาพ', yPos);
  
  autoTable(doc, {
    startY: yPos + 2,
    head: [['ข้อคำถาม', 'คะแนน', 'ระดับ']],
    body: [
      [{ content: 'ด้านความรู้ความเข้าใจ', colSpan: 3, styles: { fillColor: [239, 246, 255], fontStyle: 'bold' } }],
      ['1.1 ทราบว่าไม่ควรได้รับน้ำตาลเกิน 6 ช้อนชา/วัน', response.knowledge1, getLevelFromMean(response.knowledge1)],
      ['1.2 ทราบว่าเครื่องดื่มมีน้ำตาลเกินปริมาณที่แนะนำ', response.knowledge2, getLevelFromMean(response.knowledge2)],
      ['1.3 อ่านฉลากโภชนาการก่อนซื้อ', response.knowledge3, getLevelFromMean(response.knowledge3)],
      
      [{ content: 'ด้านความตระหนักต่อสุขภาพ', colSpan: 3, styles: { fillColor: [254, 242, 242], fontStyle: 'bold' } }],
      ['2.1 คิดว่าพฤติกรรมเสี่ยงต่อโรคเบาหวาน', response.awareness1, getLevelFromMean(response.awareness1)],
      ['2.2 เคยมีอาการอ่อนเพลียเมื่อไม่ได้ดื่มน้ำหวาน', response.awareness2, getLevelFromMean(response.awareness2)],
      ['2.3 คิดว่าน้ำหนักเพิ่มจากเครื่องดื่มหวาน', response.awareness3, getLevelFromMean(response.awareness3)],
      ['2.4 กังวลเรื่องฟันผุ', response.awareness4, getLevelFromMean(response.awareness4)],

      [{ content: 'ด้านความตั้งใจปรับพฤติกรรม', colSpan: 3, styles: { fillColor: [240, 253, 244], fontStyle: 'bold' } }],
      ['3.1 ตั้งใจจะลดปริมาณเครื่องดื่มหวาน', response.intention1, getLevelFromMean(response.intention1)],
      ['3.2 เชื่อว่าสามารถควบคุมความอยากได้', response.intention2, getLevelFromMean(response.intention2)],
      ['3.3 ยินดีเลือกน้ำเปล่าแทน', response.intention3, getLevelFromMean(response.intention3)],
      ['3.4 พร้อมแนะนำคนอื่นให้ลดน้ำตาล', response.intention4, getLevelFromMean(response.intention4)],
      
      [{ content: `คะแนนรวม: ${stats.overall.mean.toFixed(2)} (${stats.overall.level})`, colSpan: 3, styles: { halign: 'center', fontStyle: 'bold', fillColor: COLORS.lightGray } }]
    ],
    theme: 'grid',
    styles: { font: THAI_FONT, fontSize: 10 },
    headStyles: { fillColor: COLORS.primary, textColor: 255, halign: 'center' },
    columnStyles: { 0: { cellWidth: 120 }, 1: { halign: 'center' }, 2: { halign: 'center' } },
    margin: { left: 14, right: 14 }
  });

  addFooter(doc, 1, 1);
  doc.save(`report-${response.id.substring(0, 8)}.pdf`);
};

export const generateSummaryPDF = async (responses: SurveyResponse[]): Promise<void> => {
  const doc = new jsPDF();
  await setupThaiFont(doc);
  
  const total = responses.length;
  const stats = calculateCategoryStats(responses);
  
  // Helpers for counting
  const count = (k: keyof SurveyResponse, v: string) => responses.filter(r => r[k] === v).length;
  const pct = (n: number) => ((n/total)*100).toFixed(1);
  
  // Header
  addHeader(doc, 'รายงานสรุปผลภาพรวม (ฉบับละเอียด)', `ข้อมูล ณ วันที่: ${new Date().toLocaleDateString('th-TH')} (N=${total})`);
  
  let yPos = 40;

  // 1. Demographics
  yPos = addSectionTitle(doc, '1. ข้อมูลทั่วไป (Demographics)', yPos);
  
  // Gender & Education Table (Side by Side logic via single table)
  autoTable(doc, {
    startY: yPos + 2,
    head: [['ข้อมูล', 'จำนวน', 'ร้อยละ', 'ข้อมูล', 'จำนวน', 'ร้อยละ']],
    body: [
      ['เพศชาย', count('gender', 'male'), pct(count('gender', 'male')), 'ม.ต้น', count('educationLevel', 'junior'), pct(count('educationLevel', 'junior'))],
      ['เพศหญิง', count('gender', 'female'), pct(count('gender', 'female')), 'ม.ปลาย', count('educationLevel', 'senior'), pct(count('educationLevel', 'senior'))],
    ],
    theme: 'grid',
    styles: { font: THAI_FONT, fontSize: 10, halign: 'center' },
    headStyles: { fillColor: COLORS.primary },
    margin: { left: 14, right: 14 }
  });

  // 2. Behavior
  yPos = (doc as any).lastAutoTable.finalY + 10;
  yPos = addSectionTitle(doc, '2. พฤติกรรมการบริโภค', yPos);
  
  autoTable(doc, {
    startY: yPos + 2,
    head: [['ความถี่ในการซื้อ', 'n', '%', 'ค่าใช้จ่ายต่อวัน', 'n', '%']],
    body: [
      ['ทุกวัน', count('purchaseFrequency', 'daily'), pct(count('purchaseFrequency', 'daily')), '< 50 บาท', count('dailyAllowance', 'below50'), pct(count('dailyAllowance', 'below50'))],
      ['3-4 วัน/สัปดาห์', count('purchaseFrequency', '3-4times'), pct(count('purchaseFrequency', '3-4times')), '51-100 บาท', count('dailyAllowance', '51-100'), pct(count('dailyAllowance', '51-100'))],
      ['1-2 วัน/สัปดาห์', count('purchaseFrequency', '1-2times'), pct(count('purchaseFrequency', '1-2times')), '101-150 บาท', count('dailyAllowance', '101-150'), pct(count('dailyAllowance', '101-150'))],
      ['นานๆ ครั้ง', count('purchaseFrequency', 'rarely'), pct(count('purchaseFrequency', 'rarely')), '> 150 บาท', count('dailyAllowance', 'above150'), pct(count('dailyAllowance', 'above150'))],
    ],
    theme: 'grid',
    styles: { font: THAI_FONT, fontSize: 10, halign: 'center' },
    headStyles: { fillColor: COLORS.primary },
    margin: { left: 14, right: 14 }
  });

  // 3. Detailed Stats (1-5 Distribution)
  doc.addPage(); // Force new page for big table
  yPos = 20;
  yPos = addSectionTitle(doc, '3. สถิติความเสี่ยงต่อสุขภาพ (แจกแจงละเอียด)', yPos);

  const genRow = (label: string, field: keyof SurveyResponse) => {
    const vals = responses.map(r => r[field] as number);
    const m = calculateMean(vals);
    const s = calculateSD(vals);
    
    // Count 1-5
    const c = [0,0,0,0,0,0]; // Index 1-5
    vals.forEach(v => { if(v>=1 && v<=5) c[v]++ });
    
    return [
      label,
      `${c[1]} (${pct(c[1])}%)`,
      `${c[2]} (${pct(c[2])}%)`,
      `${c[3]} (${pct(c[3])}%)`,
      `${c[4]} (${pct(c[4])}%)`,
      `${c[5]} (${pct(c[5])}%)`,
      m.toFixed(2),
      s.toFixed(2),
      getLevelFromMean(m)
    ];
  };

  autoTable(doc, {
    startY: yPos + 2,
    head: [
      [
        { content: 'ข้อคำถาม', rowSpan: 2, styles: { valign: 'middle' } },
        { content: 'ระดับคะแนน จำนวน (ร้อยละ)', colSpan: 5, styles: { halign: 'center' } },
        { content: 'x̄', rowSpan: 2, styles: { valign: 'middle' } },
        { content: 'S.D.', rowSpan: 2, styles: { valign: 'middle' } },
        { content: 'ระดับ', rowSpan: 2, styles: { valign: 'middle' } }
      ],
      ['1', '2', '3', '4', '5']
    ],
    body: [
      [{ content: 'ด้านความรู้ความเข้าใจ', colSpan: 10, styles: { fillColor: [239, 246, 255], fontStyle: 'bold' } }],
      genRow('1.1 ไม่ควรรับน้ำตาลเกิน 6 ช้อนชา', 'knowledge1'),
      genRow('1.2 เครื่องดื่มมีน้ำตาลเกินกำหนด', 'knowledge2'),
      genRow('1.3 อ่านฉลากโภชนาการ', 'knowledge3'),

      [{ content: 'ด้านความตระหนักต่อสุขภาพ', colSpan: 10, styles: { fillColor: [254, 242, 242], fontStyle: 'bold' } }],
      genRow('2.1 เสี่ยงต่อโรคเบาหวาน', 'awareness1'),
      genRow('2.2 อ่อนเพลียเมื่อขาดหวาน', 'awareness2'),
      genRow('2.3 น้ำหนักเพิ่มจากน้ำหวาน', 'awareness3'),
      genRow('2.4 กังวลเรื่องฟันผุ', 'awareness4'),

      [{ content: 'ด้านความตั้งใจปรับพฤติกรรม', colSpan: 10, styles: { fillColor: [240, 253, 244], fontStyle: 'bold' } }],
      genRow('3.1 ตั้งใจลดปริมาณ', 'intention1'),
      genRow('3.2 ควบคุมความอยากได้', 'intention2'),
      genRow('3.3 เลือกน้ำเปล่าแทน', 'intention3'),
      genRow('3.4 แนะนำคนอื่นลด', 'intention4'),
      
      [{ content: `ภาพรวมทั้งหมด: x̄ = ${stats.overall.mean.toFixed(2)} | S.D. = ${stats.overall.sd.toFixed(2)} | ระดับ = ${stats.overall.level}`, colSpan: 10, styles: { halign: 'center', fontStyle: 'bold', fillColor: COLORS.lightGray } }]
    ],
    theme: 'grid',
    styles: { font: THAI_FONT, fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: COLORS.primary, textColor: 255, halign: 'center' },
    columnStyles: { 0: { cellWidth: 50 }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' }, 5: { halign: 'center' }, 6: { halign: 'center' }, 7: { halign: 'center' }, 8: { halign: 'center' } },
    margin: { left: 14, right: 14 }
  });

  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  doc.save(`summary-report-${new Date().toISOString().split('T')[0]}.pdf`);
};