import { UseFormReturn } from 'react-hook-form';
import { SurveyResponse } from '@/types/survey';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare } from 'lucide-react';

interface Part4Props {
  form: UseFormReturn<Partial<SurveyResponse>>;
}

export const Part4Suggestions = ({ form }: Part4Props) => {
  const { setValue, watch } = form;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full gradient-primary">
              <MessageSquare className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg text-primary">ข้อเสนอแนะเพิ่มเติม</CardTitle>
              <CardDescription>
                เกี่ยวกับพฤติกรรมการเลือกซื้อเครื่องดื่มผสมน้ำตาลในสหกรณ์โรงเรียน
                และความเสี่ยงต่อสุขภาพจากการบริโภคน้ำตาลสูง
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="กรุณาระบุข้อเสนอแนะหรือความคิดเห็นเพิ่มเติม (ถ้ามี)..."
            className="min-h-[150px] resize-none"
            value={watch('suggestions') || ''}
            onChange={(e) => setValue('suggestions', e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="glass-card border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-primary">ขอขอบคุณที่ให้ความร่วมมือในการตอบแบบสอบถาม</p>
            <p className="text-muted-foreground">ข้อมูลของท่านจะถูกเก็บรักษาเป็นความลับและใช้เพื่อการศึกษาวิจัยเท่านั้น</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
