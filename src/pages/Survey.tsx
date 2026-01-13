import { SurveyForm } from '@/components/survey/SurveyForm';
import { ClipboardList } from 'lucide-react';

const Survey = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-primary-foreground py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary-foreground/20 rounded-full">
              <ClipboardList className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">แบบสอบถามเพื่อการวิจัย</h1>
              <p className="text-primary-foreground/80 text-sm sm:text-base">
                โรงเรียนอาจสามารถวิทยา
              </p>
            </div>
          </div>
          <p className="text-sm text-primary-foreground/90 leading-relaxed">
            การศึกษาพฤติกรรมการเลือกซื้อเครื่องดื่มผสมน้ำตาลในสหกรณ์โรงเรียน 
            และความเสี่ยงต่อสุขภาพจากการบริโภคน้ำตาลสูง
          </p>
        </div>
      </header>

      {/* Survey Form */}
      <main className="py-6">
        <SurveyForm />
      </main>
    </div>
  );
};

export default Survey;
