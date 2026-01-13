import { useNavigate } from 'react-router-dom';
import { SurveyForm } from '@/components/survey/SurveyForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const Survey = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. Standard Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Area */}
            <div className="w-10 h-10 relative flex-shrink-0">
               <img 
                src="/ASW.png" 
                alt="Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/100x100?text=Logo";
                }}
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-slate-800 leading-tight">
                โรงเรียนอาจสามารถวิทยา
              </h1>
              <p className="text-xs text-slate-500">
                รายวิชาการศึกษาค้นคว้าด้วยตนเอง (IS)
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-slate-600 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">กลับหน้าหลัก</span>
            <span className="sm:hidden">กลับ</span>
          </Button>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-grow py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Title Section */}
          <div className="text-center space-y-3 mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              <ShieldCheck className="w-3 h-3" />
              ข้อมูลของท่านจะถูกเก็บเป็นความลับ
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
              แบบสอบถามเพื่อการวิจัย
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              เรื่อง "การศึกษาพฤติกรรมการเลือกซื้อเครื่องดื่มผสมน้ำตาลในสหกรณ์โรงเรียน 
              และความเสี่ยงต่อสุขภาพจากการบริโภคน้ำตาลสูง"
            </p>
          </div>

          {/* Form Container (Card Style) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up">
             {/* Progress Bar or Form Header could go here */}
             <div className="p-1 sm:p-6 md:p-8">
                <SurveyForm />
             </div>
          </div>

        </div>
      </main>

      {/* 3. Standard Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-400">
            © 2026 คณะผู้จัดทำรายวิชา IS โรงเรียนอาจสามารถวิทยา | Designed for Educational Purpose
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Survey;