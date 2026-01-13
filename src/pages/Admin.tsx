import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResponses, clearResponses } from '@/lib/storage';
import { calculateCategoryStats, calculateMean, calculateSD, calculatePercentage } from '@/lib/statistics';
import { generateIndividualPDF, generateSummaryPDF } from '@/lib/pdfGenerator';
import { SurveyResponse, getLevel, LEVEL_LABELS } from '@/types/survey';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Download, Trash2, Users, BarChart3, 
  FileText, PieChart, Brain, Heart, Target, Calculator, Loader2, Eye, Lock, Delete
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- Helpers & Config ---
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

const QUESTIONS = {
  knowledge1: '1.1 ทราบว่าไม่ควรได้รับน้ำตาลเกิน 6 ช้อนชา/วัน',
  knowledge2: '1.2 ทราบว่าเครื่องดื่มมีน้ำตาลเกินปริมาณที่แนะนำ',
  knowledge3: '1.3 อ่านฉลากโภชนาการก่อนซื้อ',
  awareness1: '2.1 คิดว่าพฤติกรรมเสี่ยงต่อโรคเบาหวาน',
  awareness2: '2.2 เคยมีอาการอ่อนเพลียเมื่อไม่ได้ดื่มน้ำหวาน',
  awareness3: '2.3 คิดว่าน้ำหนักเพิ่มจากเครื่องดื่มหวาน',
  awareness4: '2.4 กังวลเรื่องฟันผุ',
  intention1: '3.1 ตั้งใจจะลดปริมาณเครื่องดื่มหวาน',
  intention2: '3.2 เชื่อว่าสามารถควบคุมความอยากได้',
  intention3: '3.3 ยินดีเลือกน้ำเปล่าแทน',
  intention4: '3.4 พร้อมแนะนำคนอื่นให้ลดน้ำตาล'
};

const getLabel = (category: keyof typeof LABELS, value: string) => {
  const labels = LABELS[category] as Record<string, string>;
  return labels[value] || value;
};

const getArrayLabels = (category: keyof typeof LABELS, values: string[]) => {
  if (!values || !Array.isArray(values) || values.length === 0) return '-';
  return values.map(v => getLabel(category, v)).join(', ');
};

const getLevelText = (score: number) => {
  if (score >= 4.51) return 'มากที่สุด';
  if (score >= 3.51) return 'มาก';
  if (score >= 2.51) return 'ปานกลาง';
  if (score >= 1.51) return 'น้อย';
  return 'น้อยที่สุด';
};

const formatDateSafe = (date: Date | string) => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('th-TH', { dateStyle: 'long', timeStyle: 'short' });
  } catch (e) {
    return '-';
  }
};

// --- Login Component (Bank Style) ---
const PinLogin = ({ onSuccess }: { onSuccess: () => void }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const CORRECT_PIN = '451340'; // รหัสผ่านคือ 123456 (สามารถเปลี่ยนได้ที่นี่)

  useEffect(() => {
    if (pin.length === 6) {
      // Check PIN
      if (pin === CORRECT_PIN) {
        onSuccess();
      } else {
        setError(true);
        toast.error('รหัสผ่านไม่ถูกต้อง');
        // Reset after delay
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
      }
    }
  }, [pin, onSuccess]);

  const handleNum = (num: string) => {
    if (pin.length < 6) setPin(prev => prev + num);
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">เข้าสู่ระบบผู้ดูแล</h1>
          <p className="text-slate-500">กรุณากรอกรหัสผ่าน 6 หลัก</p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-4 mb-8 h-8 items-center">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i < pin.length 
                  ? 'w-4 h-4 bg-primary' 
                  : 'w-3 h-3 bg-slate-300'
              } ${error ? 'bg-red-500 animate-pulse' : ''}`}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-6 px-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNum(num.toString())}
              className="w-20 h-20 mx-auto rounded-full border-2 border-slate-100 bg-white text-2xl font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 active:scale-95 transition-all shadow-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {num}
            </button>
          ))}
          
          <div className="w-20 h-20" /> {/* Empty Slot */}
          
          <button
            onClick={() => handleNum('0')}
            className="w-20 h-20 mx-auto rounded-full border-2 border-slate-100 bg-white text-2xl font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 active:scale-95 transition-all shadow-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            0
          </button>
          
          <button
            onClick={handleDelete}
            className="w-20 h-20 mx-auto rounded-full hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center text-slate-400 focus:outline-none"
          >
            <Delete className="w-8 h-8" />
          </button>
        </div>

        <div className="text-center pt-8">
          <Button variant="link" onClick={() => window.location.href = '/'} className="text-slate-400 hover:text-slate-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับหน้าหลัก
          </Button>
        </div>
      </div>
    </div>
  );
};

// Component: StatCard (Same as before)
const StatCard = ({ title, mean, sd, level, icon: Icon, color }: any) => (
  <Card className="glass-card">
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{mean.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground">x̄</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">S.D. {sd.toFixed(2)}</Badge>
            <Badge className={color}>{level}</Badge>
          </div>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Component: ItemStatsRow (Same as before)
const ItemStatsRow = ({ label, values, colorClass }: any) => {
  const mean = calculateMean(values);
  const sd = calculateSD(values);
  const level = LEVEL_LABELS[getLevel(mean)];
  const total = values.length;

  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  values.forEach((v: number) => {
    if (v >= 1 && v <= 5) counts[v as 1|2|3|4|5]++;
  });

  const renderDist = (score: number) => {
    const n = counts[score as keyof typeof counts];
    const pct = total > 0 ? ((n / total) * 100).toFixed(1) : '0.0';
    return (
      <div className="flex flex-col items-center justify-center">
        <span className="font-bold text-sm">{n}</span>
        <span className="text-[10px] text-muted-foreground">({pct}%)</span>
      </div>
    );
  };
  
  return (
    <TableRow className={colorClass}>
      <TableCell className="font-medium min-w-[250px]">{label}</TableCell>
      {[1, 2, 3, 4, 5].map(score => (
        <TableCell key={score} className="text-center p-2 border-l border-border/50">
            {renderDist(score)}
        </TableCell>
      ))}
      <TableCell className="text-center font-semibold text-base border-l border-border">{mean.toFixed(2)}</TableCell>
      <TableCell className="text-center">{sd.toFixed(2)}</TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" className="text-xs whitespace-nowrap">{level}</Badge>
      </TableCell>
    </TableRow>
  );
};

const countByFieldSafe = <T extends keyof SurveyResponse>(
  responses: SurveyResponse[],
  field: T,
  value: SurveyResponse[T]
): number => {
  if (!responses) return 0;
  return responses.filter(r => r[field] === value).length;
};

// --- Main Component ---
const Admin = () => {
  const navigate = useNavigate();
  // State for Login
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewResponse, setViewResponse] = useState<SurveyResponse | null>(null);

  useEffect(() => {
    // Only load data if authenticated
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        const data = await getResponses();
        setResponses(data);
      } catch (error) {
        console.error("Failed to load responses:", error);
        toast.error('ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]); // Add isAuthenticated dependency

  // If not authenticated, show Pin Login
  if (!isAuthenticated) {
    return <PinLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  const stats = calculateCategoryStats(responses);
  const total = responses.length;

  const handleClearData = async () => {
    try {
      await clearResponses();
      setResponses([]);
      toast.success('ลบข้อมูลทั้งหมดแล้ว');
    } catch (error) {
      console.error("Failed to clear responses:", error);
      toast.error('ลบข้อมูลไม่สำเร็จ');
    }
  };

  const handleDownloadAll = async () => {
    if (responses.length === 0) {
      toast.error('ไม่มีข้อมูลสำหรับสร้าง PDF');
      return;
    }
    try {
      toast.info('กำลังสร้าง PDF...');
      await generateSummaryPDF(responses);
      toast.success('ดาวน์โหลด PDF สำเร็จ');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้าง PDF');
    }
  };

  const handleDownloadIndividual = async (response: SurveyResponse) => {
    try {
      toast.info('กำลังสร้าง PDF...');
      await generateIndividualPDF(response);
      toast.success('ดาวน์โหลด PDF สำเร็จ');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้าง PDF');
    }
  };

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'มากที่สุด': return 'bg-success text-success-foreground';
      case 'มาก': return 'bg-primary text-primary-foreground';
      case 'ปานกลาง': return 'bg-accent text-accent-foreground';
      case 'น้อย': return 'bg-orange-500 text-white';
      default: return 'bg-destructive text-destructive-foreground';
    }
  };

  const getFieldValues = (field: keyof SurveyResponse): number[] => {
    return responses.map(r => r[field] as number);
  };

  if (loading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-primary-foreground py-6 px-4 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/')}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-primary-foreground/80 text-sm">
                  จัดการและวิเคราะห์ข้อมูลแบบสอบถาม
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={handleDownloadAll}
                disabled={responses.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">ดาวน์โหลดสรุป</span>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={responses.length === 0}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">ลบข้อมูล</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>ยืนยันการลบข้อมูล?</AlertDialogTitle>
                    <AlertDialogDescription>
                      การดำเนินการนี้จะลบข้อมูลแบบสอบถามทั้งหมด {responses.length} รายการ 
                      และไม่สามารถกู้คืนได้
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearData} className="bg-destructive">
                      ลบข้อมูลทั้งหมด
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full gradient-primary">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ผู้ตอบทั้งหมด</p>
                  <p className="text-3xl font-bold">{total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {total > 0 && (
            <>
              <StatCard 
                title="ด้านความรู้" 
                mean={stats.knowledge.mean} 
                sd={stats.knowledge.sd} 
                level={stats.knowledge.level}
                icon={Brain}
                color={getLevelColor(stats.knowledge.level)}
              />
              <StatCard 
                title="ด้านความตระหนัก" 
                mean={stats.awareness.mean} 
                sd={stats.awareness.sd} 
                level={stats.awareness.level}
                icon={Heart}
                color={getLevelColor(stats.awareness.level)}
              />
              <StatCard 
                title="ด้านความตั้งใจ" 
                mean={stats.intention.mean} 
                sd={stats.intention.sd} 
                level={stats.intention.level}
                icon={Target}
                color={getLevelColor(stats.intention.level)}
              />
            </>
          )}
        </div>

        {/* Detailed Item Statistics (1-5 Breakdown) */}
        {total > 0 && (
          <Card className="glass-card overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                สถิติรายข้อ - แจกแจงความถี่ระดับคะแนน
              </CardTitle>
              <CardDescription>
                แสดงจำนวนและร้อยละของผู้เลือกตอบระดับคะแนน 1-5 ในแต่ละข้อ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="border border-border">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead rowSpan={2} className="w-[300px] border-r border-border">ข้อคำถาม</TableHead>
                      <TableHead colSpan={5} className="text-center border-b border-border border-r">ระดับคะแนน (จำนวน / ร้อยละ)</TableHead>
                      <TableHead rowSpan={2} className="text-center w-[80px] border-r border-border">x̄</TableHead>
                      <TableHead rowSpan={2} className="text-center w-[80px] border-r border-border">S.D.</TableHead>
                      <TableHead rowSpan={2} className="text-center w-[100px]">ระดับ</TableHead>
                    </TableRow>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-center h-8 text-xs border-r border-border/50">1</TableHead>
                      <TableHead className="text-center h-8 text-xs border-r border-border/50">2</TableHead>
                      <TableHead className="text-center h-8 text-xs border-r border-border/50">3</TableHead>
                      <TableHead className="text-center h-8 text-xs border-r border-border/50">4</TableHead>
                      <TableHead className="text-center h-8 text-xs border-r border-border">5</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Knowledge Section */}
                    <TableRow className="bg-blue-50 dark:bg-blue-950/50">
                      <TableCell colSpan={9} className="font-bold text-blue-700 dark:text-blue-300 py-3">
                        1. ด้านความรู้ความเข้าใจ
                      </TableCell>
                    </TableRow>
                    <ItemStatsRow label={QUESTIONS.knowledge1} values={getFieldValues('knowledge1')} />
                    <ItemStatsRow label={QUESTIONS.knowledge2} values={getFieldValues('knowledge2')} />
                    <ItemStatsRow label={QUESTIONS.knowledge3} values={getFieldValues('knowledge3')} />
                    
                    {/* Awareness Section */}
                    <TableRow className="bg-red-50 dark:bg-red-950/50">
                      <TableCell colSpan={9} className="font-bold text-red-700 dark:text-red-300 py-3">
                        2. ด้านความตระหนักต่อสุขภาพ
                      </TableCell>
                    </TableRow>
                    <ItemStatsRow label={QUESTIONS.awareness1} values={getFieldValues('awareness1')} />
                    <ItemStatsRow label={QUESTIONS.awareness2} values={getFieldValues('awareness2')} />
                    <ItemStatsRow label={QUESTIONS.awareness3} values={getFieldValues('awareness3')} />
                    <ItemStatsRow label={QUESTIONS.awareness4} values={getFieldValues('awareness4')} />

                    {/* Intention Section */}
                    <TableRow className="bg-green-50 dark:bg-green-950/50">
                      <TableCell colSpan={9} className="font-bold text-green-700 dark:text-green-300 py-3">
                        3. ด้านความตั้งใจและการปรับเปลี่ยนพฤติกรรม
                      </TableCell>
                    </TableRow>
                    <ItemStatsRow label={QUESTIONS.intention1} values={getFieldValues('intention1')} />
                    <ItemStatsRow label={QUESTIONS.intention2} values={getFieldValues('intention2')} />
                    <ItemStatsRow label={QUESTIONS.intention3} values={getFieldValues('intention3')} />
                    <ItemStatsRow label={QUESTIONS.intention4} values={getFieldValues('intention4')} />
                    
                    {/* Overall */}
                    <TableRow className="bg-primary/10 font-bold border-t-2 border-primary/20">
                      <TableCell colSpan={6} className="text-right pr-4 text-lg">รวมทั้งหมดทุกด้าน:</TableCell>
                      <TableCell className="text-center text-xl font-bold">{stats.overall.mean.toFixed(2)}</TableCell>
                      <TableCell className="text-center text-lg">{stats.overall.sd.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${getLevelColor(stats.overall.level)} text-sm px-3 py-1`}>{stats.overall.level}</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Level Interpretation */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">เกณฑ์การแปลผลค่าเฉลี่ย</h4>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-success text-success-foreground">มากที่สุด</Badge>
                    <span>4.51 - 5.00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary text-primary-foreground">มาก</Badge>
                    <span>3.51 - 4.50</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-accent text-accent-foreground">ปานกลาง</Badge>
                    <span>2.51 - 3.50</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-500 text-white">น้อย</Badge>
                    <span>1.51 - 2.50</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-destructive text-destructive-foreground">น้อยที่สุด</Badge>
                    <span>1.00 - 1.50</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts & Graphs Section */}
        {total > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  สรุปข้อมูลประชากร
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">เพศ</p>
                    <div className="flex gap-4 flex-wrap">
                      <Badge variant="outline" className="text-sm py-1 px-3">
                        ชาย: {countByFieldSafe(responses, 'gender', 'male')} ({calculatePercentage(countByFieldSafe(responses, 'gender', 'male'), total).toFixed(1)}%)
                      </Badge>
                      <Badge variant="outline" className="text-sm py-1 px-3">
                        หญิง: {countByFieldSafe(responses, 'gender', 'female')} ({calculatePercentage(countByFieldSafe(responses, 'gender', 'female'), total).toFixed(1)}%)
                      </Badge>
                    </div>
                  </div>
                  {/* ... other demographics ... */}
                </div>
              </CardContent>
            </Card>
            {/* ... other chart ... */}
          </div>
        )}

        {/* Responses Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              ข้อมูลรายบุคคล (Raw Data)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>ยังไม่มีข้อมูล</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ลำดับ</TableHead>
                      <TableHead>วันที่</TableHead>
                      <TableHead>เพศ</TableHead>
                      <TableHead>ระดับชั้น</TableHead>
                      <TableHead className="text-center">ความรู้</TableHead>
                      <TableHead className="text-center">ตระหนัก</TableHead>
                      <TableHead className="text-center">ตั้งใจ</TableHead>
                      <TableHead className="text-center">รวม</TableHead>
                      <TableHead>ระดับ</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {responses.map((response, index) => {
                      // Note: Assuming you might want per-user stats visible here, 
                      // but typically calculateCategoryStats is for aggregate. 
                      // For individual rows, usually we pre-calculate or calculate on fly.
                      // Let's reuse simple calculation for display
                      const k = (response.knowledge1 + response.knowledge2 + response.knowledge3) / 3;
                      const a = (response.awareness1 + response.awareness2 + response.awareness3 + response.awareness4) / 4;
                      const i = (response.intention1 + response.intention2 + response.intention3 + response.intention4) / 4;
                      const overall = (k*3 + a*4 + i*4) / 11;
                      
                      return (
                        <TableRow key={response.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{formatDateSafe(response.createdAt)}</TableCell>
                          <TableCell>{response.gender === 'male' ? 'ชาย' : 'หญิง'}</TableCell>
                          <TableCell>{response.educationLevel === 'junior' ? 'ม.ต้น' : 'ม.ปลาย'}</TableCell>
                          <TableCell className="text-center">{k.toFixed(2)}</TableCell>
                          <TableCell className="text-center">{a.toFixed(2)}</TableCell>
                          <TableCell className="text-center">{i.toFixed(2)}</TableCell>
                          <TableCell className="text-center font-bold">{overall.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={getLevelColor(LEVEL_LABELS[getLevel(overall)])}>
                              {LEVEL_LABELS[getLevel(overall)]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setViewResponse(response)}
                                title="ดูรายละเอียด"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDownloadIndividual(response)}
                                title="ดาวน์โหลด PDF"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* View Details Dialog (Safe Render) */}
      <Dialog open={!!viewResponse} onOpenChange={(open) => !open && setViewResponse(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          {viewResponse && (
            <>
              <DialogHeader>
                <DialogTitle>รายละเอียดแบบสอบถาม</DialogTitle>
                <DialogDescription>
                  รหัส: {viewResponse.id ? viewResponse.id.substring(0, 8).toUpperCase() : '-'} | 
                  วันที่: {formatDateSafe(viewResponse.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[70vh] pr-4">
                <div className="space-y-6">
                  {/* Part 1 */}
                  <div>
                    <h3 className="text-sm font-bold text-primary mb-2 bg-primary/10 p-2 rounded">ส่วนที่ 1: ข้อมูลทั่วไป</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-muted-foreground">เพศ:</span> {getLabel('gender', viewResponse.gender)}</div>
                      <div><span className="text-muted-foreground">อายุ:</span> {getLabel('ageGroup', viewResponse.ageGroup)}</div>
                      <div><span className="text-muted-foreground">ระดับชั้น:</span> {getLabel('educationLevel', viewResponse.educationLevel)}</div>
                      <div><span className="text-muted-foreground">BMI:</span> {getLabel('bmi', viewResponse.bmi)}</div>
                      <div className="col-span-2"><span className="text-muted-foreground">เงินค่าขนม:</span> {getLabel('dailyAllowance', viewResponse.dailyAllowance)}</div>
                    </div>
                  </div>

                  {/* Part 2 */}
                  <div>
                    <h3 className="text-sm font-bold text-primary mb-2 bg-primary/10 p-2 rounded">ส่วนที่ 2: พฤติกรรม</h3>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div><span className="text-muted-foreground">ความถี่ในการซื้อ:</span> {getLabel('purchaseFrequency', viewResponse.purchaseFrequency)}</div>
                      <div><span className="text-muted-foreground">ช่วงเวลา:</span> {getArrayLabels('purchaseTime', viewResponse.purchaseTime)}</div>
                      <div><span className="text-muted-foreground">ประเภทเครื่องดื่ม:</span> {getArrayLabels('drinkTypes', viewResponse.drinkTypes)}</div>
                      <div><span className="text-muted-foreground">ความหวาน:</span> {getLabel('sugarLevel', viewResponse.sugarLevel)}</div>
                      <div><span className="text-muted-foreground">เหตุผล:</span> {getLabel('purchaseReason', viewResponse.purchaseReason)}</div>
                      <div><span className="text-muted-foreground">ปัจจัยแวดล้อม:</span> {getArrayLabels('purchaseFactors', viewResponse.purchaseFactors)}</div>
                      <div><span className="text-muted-foreground">ค่าใช้จ่าย:</span> {getLabel('dailyExpense', viewResponse.dailyExpense)}</div>
                    </div>
                  </div>

                  {/* Part 3 */}
                  <div>
                    <h3 className="text-sm font-bold text-primary mb-2 bg-primary/10 p-2 rounded">ส่วนที่ 3: คะแนนความเสี่ยง</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>หัวข้อ</TableHead>
                          <TableHead className="text-center w-16">คะแนน</TableHead>
                          <TableHead className="text-center w-24">ระดับ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="bg-muted/50"><TableCell colSpan={3} className="font-semibold text-xs text-blue-600">ความรู้ความเข้าใจ</TableCell></TableRow>
                        <TableRow><TableCell>{QUESTIONS.knowledge1}</TableCell><TableCell className="text-center">{viewResponse.knowledge1}</TableCell><TableCell className="text-center text-xs">{getLevelText(viewResponse.knowledge1)}</TableCell></TableRow>
                        <TableRow><TableCell>{QUESTIONS.knowledge2}</TableCell><TableCell className="text-center">{viewResponse.knowledge2}</TableCell><TableCell className="text-center text-xs">{getLevelText(viewResponse.knowledge2)}</TableCell></TableRow>
                        <TableRow><TableCell>{QUESTIONS.knowledge3}</TableCell><TableCell className="text-center">{viewResponse.knowledge3}</TableCell><TableCell className="text-center text-xs">{getLevelText(viewResponse.knowledge3)}</TableCell></TableRow>

                        <TableRow className="bg-muted/50"><TableCell colSpan={3} className="font-semibold text-xs text-red-600">ความตระหนัก</TableCell></TableRow>
                        <TableRow><TableCell>{QUESTIONS.awareness1}</TableCell><TableCell className="text-center">{viewResponse.awareness1}</TableCell><TableCell className="text-center text-xs">{getLevelText(viewResponse.awareness1)}</TableCell></TableRow>
                        <TableRow><TableCell>{QUESTIONS.awareness2}</TableCell><TableCell className="text-center">{viewResponse.awareness2}</TableCell><TableCell className="text-center text-xs">{getLevelText(viewResponse.awareness2)}</TableCell></TableRow>
                        <TableRow><TableCell>{QUESTIONS.awareness3}</TableCell><TableCell className="text-center">{viewResponse.awareness3}</TableCell><TableCell className="text-center text-xs">{getLevelText(viewResponse.awareness3)}</TableCell></TableRow>
                        <TableRow><TableCell>{QUESTIONS.awareness4}</TableCell><TableCell className="text-center">{viewResponse.awareness4}</TableCell><TableCell className="text-center text-xs">{getLevelText(viewResponse.awareness4)}</TableCell></TableRow>

                        <TableRow className="bg-muted/50"><TableCell colSpan={3} className="font-semibold text-xs text-green-600">ความตั้งใจ</TableCell></TableRow>
                        <TableRow><TableCell>{QUESTIONS.intention1}</TableCell><TableCell className="text-center">{viewResponse.intention1}</TableCell><TableCell className="text-center text-xs">{getLevelText(viewResponse.intention1)}</TableCell></TableRow>
                        <TableRow><TableCell>{QUESTIONS.intention2}</TableCell><TableCell className="text-center">{viewResponse.intention2}</TableCell><TableCell className="text-center text-xs">{getLevelText(viewResponse.intention2)}</TableCell></TableRow>
                        <TableRow><TableCell>{QUESTIONS.intention3}</TableCell><TableCell className="text-center">{viewResponse.intention3}</TableCell><TableCell className="text-center text-xs">{getLevelText(viewResponse.intention3)}</TableCell></TableRow>
                        <TableRow><TableCell>{QUESTIONS.intention4}</TableCell><TableCell className="text-center">{viewResponse.intention4}</TableCell><TableCell className="text-center text-xs">{getLevelText(viewResponse.intention4)}</TableCell></TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Part 4 */}
                  <div>
                    <h3 className="text-sm font-bold text-primary mb-2 bg-primary/10 p-2 rounded">ส่วนที่ 4: ข้อเสนอแนะ</h3>
                    <div className="p-3 bg-muted rounded-md text-sm min-h-[60px]">
                      {viewResponse.suggestions || "- ไม่มีข้อเสนอแนะ -"}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;