import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, Shield, BarChart3, FileDown, Sparkles } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="gradient-hero text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/20 rounded-full mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">โครงการวิจัย IS</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 animate-slide-up">
            แบบสอบถามเพื่อการวิจัย
          </h1>
          
          <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto animate-slide-up">
            การศึกษาพฤติกรรมการเลือกซื้อเครื่องดื่มผสมน้ำตาลในสหกรณ์โรงเรียน
            และความเสี่ยงต่อสุขภาพจากการบริโภคน้ำตาลสูง
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
            <Button 
              size="lg" 
              onClick={() => navigate('/survey')}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg"
            >
              <ClipboardList className="mr-2 h-5 w-5" />
              เริ่มทำแบบสอบถาม
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/admin')}
              className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Shield className="mr-2 h-5 w-5" />
              เข้าสู่ระบบ Admin
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12 text-foreground">
          คุณสมบัติของระบบ
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card group hover:shadow-xl transition-all duration-300">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-14 h-14 rounded-full gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ClipboardList className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">แบบสอบถามออนไลน์</h3>
              <p className="text-muted-foreground text-sm">
                ตอบแบบสอบถาม 4 ตอนได้ง่ายบนทุกอุปกรณ์
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card group hover:shadow-xl transition-all duration-300">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-14 h-14 rounded-full gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">วิเคราะห์ผลอัตโนมัติ</h3>
              <p className="text-muted-foreground text-sm">
                คำนวณค่า x̄, S.D., ร้อยละ และระดับความคิดเห็น
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card group hover:shadow-xl transition-all duration-300">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-14 h-14 rounded-full gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileDown className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">ส่งออก PDF</h3>
              <p className="text-muted-foreground text-sm">
                สรุปผลรายบุคคลและรวมทั้งหมดเป็นไฟล์ PDF
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 โรงเรียนอาจสามารถวิทยา | รายวิชาการศึกษาค้นคว้าด้วยตนเอง (IS)
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
