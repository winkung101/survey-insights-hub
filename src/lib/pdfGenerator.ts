import { SurveyResponse } from '@/types/survey';
import { calculateIndividualStats, calculateCategoryStats, calculateMean, calculateSD } from '@/lib/statistics';
import { getLevel, LEVEL_LABELS } from '@/types/survey';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Thai-friendly labels
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

// Color palette
const COLORS = {
  primary: [13, 148, 136] as [number, number, number],      // Teal
  knowledge: [59, 130, 246] as [number, number, number],    // Blue
  awareness: [239, 68, 68] as [number, number, number],     // Red
  intention: [34, 197, 94] as [number, number, number],     // Green
  gray: [107, 114, 128] as [number, number, number],        // Gray
  lightGray: [243, 244, 246] as [number, number, number],   // Light gray
  dark: [31, 41, 55] as [number, number, number],           // Dark
};

// Font name constant
const THAI_FONT = 'THSarabunNew';

// Font loading cache - store base64 globally
let fontBase64Cache: string | null = null;
let fontLoadPromise: Promise<string> | null = null;

const loadFontBase64 = async (): Promise<string> => {
  if (fontBase64Cache) {
    return fontBase64Cache;
  }
  
  if (fontLoadPromise) {
    return fontLoadPromise;
  }

  fontLoadPromise = (async () => {
    try {
      // Load THSarabunNew from reliable CDN
      const fontUrl = 'https://cdn.jsdelivr.net/gh/nicedoc/jsPDF-TH-regular@main/fonts/THSarabunNew.ttf';
      const response = await fetch(fontUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch font: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      // Convert to base64
      const uint8Array = new Uint8Array(arrayBuffer);
      let binaryString = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binaryString);
      
      fontBase64Cache = base64;
      return base64;
    } catch (error) {
      console.error('Failed to load Thai font from primary CDN, trying fallback:', error);
      
      // Fallback to another source
      try {
        const fallbackUrl = 'https://raw.githubusercontent.com/nicedoc/jsPDF-TH-regular/main/fonts/THSarabunNew.ttf';
        const response = await fetch(fallbackUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        const uint8Array = new Uint8Array(arrayBuffer);
        let binaryString = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binaryString += String.fromCharCode(uint8Array[i]);
        }
        const base64 = btoa(binaryString);
        
        fontBase64Cache = base64;
        return base64;
      } catch (fallbackError) {
        console.error('Failed to load Thai font from fallback:', fallbackError);
        throw fallbackError;
      }
    }
  })();

  return fontLoadPromise;
};

const setupThaiFont = async (doc: jsPDF): Promise<void> => {
  try {
    const base64 = await loadFontBase64();
    
    // Add font to this specific doc instance
    doc.addFileToVFS('THSarabunNew.ttf', base64);
    doc.addFont('THSarabunNew.ttf', THAI_FONT, 'normal');
    doc.setFont(THAI_FONT);
  } catch (error) {
    console.error('Failed to setup Thai font, using fallback:', error);
    // Keep default Helvetica font
  }
};

const addHeader = (doc: jsPDF, title: string, subtitle?: string) => {
  // Header background
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 35, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(THAI_FONT, 'normal');
  doc.text(title, 105, 15, { align: 'center' });
  
  if (subtitle) {
    doc.setFontSize(12);
    doc.text(subtitle, 105, 24, { align: 'center' });
  }
  
  doc.setTextColor(0, 0, 0);
};

const addSectionTitle = (doc: jsPDF, title: string, yPos: number, color: [number, number, number] = COLORS.primary) => {
  doc.setFillColor(...color);
  doc.roundedRect(15, yPos - 5, 180, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont(THAI_FONT, 'normal');
  doc.text(title, 20, yPos);
  doc.setTextColor(0, 0, 0);
  return yPos + 8;
};

const addFooter = (doc: jsPDF, pageNum: number, totalPages: number) => {
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.gray);
  doc.setFont(THAI_FONT, 'normal');
  doc.text(
    `หน้า ${pageNum} / ${totalPages}`,
    105,
    pageHeight - 10,
    { align: 'center' }
  );
  doc.text(
    'โรงเรียนอาจสามารถวิทยา - รายวิชา IS',
    105,
    pageHeight - 5,
    { align: 'center' }
  );
};

export const generateIndividualPDF = async (response: SurveyResponse): Promise<void> => {
  const doc = new jsPDF();
  
  // Load Thai font
  await setupThaiFont(doc);
  
  const stats = calculateIndividualStats(response);
  
  // Header
  addHeader(doc, 
    'รายงานผลแบบสอบถามรายบุคคล',
    'การศึกษาพฤติกรรมการเลือกซื้อเครื่องดื่มผสมน้ำตาลในสหกรณ์โรงเรียน'
  );
  
  // Info box
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(15, 40, 180, 15, 3, 3, 'F');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont(THAI_FONT, 'normal');
  doc.text(`รหัสแบบสอบถาม: ${response.id.substring(0, 8).toUpperCase()}`, 20, 48);
  doc.text(`วันที่ตอบ: ${response.createdAt.toLocaleDateString('th-TH', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 120, 48);

  // Part 1 - General Info
  let yPos = addSectionTitle(doc, 'ตอนที่ 1: ข้อมูลทั่วไปของผู้ตอบแบบสอบถาม', 65);
  
  autoTable(doc, {
    startY: yPos + 2,
    head: [['รายการ', 'ข้อมูล']],
    body: [
      ['เพศ', getLabel('gender', response.gender)],
      ['ช่วงอายุ', getLabel('ageGroup', response.ageGroup)],
      ['ระดับชั้น', getLabel('educationLevel', response.educationLevel)],
      ['ดัชนีมวลกาย', getLabel('bmi', response.bmi)],
      ['รายได้/ค่าขนมต่อวัน', getLabel('dailyAllowance', response.dailyAllowance)],
    ],
    theme: 'grid',
    headStyles: { fillColor: COLORS.primary, fontSize: 11, font: THAI_FONT },
    bodyStyles: { fontSize: 11, font: THAI_FONT },
    columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 120 } },
    margin: { left: 15, right: 15 }
  });

  // Part 2 - Behavior
  yPos = (doc as any).lastAutoTable.finalY + 8;
  yPos = addSectionTitle(doc, 'ตอนที่ 2: พฤติกรรมการเลือกซื้อเครื่องดื่มผสมน้ำตาล', yPos);

  autoTable(doc, {
    startY: yPos + 2,
    head: [['รายการ', 'ข้อมูล']],
    body: [
      ['ความถี่ในการซื้อ', getLabel('purchaseFrequency', response.purchaseFrequency)],
      ['ช่วงเวลาที่นิยมซื้อ', getArrayLabels('purchaseTime', response.purchaseTime)],
      ['ประเภทเครื่องดื่ม', getArrayLabels('drinkTypes', response.drinkTypes)],
      ['ระดับความหวาน', getLabel('sugarLevel', response.sugarLevel)],
      ['เหตุผลในการซื้อ', getLabel('purchaseReason', response.purchaseReason)],
      ['ค่าใช้จ่ายต่อวัน', getLabel('dailyExpense', response.dailyExpense)],
    ],
    theme: 'grid',
    headStyles: { fillColor: COLORS.primary, fontSize: 11, font: THAI_FONT },
    bodyStyles: { fontSize: 11, font: THAI_FONT },
    columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 120 } },
    margin: { left: 15, right: 15 }
  });

  // Part 3 - Scores Detail
  yPos = (doc as any).lastAutoTable.finalY + 8;
  yPos = addSectionTitle(doc, 'ตอนที่ 3: ความเสี่ยงต่อสุขภาพจากการบริโภคน้ำตาลสูง', yPos);

  // Knowledge
  autoTable(doc, {
    startY: yPos + 2,
    head: [['1. ด้านความรู้ความเข้าใจ', 'คะแนน', 'ระดับ']],
    body: [
      ['1.1 ทราบว่าไม่ควรได้รับน้ำตาลเกิน 6 ช้อนชา/วัน', response.knowledge1, getLevelFromMean(response.knowledge1)],
      ['1.2 ทราบว่าเครื่องดื่มมีน้ำตาลเกินปริมาณที่แนะนำ', response.knowledge2, getLevelFromMean(response.knowledge2)],
      ['1.3 อ่านฉลากโภชนาการก่อนซื้อ', response.knowledge3, getLevelFromMean(response.knowledge3)],
      ['ค่าเฉลี่ยด้านความรู้', stats.knowledge.mean.toFixed(2), stats.knowledge.level],
    ],
    theme: 'grid',
    headStyles: { fillColor: COLORS.knowledge, fontSize: 10, font: THAI_FONT },
    bodyStyles: { fontSize: 10, font: THAI_FONT },
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 30, halign: 'center' }, 2: { cellWidth: 30, halign: 'center' } },
    margin: { left: 15, right: 15 }
  });

  // Awareness
  yPos = (doc as any).lastAutoTable.finalY + 3;
  autoTable(doc, {
    startY: yPos,
    head: [['2. ด้านความตระหนักต่อสุขภาพ', 'คะแนน', 'ระดับ']],
    body: [
      ['2.1 คิดว่าพฤติกรรมเสี่ยงต่อโรคเบาหวาน', response.awareness1, getLevelFromMean(response.awareness1)],
      ['2.2 เคยมีอาการอ่อนเพลียเมื่อไม่ได้ดื่มน้ำหวาน', response.awareness2, getLevelFromMean(response.awareness2)],
      ['2.3 คิดว่าน้ำหนักเพิ่มจากเครื่องดื่มหวาน', response.awareness3, getLevelFromMean(response.awareness3)],
      ['2.4 กังวลเรื่องฟันผุ', response.awareness4, getLevelFromMean(response.awareness4)],
      ['ค่าเฉลี่ยด้านความตระหนัก', stats.awareness.mean.toFixed(2), stats.awareness.level],
    ],
    theme: 'grid',
    headStyles: { fillColor: COLORS.awareness, fontSize: 10, font: THAI_FONT },
    bodyStyles: { fontSize: 10, font: THAI_FONT },
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 30, halign: 'center' }, 2: { cellWidth: 30, halign: 'center' } },
    margin: { left: 15, right: 15 }
  });

  // Intention
  yPos = (doc as any).lastAutoTable.finalY + 3;
  autoTable(doc, {
    startY: yPos,
    head: [['3. ด้านความตั้งใจและการปรับเปลี่ยนพฤติกรรม', 'คะแนน', 'ระดับ']],
    body: [
      ['3.1 ตั้งใจจะลดปริมาณเครื่องดื่มหวาน', response.intention1, getLevelFromMean(response.intention1)],
      ['3.2 เชื่อว่าสามารถควบคุมความอยากได้', response.intention2, getLevelFromMean(response.intention2)],
      ['3.3 ยินดีเลือกน้ำเปล่าแทน', response.intention3, getLevelFromMean(response.intention3)],
      ['3.4 พร้อมแนะนำคนอื่นให้ลดน้ำตาล', response.intention4, getLevelFromMean(response.intention4)],
      ['ค่าเฉลี่ยด้านความตั้งใจ', stats.intention.mean.toFixed(2), stats.intention.level],
    ],
    theme: 'grid',
    headStyles: { fillColor: COLORS.intention, fontSize: 10, font: THAI_FONT },
    bodyStyles: { fontSize: 10, font: THAI_FONT },
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 30, halign: 'center' }, 2: { cellWidth: 30, halign: 'center' } },
    margin: { left: 15, right: 15 }
  });

  // Overall Summary Box
  yPos = (doc as any).lastAutoTable.finalY + 8;
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(15, yPos, 180, 25, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont(THAI_FONT, 'normal');
  doc.text('สรุปผลรวม', 105, yPos + 8, { align: 'center' });
  doc.setFontSize(16);
  doc.text(`ค่าเฉลี่ยรวม: ${stats.overall.mean.toFixed(2)} | S.D.: ${stats.overall.sd.toFixed(2)} | ระดับ: ${stats.overall.level}`, 105, yPos + 18, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Suggestions
  if (response.suggestions && response.suggestions.trim()) {
    yPos = yPos + 33;
    yPos = addSectionTitle(doc, 'ตอนที่ 4: ข้อเสนอแนะเพิ่มเติม', yPos);
    doc.setFontSize(11);
    doc.setFont(THAI_FONT, 'normal');
    const splitText = doc.splitTextToSize(response.suggestions, 170);
    doc.text(splitText, 20, yPos + 8);
  }

  addFooter(doc, 1, 1);
  doc.save(`รายงานแบบสอบถาม-${response.id.substring(0, 8)}.pdf`);
};

export const generateSummaryPDF = async (responses: SurveyResponse[]): Promise<void> => {
  const doc = new jsPDF();
  
  // Load Thai font
  await setupThaiFont(doc);
  
  const stats = calculateCategoryStats(responses);
  const total = responses.length;
  let pageNum = 1;

  // Page 1 - Header and Demographics
  addHeader(doc, 
    'รายงานสรุปผลแบบสอบถาม',
    'การศึกษาพฤติกรรมการเลือกซื้อเครื่องดื่มผสมน้ำตาลในสหกรณ์โรงเรียน'
  );
  
  // Info box
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(15, 40, 180, 15, 3, 3, 'F');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.setFont(THAI_FONT, 'normal');
  doc.text(`จำนวนผู้ตอบทั้งหมด: ${total} คน`, 20, 48);
  doc.text(`วันที่สร้างรายงาน: ${new Date().toLocaleDateString('th-TH', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 120, 48);

  // Demographics
  let yPos = addSectionTitle(doc, 'ตอนที่ 1: ข้อมูลทั่วไปของผู้ตอบแบบสอบถาม', 65);

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
  const bmiCounts = {
    underweight: responses.filter(r => r.bmi === 'underweight').length,
    normal: responses.filter(r => r.bmi === 'normal').length,
    overweight: responses.filter(r => r.bmi === 'overweight').length,
    obese: responses.filter(r => r.bmi === 'obese').length
  };

  autoTable(doc, {
    startY: yPos + 2,
    head: [['ข้อมูลทั่วไป', 'รายการ', 'จำนวน (n)', 'ร้อยละ (%)']],
    body: [
      ['เพศ', 'ชาย', genderCounts.male, ((genderCounts.male/total)*100).toFixed(1)],
      ['', 'หญิง', genderCounts.female, ((genderCounts.female/total)*100).toFixed(1)],
      ['อายุ', '12-15 ปี', ageCounts['12-15'], ((ageCounts['12-15']/total)*100).toFixed(1)],
      ['', '16-18 ปี', ageCounts['16-18'], ((ageCounts['16-18']/total)*100).toFixed(1)],
      ['ระดับชั้น', 'มัธยมศึกษาตอนต้น', eduCounts.junior, ((eduCounts.junior/total)*100).toFixed(1)],
      ['', 'มัธยมศึกษาตอนปลาย', eduCounts.senior, ((eduCounts.senior/total)*100).toFixed(1)],
      ['ดัชนีมวลกาย', 'ผอมกว่าเกณฑ์', bmiCounts.underweight, ((bmiCounts.underweight/total)*100).toFixed(1)],
      ['', 'สมส่วน', bmiCounts.normal, ((bmiCounts.normal/total)*100).toFixed(1)],
      ['', 'ท้วม/เริ่มอ้วน', bmiCounts.overweight, ((bmiCounts.overweight/total)*100).toFixed(1)],
      ['', 'อ้วน', bmiCounts.obese, ((bmiCounts.obese/total)*100).toFixed(1)],
      ['รวม', '', total, '100.0'],
    ],
    theme: 'grid',
    headStyles: { fillColor: COLORS.primary, fontSize: 11, font: THAI_FONT, halign: 'center' },
    bodyStyles: { fontSize: 11, font: THAI_FONT },
    columnStyles: { 
      0: { cellWidth: 40 }, 
      1: { cellWidth: 70 }, 
      2: { cellWidth: 35, halign: 'center' }, 
      3: { cellWidth: 35, halign: 'center' } 
    },
    margin: { left: 15, right: 15 }
  });

  // Purchase Frequency
  yPos = (doc as any).lastAutoTable.finalY + 8;
  yPos = addSectionTitle(doc, 'ตอนที่ 2: พฤติกรรมการเลือกซื้อเครื่องดื่มผสมน้ำตาล', yPos);

  const freqCounts = {
    daily: responses.filter(r => r.purchaseFrequency === 'daily').length,
    '3-4times': responses.filter(r => r.purchaseFrequency === '3-4times').length,
    '1-2times': responses.filter(r => r.purchaseFrequency === '1-2times').length,
    rarely: responses.filter(r => r.purchaseFrequency === 'rarely').length
  };

  autoTable(doc, {
    startY: yPos + 2,
    head: [['ความถี่ในการซื้อเครื่องดื่ม', 'จำนวน (n)', 'ร้อยละ (%)']],
    body: [
      ['ทุกวัน', freqCounts.daily, ((freqCounts.daily/total)*100).toFixed(1)],
      ['3-4 ครั้งต่อสัปดาห์', freqCounts['3-4times'], ((freqCounts['3-4times']/total)*100).toFixed(1)],
      ['1-2 ครั้งต่อสัปดาห์', freqCounts['1-2times'], ((freqCounts['1-2times']/total)*100).toFixed(1)],
      ['นานๆ ครั้ง', freqCounts.rarely, ((freqCounts.rarely/total)*100).toFixed(1)],
      ['รวม', total, '100.0'],
    ],
    theme: 'grid',
    headStyles: { fillColor: COLORS.primary, fontSize: 11, font: THAI_FONT, halign: 'center' },
    bodyStyles: { fontSize: 11, font: THAI_FONT },
    columnStyles: { 
      0: { cellWidth: 110 }, 
      1: { cellWidth: 35, halign: 'center' }, 
      2: { cellWidth: 35, halign: 'center' } 
    },
    margin: { left: 15, right: 15 }
  });

  addFooter(doc, pageNum, 2);

  // Page 2 - Health Risk Statistics
  doc.addPage();
  pageNum++;
  
  // Reload font for new page
  doc.setFont(THAI_FONT, 'normal');
  
  addHeader(doc, 
    'รายงานสรุปผลแบบสอบถาม (ต่อ)',
    'ตอนที่ 3: ความเสี่ยงต่อสุขภาพจากการบริโภคน้ำตาลสูง'
  );

  // Helper function
  const calcItemStats = (field: keyof SurveyResponse) => {
    const values = responses.map(r => r[field] as number);
    const mean = calculateMean(values);
    const sd = calculateSD(values);
    return { n: values.length, mean, sd, level: getLevelFromMean(mean) };
  };

  // Knowledge
  yPos = 45;
  yPos = addSectionTitle(doc, '1. ด้านความรู้ความเข้าใจ', yPos, COLORS.knowledge);
  
  const k1 = calcItemStats('knowledge1');
  const k2 = calcItemStats('knowledge2');
  const k3 = calcItemStats('knowledge3');

  autoTable(doc, {
    startY: yPos + 2,
    head: [['ข้อคำถาม', 'n', 'x̄', 'S.D.', 'ระดับ']],
    body: [
      ['1.1 ท่านทราบว่าร่างกายไม่ควรได้รับน้ำตาลเกิน 6 ช้อนชาต่อวัน', k1.n, k1.mean.toFixed(2), k1.sd.toFixed(2), k1.level],
      ['1.2 ท่านทราบว่าเครื่องดื่ม 1 แก้ว/ขวด มีน้ำตาลเกินปริมาณที่แนะนำ', k2.n, k2.mean.toFixed(2), k2.sd.toFixed(2), k2.level],
      ['1.3 ท่านอ่านฉลากโภชนาการก่อนตัดสินใจซื้อ', k3.n, k3.mean.toFixed(2), k3.sd.toFixed(2), k3.level],
      ['รวมด้านความรู้ความเข้าใจ', total, stats.knowledge.mean.toFixed(2), stats.knowledge.sd.toFixed(2), stats.knowledge.level],
    ],
    theme: 'grid',
    headStyles: { fillColor: COLORS.knowledge, fontSize: 10, font: THAI_FONT, halign: 'center' },
    bodyStyles: { fontSize: 10, font: THAI_FONT },
    columnStyles: { 
      0: { cellWidth: 100 }, 
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' }
    },
    margin: { left: 15, right: 15 }
  });

  // Awareness
  yPos = (doc as any).lastAutoTable.finalY + 6;
  yPos = addSectionTitle(doc, '2. ด้านความตระหนักต่อสุขภาพ', yPos, COLORS.awareness);
  
  const a1 = calcItemStats('awareness1');
  const a2 = calcItemStats('awareness2');
  const a3 = calcItemStats('awareness3');
  const a4 = calcItemStats('awareness4');

  autoTable(doc, {
    startY: yPos + 2,
    head: [['ข้อคำถาม', 'n', 'x̄', 'S.D.', 'ระดับ']],
    body: [
      ['2.1 ท่านคิดว่าพฤติกรรมการดื่มของท่านเสี่ยงต่อโรคเบาหวาน', a1.n, a1.mean.toFixed(2), a1.sd.toFixed(2), a1.level],
      ['2.2 ท่านเคยมีอาการอ่อนเพลีย หงุดหงิด เมื่อไม่ได้ดื่มน้ำหวาน', a2.n, a2.mean.toFixed(2), a2.sd.toFixed(2), a2.level],
      ['2.3 ท่านคิดว่าน้ำหนักตัวเพิ่มขึ้นจากการดื่มเครื่องดื่มรสหวาน', a3.n, a3.mean.toFixed(2), a3.sd.toFixed(2), a3.level],
      ['2.4 ท่านกังวลเรื่องฟันผุจากการดื่มเครื่องดื่มที่มีน้ำตาล', a4.n, a4.mean.toFixed(2), a4.sd.toFixed(2), a4.level],
      ['รวมด้านความตระหนักต่อสุขภาพ', total, stats.awareness.mean.toFixed(2), stats.awareness.sd.toFixed(2), stats.awareness.level],
    ],
    theme: 'grid',
    headStyles: { fillColor: COLORS.awareness, fontSize: 10, font: THAI_FONT, halign: 'center' },
    bodyStyles: { fontSize: 10, font: THAI_FONT },
    columnStyles: { 
      0: { cellWidth: 100 }, 
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' }
    },
    margin: { left: 15, right: 15 }
  });

  // Intention
  yPos = (doc as any).lastAutoTable.finalY + 6;
  yPos = addSectionTitle(doc, '3. ด้านความตั้งใจและการปรับเปลี่ยนพฤติกรรม', yPos, COLORS.intention);
  
  const i1 = calcItemStats('intention1');
  const i2 = calcItemStats('intention2');
  const i3 = calcItemStats('intention3');
  const i4 = calcItemStats('intention4');

  autoTable(doc, {
    startY: yPos + 2,
    head: [['ข้อคำถาม', 'n', 'x̄', 'S.D.', 'ระดับ']],
    body: [
      ['3.1 ท่านมีความตั้งใจที่จะลดปริมาณการดื่มเครื่องดื่มรสหวาน', i1.n, i1.mean.toFixed(2), i1.sd.toFixed(2), i1.level],
      ['3.2 ท่านเชื่อว่าสามารถควบคุมความอยากดื่มน้ำหวานได้', i2.n, i2.mean.toFixed(2), i2.sd.toFixed(2), i2.level],
      ['3.3 ท่านยินดีเลือกดื่มน้ำเปล่าหรือเครื่องดื่มไม่ใส่น้ำตาลแทน', i3.n, i3.mean.toFixed(2), i3.sd.toFixed(2), i3.level],
      ['3.4 ท่านพร้อมที่จะแนะนำเพื่อนหรือคนรอบข้างให้ลดการบริโภคน้ำตาล', i4.n, i4.mean.toFixed(2), i4.sd.toFixed(2), i4.level],
      ['รวมด้านความตั้งใจและการปรับเปลี่ยนพฤติกรรม', total, stats.intention.mean.toFixed(2), stats.intention.sd.toFixed(2), stats.intention.level],
    ],
    theme: 'grid',
    headStyles: { fillColor: COLORS.intention, fontSize: 10, font: THAI_FONT, halign: 'center' },
    bodyStyles: { fontSize: 10, font: THAI_FONT },
    columnStyles: { 
      0: { cellWidth: 100 }, 
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' }
    },
    margin: { left: 15, right: 15 }
  });

  // Overall Summary
  yPos = (doc as any).lastAutoTable.finalY + 8;
  yPos = addSectionTitle(doc, 'สรุปผลรวมทุกด้าน', yPos);

  autoTable(doc, {
    startY: yPos + 2,
    head: [['ด้าน', 'จำนวนข้อ', 'n', 'x̄', 'S.D.', 'ระดับ']],
    body: [
      ['ด้านความรู้ความเข้าใจ', 3, total * 3, stats.knowledge.mean.toFixed(2), stats.knowledge.sd.toFixed(2), stats.knowledge.level],
      ['ด้านความตระหนักต่อสุขภาพ', 4, total * 4, stats.awareness.mean.toFixed(2), stats.awareness.sd.toFixed(2), stats.awareness.level],
      ['ด้านความตั้งใจและการปรับเปลี่ยนพฤติกรรม', 4, total * 4, stats.intention.mean.toFixed(2), stats.intention.sd.toFixed(2), stats.intention.level],
      ['รวมทั้งหมด', 11, total * 11, stats.overall.mean.toFixed(2), stats.overall.sd.toFixed(2), stats.overall.level],
    ],
    theme: 'grid',
    headStyles: { fillColor: COLORS.primary, fontSize: 11, font: THAI_FONT, halign: 'center' },
    bodyStyles: { fontSize: 11, font: THAI_FONT },
    columnStyles: { 
      0: { cellWidth: 80 }, 
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 25, halign: 'center' }
    },
    margin: { left: 15, right: 15 }
  });

  // Interpretation Guide
  yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(15, yPos, 180, 35, 3, 3, 'F');
  doc.setFontSize(12);
  doc.setFont(THAI_FONT, 'normal');
  doc.setTextColor(...COLORS.dark);
  doc.text('เกณฑ์การแปลผลค่าเฉลี่ย', 20, yPos + 8);
  doc.setFontSize(11);
  doc.text('ค่าเฉลี่ย 4.51 - 5.00 = มากที่สุด', 25, yPos + 16);
  doc.text('ค่าเฉลี่ย 3.51 - 4.50 = มาก', 25, yPos + 22);
  doc.text('ค่าเฉลี่ย 2.51 - 3.50 = ปานกลาง', 25, yPos + 28);
  doc.text('ค่าเฉลี่ย 1.51 - 2.50 = น้อย', 110, yPos + 16);
  doc.text('ค่าเฉลี่ย 1.00 - 1.50 = น้อยที่สุด', 110, yPos + 22);

  addFooter(doc, pageNum, 2);

  doc.save(`รายงานสรุปแบบสอบถาม-${new Date().toISOString().split('T')[0]}.pdf`);
};
