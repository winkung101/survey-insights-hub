import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Shield, Info, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Main Content Area */}
      <div className="flex-grow">
        
        {/* Header / Logo Section */}
        <div className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col items-center text-center">
            {/* School Logo Area - Replace src with your actual logo path */}
            <div className="w-24 h-24 mb-4 relative">
              <img 
                src="/ASW.png" 
                alt="School Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback if image not found
                  e.currentTarget.src = "https://placehold.co/100x100?text=School+Logo";
                }}
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
              โรงเรียนอาจสามารถวิทยา
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              รายวิชาการศึกษาค้นคว้าด้วยตนเอง (IS)
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          {/* Survey Title Card */}
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-relaxed">
              แบบสอบถามเพื่อการวิจัย เรื่อง<br/>
              <span className="text-primary">
                "การศึกษาพฤติกรรมการเลือกซื้อเครื่องดื่มผสมน้ำตาลในสหกรณ์โรงเรียน
                และความเสี่ยงต่อสุขภาพจากการบริโภคน้ำตาลสูง"
              </span>
            </h2>
          </div>

          {/* Details Card */}
          <Card className="border-t-4 border-t-primary shadow-md">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                <Info className="h-5 w-5 text-primary" />
                คำชี้แจงและรายละเอียด
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6 text-slate-600">
              
              {/* Objective */}
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  วัตถุประสงค์
                </h3>
                <p className="text-sm leading-relaxed pl-6">
                  เพื่อศึกษาพฤติกรรมการเลือกซื้อเครื่องดื่มผสมน้ำตาลในสหกรณ์โรงเรียน 
                  และความเสี่ยงต่อสุขภาพจากการบริโภคน้ำตาลสูงของนักเรียนโรงเรียนอาจสามารถวิทยา
                  ข้อมูลที่ได้จะนำไปใช้เป็นแนวทางในการกำหนดนโยบายส่งเสริมสุขภาพต่อไป
                </p>
              </div>

              {/* Target Group */}
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  กลุ่มเป้าหมาย
                </h3>
                <p className="text-sm leading-relaxed pl-6">
                  นักเรียนระดับชั้นมัธยมศึกษาปีที่ 1 - 6 โรงเรียนอาจสามารถวิทยา
                </p>
              </div>

              {/* Structure */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-blue-600" />
                  โครงสร้างแบบสอบถาม (4 ตอน)
                </h3>
                <ul className="text-sm space-y-1 pl-6 list-disc text-slate-600">
                  <li><span className="font-medium text-slate-900">ตอนที่ 1:</span> ข้อมูลทั่วไปของผู้ตอบแบบสอบถาม</li>
                  <li><span className="font-medium text-slate-900">ตอนที่ 2:</span> พฤติกรรมการเลือกซื้อเครื่องดื่มผสมน้ำตาล</li>
                  <li><span className="font-medium text-slate-900">ตอนที่ 3:</span> ปัจจัยความเสี่ยงต่อสุขภาพ (ประเมินระดับความคิดเห็น)</li>
                  <li><span className="font-medium text-slate-900">ตอนที่ 4:</span> ข้อเสนอแนะเพิ่มเติม</li>
                </ul>
              </div>

              {/* Confidentiality Notice */}
              <div className="flex items-start gap-3 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-md border border-yellow-100">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>
                  ข้อมูลที่ได้จะใช้เป็นประโยชน์เพื่อการศึกษาวิจัยเท่านั้น 
                  และจะไม่มีผลกระทบใด ๆ ต่อผู้ตอบแบบสอบถาม
                  ขอความกรุณาตอบตามความเป็นจริงมากที่สุด
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Start Button */}
          <div className="flex justify-center pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/survey')}
              className="w-full sm:w-auto min-w-[200px] h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-primary hover:bg-primary/90"
            >
              <ClipboardList className="mr-2 h-5 w-5" />
              เริ่มทำแบบสอบถาม
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-4">
          <div className="text-center text-xs text-slate-400">
            <p>© 2026 คณะผู้จัดทำรายวิชา IS โรงเรียนอาจสามารถวิทยา</p>
            <p>เพื่อการศึกษาเท่านั้น</p>
          </div>
          
          {/* Admin Button (Discreet) */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/admin')}
            className="text-slate-300 hover:text-slate-500 hover:bg-transparent text-xs h-auto py-1"
          >
            <Shield className="mr-1.5 h-3 w-3" />
            ผู้ดูแลระบบ
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Index;