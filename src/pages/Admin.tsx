import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResponses, clearResponses } from '@/lib/storage';
import { calculateCategoryStats, countByField, calculatePercentage, calculateMean, calculateSD } from '@/lib/statistics';
import { generateIndividualPDF, generateSummaryPDF } from '@/lib/pdfGenerator';
import { SurveyResponse, getLevel, LEVEL_LABELS } from '@/types/survey';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Download, Trash2, Users, BarChart3, 
  FileText, PieChart, Brain, Heart, Target, Calculator
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

const StatCard = ({ 
  title, 
  mean, 
  sd, 
  level, 
  icon: Icon,
  color 
}: { 
  title: string; 
  mean: number; 
  sd: number; 
  level: string;
  icon: React.ElementType;
  color: string;
}) => (
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

const ItemStatsRow = ({ 
  label, 
  values, 
  colorClass 
}: { 
  label: string; 
  values: number[];
  colorClass?: string;
}) => {
  const mean = calculateMean(values);
  const sd = calculateSD(values);
  const level = LEVEL_LABELS[getLevel(mean)];
  
  return (
    <TableRow className={colorClass}>
      <TableCell className="font-medium">{label}</TableCell>
      <TableCell className="text-center">{values.length}</TableCell>
      <TableCell className="text-center font-semibold">{mean.toFixed(2)}</TableCell>
      <TableCell className="text-center">{sd.toFixed(2)}</TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" className="text-xs">{level}</Badge>
      </TableCell>
    </TableRow>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const [responses, setResponses] = useState<SurveyResponse[]>(getResponses());
  const stats = calculateCategoryStats(responses);
  const total = responses.length;

  const handleClearData = () => {
    clearResponses();
    setResponses([]);
    toast.success('ลบข้อมูลทั้งหมดแล้ว');
  };

  const handleDownloadAll = () => {
    if (responses.length === 0) {
      toast.error('ไม่มีข้อมูลสำหรับสร้าง PDF');
      return;
    }
    try {
      generateSummaryPDF(responses);
      toast.success('ดาวน์โหลด PDF สำเร็จ');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้าง PDF');
    }
  };

  const handleDownloadIndividual = (response: SurveyResponse) => {
    try {
      generateIndividualPDF(response);
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

  // Helper to get values for specific field
  const getFieldValues = (field: keyof SurveyResponse): number[] => {
    return responses.map(r => r[field] as number);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-primary-foreground py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
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

      <main className="max-w-6xl mx-auto p-4 space-y-6">
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

        {/* Detailed Item Statistics */}
        {total > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                สถิติรายข้อ - ตอนที่ 3 ความเสี่ยงต่อสุขภาพ
              </CardTitle>
              <CardDescription>
                คำนวณค่าเฉลี่ย (x̄), ส่วนเบี่ยงเบนมาตรฐาน (S.D.) และระดับความคิดเห็นรายข้อ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">รายการ</TableHead>
                      <TableHead className="text-center">n</TableHead>
                      <TableHead className="text-center">x̄</TableHead>
                      <TableHead className="text-center">S.D.</TableHead>
                      <TableHead className="text-center">ระดับ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Knowledge Section */}
                    <TableRow className="bg-blue-50 dark:bg-blue-950">
                      <TableCell colSpan={5} className="font-bold text-blue-700 dark:text-blue-300">
                        1. ด้านความรู้ความเข้าใจ
                      </TableCell>
                    </TableRow>
                    <ItemStatsRow 
                      label="1.1 ทราบว่าไม่ควรได้รับน้ำตาลเกิน 6 ช้อนชา/วัน" 
                      values={getFieldValues('knowledge1')} 
                    />
                    <ItemStatsRow 
                      label="1.2 ทราบว่าเครื่องดื่มมีน้ำตาลเกินปริมาณที่แนะนำ" 
                      values={getFieldValues('knowledge2')} 
                    />
                    <ItemStatsRow 
                      label="1.3 อ่านฉลากโภชนาการก่อนซื้อ" 
                      values={getFieldValues('knowledge3')} 
                    />
                    <TableRow className="bg-blue-100 dark:bg-blue-900 font-semibold">
                      <TableCell className="font-bold">รวมด้านความรู้</TableCell>
                      <TableCell className="text-center">{total * 3}</TableCell>
                      <TableCell className="text-center font-bold">{stats.knowledge.mean.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{stats.knowledge.sd.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={getLevelColor(stats.knowledge.level)}>{stats.knowledge.level}</Badge>
                      </TableCell>
                    </TableRow>

                    {/* Awareness Section */}
                    <TableRow className="bg-red-50 dark:bg-red-950">
                      <TableCell colSpan={5} className="font-bold text-red-700 dark:text-red-300">
                        2. ด้านความตระหนักต่อสุขภาพ
                      </TableCell>
                    </TableRow>
                    <ItemStatsRow 
                      label="2.1 คิดว่าเสี่ยงต่อโรคเบาหวาน" 
                      values={getFieldValues('awareness1')} 
                    />
                    <ItemStatsRow 
                      label="2.2 เคยมีอาการอ่อนเพลียเมื่อไม่ได้ดื่มน้ำหวาน" 
                      values={getFieldValues('awareness2')} 
                    />
                    <ItemStatsRow 
                      label="2.3 คิดว่าน้ำหนักเพิ่มจากเครื่องดื่มหวาน" 
                      values={getFieldValues('awareness3')} 
                    />
                    <ItemStatsRow 
                      label="2.4 กังวลเรื่องฟันผุ" 
                      values={getFieldValues('awareness4')} 
                    />
                    <TableRow className="bg-red-100 dark:bg-red-900 font-semibold">
                      <TableCell className="font-bold">รวมด้านความตระหนัก</TableCell>
                      <TableCell className="text-center">{total * 4}</TableCell>
                      <TableCell className="text-center font-bold">{stats.awareness.mean.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{stats.awareness.sd.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={getLevelColor(stats.awareness.level)}>{stats.awareness.level}</Badge>
                      </TableCell>
                    </TableRow>

                    {/* Intention Section */}
                    <TableRow className="bg-green-50 dark:bg-green-950">
                      <TableCell colSpan={5} className="font-bold text-green-700 dark:text-green-300">
                        3. ด้านความตั้งใจและการปรับเปลี่ยนพฤติกรรม
                      </TableCell>
                    </TableRow>
                    <ItemStatsRow 
                      label="3.1 ตั้งใจจะลดปริมาณเครื่องดื่มหวาน" 
                      values={getFieldValues('intention1')} 
                    />
                    <ItemStatsRow 
                      label="3.2 เชื่อว่าควบคุมความอยากได้" 
                      values={getFieldValues('intention2')} 
                    />
                    <ItemStatsRow 
                      label="3.3 ยินดีเลือกน้ำเปล่าแทน" 
                      values={getFieldValues('intention3')} 
                    />
                    <ItemStatsRow 
                      label="3.4 พร้อมแนะนำคนอื่นให้ลดน้ำตาล" 
                      values={getFieldValues('intention4')} 
                    />
                    <TableRow className="bg-green-100 dark:bg-green-900 font-semibold">
                      <TableCell className="font-bold">รวมด้านความตั้งใจ</TableCell>
                      <TableCell className="text-center">{total * 4}</TableCell>
                      <TableCell className="text-center font-bold">{stats.intention.mean.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{stats.intention.sd.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={getLevelColor(stats.intention.level)}>{stats.intention.level}</Badge>
                      </TableCell>
                    </TableRow>

                    {/* Overall */}
                    <TableRow className="bg-primary/10 font-bold">
                      <TableCell className="font-bold text-lg">รวมทั้งหมด</TableCell>
                      <TableCell className="text-center text-lg">{total * 11}</TableCell>
                      <TableCell className="text-center text-lg font-bold">{stats.overall.mean.toFixed(2)}</TableCell>
                      <TableCell className="text-center text-lg">{stats.overall.sd.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${getLevelColor(stats.overall.level)} text-sm`}>{stats.overall.level}</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Level Interpretation */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">เกณฑ์การแปลผลค่าเฉลี่ย</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
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

        {/* Demographics */}
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
                      <Badge variant="outline" className="text-sm">
                        ชาย: {countByField(responses, 'gender', 'male')} ({calculatePercentage(countByField(responses, 'gender', 'male'), total).toFixed(1)}%)
                      </Badge>
                      <Badge variant="outline" className="text-sm">
                        หญิง: {countByField(responses, 'gender', 'female')} ({calculatePercentage(countByField(responses, 'gender', 'female'), total).toFixed(1)}%)
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">ระดับชั้น</p>
                    <div className="flex gap-4 flex-wrap">
                      <Badge variant="outline" className="text-sm">
                        ม.ต้น: {countByField(responses, 'educationLevel', 'junior')} ({calculatePercentage(countByField(responses, 'educationLevel', 'junior'), total).toFixed(1)}%)
                      </Badge>
                      <Badge variant="outline" className="text-sm">
                        ม.ปลาย: {countByField(responses, 'educationLevel', 'senior')} ({calculatePercentage(countByField(responses, 'educationLevel', 'senior'), total).toFixed(1)}%)
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">อายุ</p>
                    <div className="flex gap-4 flex-wrap">
                      <Badge variant="outline" className="text-sm">
                        12-15 ปี: {countByField(responses, 'ageGroup', '12-15')} ({calculatePercentage(countByField(responses, 'ageGroup', '12-15'), total).toFixed(1)}%)
                      </Badge>
                      <Badge variant="outline" className="text-sm">
                        16-18 ปี: {countByField(responses, 'ageGroup', '16-18')} ({calculatePercentage(countByField(responses, 'ageGroup', '16-18'), total).toFixed(1)}%)
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  ความถี่การซื้อ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { key: 'daily', label: 'ทุกวัน' },
                    { key: '3-4times', label: '3-4 ครั้ง/สัปดาห์' },
                    { key: '1-2times', label: '1-2 ครั้ง/สัปดาห์' },
                    { key: 'rarely', label: 'นานๆ ครั้ง' }
                  ].map(item => {
                    const count = countByField(responses, 'purchaseFrequency', item.key as any);
                    const percent = calculatePercentage(count, total);
                    return (
                      <div key={item.key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.label}</span>
                          <span className="font-medium">{count} ({percent.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full gradient-primary transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Responses Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              รายการแบบสอบถาม
            </CardTitle>
            <CardDescription>
              ข้อมูลแบบสอบถามทั้งหมด {total} รายการ
            </CardDescription>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>ยังไม่มีข้อมูลแบบสอบถาม</p>
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
                      <TableHead className="text-right">PDF</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {responses.map((response, index) => {
                      const individualStats = calculateCategoryStats([response]);
                      return (
                        <TableRow key={response.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{response.createdAt.toLocaleDateString('th-TH')}</TableCell>
                          <TableCell>{response.gender === 'male' ? 'ชาย' : 'หญิง'}</TableCell>
                          <TableCell>{response.educationLevel === 'junior' ? 'ม.ต้น' : 'ม.ปลาย'}</TableCell>
                          <TableCell className="text-center">{individualStats.knowledge.mean.toFixed(2)}</TableCell>
                          <TableCell className="text-center">{individualStats.awareness.mean.toFixed(2)}</TableCell>
                          <TableCell className="text-center">{individualStats.intention.mean.toFixed(2)}</TableCell>
                          <TableCell className="text-center font-bold">{individualStats.overall.mean.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={getLevelColor(individualStats.overall.level)}>
                              {individualStats.overall.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownloadIndividual(response)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
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
    </div>
  );
};

export default Admin;
