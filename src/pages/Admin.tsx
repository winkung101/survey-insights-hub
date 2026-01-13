import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResponses, clearResponses } from '@/lib/storage';
import { calculateCategoryStats, countByField, calculatePercentage } from '@/lib/statistics';
import { generateIndividualPDF, generateSummaryPDF } from '@/lib/pdfGenerator';
import { SurveyResponse } from '@/types/survey';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Download, Trash2, Users, BarChart3, 
  FileText, PieChart, Brain, Heart, Target 
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
          <div className="flex gap-2">
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
    generateSummaryPDF(responses);
    toast.success('ดาวน์โหลด PDF สำเร็จ');
  };

  const handleDownloadIndividual = (response: SurveyResponse) => {
    generateIndividualPDF(response);
    toast.success('ดาวน์โหลด PDF สำเร็จ');
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
                    <div className="flex gap-4">
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
                    <div className="flex gap-4">
                      <Badge variant="outline" className="text-sm">
                        ม.ต้น: {countByField(responses, 'educationLevel', 'junior')} ({calculatePercentage(countByField(responses, 'educationLevel', 'junior'), total).toFixed(1)}%)
                      </Badge>
                      <Badge variant="outline" className="text-sm">
                        ม.ปลาย: {countByField(responses, 'educationLevel', 'senior')} ({calculatePercentage(countByField(responses, 'educationLevel', 'senior'), total).toFixed(1)}%)
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
                      <TableHead>ค่าเฉลี่ยรวม</TableHead>
                      <TableHead>ระดับ</TableHead>
                      <TableHead className="text-right">จัดการ</TableHead>
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
                          <TableCell>{individualStats.overall.mean.toFixed(2)}</TableCell>
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
