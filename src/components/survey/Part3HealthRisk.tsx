import { UseFormReturn } from 'react-hook-form';
import { SurveyResponse } from '@/types/survey';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Part3Props {
  form: UseFormReturn<Partial<SurveyResponse>>;
}

const ScaleButton = ({ value, selected, onClick, label }: { value: number; selected: boolean; onClick: () => void; label: string }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 min-w-[60px]",
      selected 
        ? "border-primary bg-primary text-primary-foreground shadow-md scale-105" 
        : "border-border bg-card hover:border-primary/50 hover:bg-secondary"
    )}
  >
    <span className="text-lg font-bold">{value}</span>
    <span className="text-xs mt-1 hidden sm:block">{label}</span>
  </button>
);

const RatingQuestion = ({ 
  question, 
  value, 
  onChange 
}: { 
  question: string; 
  value: number | undefined; 
  onChange: (val: number) => void;
}) => {
  const labels = ['น้อยที่สุด', 'น้อย', 'ปานกลาง', 'มาก', 'มากที่สุด'];
  
  return (
    <div className="py-4 border-b border-border last:border-b-0">
      <p className="text-foreground mb-4">{question}</p>
      <div className="flex justify-center gap-2 sm:gap-4">
        {[1, 2, 3, 4, 5].map((num) => (
          <ScaleButton
            key={num}
            value={num}
            selected={value === num}
            onClick={() => onChange(num)}
            label={labels[num - 1]}
          />
        ))}
      </div>
    </div>
  );
};

export const Part3HealthRisk = ({ form }: Part3Props) => {
  const { setValue, watch } = form;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">1. ด้านความรู้ความเข้าใจ</CardTitle>
          <CardDescription>ให้คะแนนระดับความคิดเห็นของท่าน (1-5)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <RatingQuestion
            question="1.1 ท่านทราบว่าร่างกายไม่ควรได้รับน้ำตาลเกิน 6 ช้อนชาต่อวัน"
            value={watch('knowledge1')}
            onChange={(val) => setValue('knowledge1', val)}
          />
          <RatingQuestion
            question="1.2 ท่านทราบว่าเครื่องดื่ม 1 แก้ว/ขวด ส่วนใหญ่มีน้ำตาลเกินปริมาณที่แนะนำ"
            value={watch('knowledge2')}
            onChange={(val) => setValue('knowledge2', val)}
          />
          <RatingQuestion
            question="1.3 ท่านอ่านฉลากโภชนาการ (ดูปริมาณน้ำตาล) ก่อนตัดสินใจซื้อ"
            value={watch('knowledge3')}
            onChange={(val) => setValue('knowledge3', val)}
          />
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">2. ด้านความตระหนักต่อสุขภาพ</CardTitle>
          <CardDescription>ให้คะแนนระดับความคิดเห็นของท่าน (1-5)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <RatingQuestion
            question="2.1 ท่านคิดว่าพฤติกรรมการดื่มของท่านเสี่ยงต่อโรคเบาหวาน"
            value={watch('awareness1')}
            onChange={(val) => setValue('awareness1', val)}
          />
          <RatingQuestion
            question="2.2 ท่านเคยมีอาการอ่อนเพลีย หงุดหงิด เมื่อไม่ได้ดื่มน้ำหวาน"
            value={watch('awareness2')}
            onChange={(val) => setValue('awareness2', val)}
          />
          <RatingQuestion
            question="2.3 ท่านคิดว่าน้ำหนักตัวของท่านเพิ่มขึ้นจากการดื่มเครื่องดื่มรสหวาน"
            value={watch('awareness3')}
            onChange={(val) => setValue('awareness3', val)}
          />
          <RatingQuestion
            question="2.4 ท่านกังวลเรื่องฟันผุจากการดื่มเครื่องดื่มที่มีน้ำตาล"
            value={watch('awareness4')}
            onChange={(val) => setValue('awareness4', val)}
          />
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">3. ด้านความตั้งใจและการปรับเปลี่ยนพฤติกรรม</CardTitle>
          <CardDescription>ให้คะแนนระดับความคิดเห็นของท่าน (1-5)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <RatingQuestion
            question="3.1 ท่านมีความตั้งใจที่จะลดปริมาณการดื่มเครื่องดื่มรสหวานในอนาคต"
            value={watch('intention1')}
            onChange={(val) => setValue('intention1', val)}
          />
          <RatingQuestion
            question="3.2 ท่านเชื่อว่าท่านสามารถควบคุมความอยากดื่มน้ำหวานของตนเองได้"
            value={watch('intention2')}
            onChange={(val) => setValue('intention2', val)}
          />
          <RatingQuestion
            question="3.3 ท่านยินดีเลือกดื่มน้ำเปล่าหรือเครื่องดื่มไม่ใส่น้ำตาลแทน หากมีวางจำหน่าย"
            value={watch('intention3')}
            onChange={(val) => setValue('intention3', val)}
          />
          <RatingQuestion
            question="3.4 ท่านพร้อมที่จะแนะนำเพื่อนหรือคนรอบข้างให้ลดการบริโภคน้ำตาล"
            value={watch('intention4')}
            onChange={(val) => setValue('intention4', val)}
          />
        </CardContent>
      </Card>
    </div>
  );
};
