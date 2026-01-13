import { UseFormReturn } from 'react-hook-form';
import { SurveyResponse } from '@/types/survey';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Part1Props {
  form: UseFormReturn<Partial<SurveyResponse>>;
}

export const Part1GeneralInfo = ({ form }: Part1Props) => {
  const { register, setValue, watch } = form;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">1. เพศ</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={watch('gender')}
            onValueChange={(val) => setValue('gender', val as 'male' | 'female')}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male" className="cursor-pointer">ชาย</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female" className="cursor-pointer">หญิง</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">2. อายุ</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={watch('ageGroup')}
            onValueChange={(val) => setValue('ageGroup', val as '12-15' | '16-18')}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="12-15" id="age12-15" />
              <Label htmlFor="age12-15" className="cursor-pointer">12 - 15 ปี</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="16-18" id="age16-18" />
              <Label htmlFor="age16-18" className="cursor-pointer">16 - 18 ปี</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">3. ระดับชั้น</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={watch('educationLevel')}
            onValueChange={(val) => setValue('educationLevel', val as 'junior' | 'senior')}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="junior" id="junior" />
              <Label htmlFor="junior" className="cursor-pointer">มัธยมศึกษาตอนต้น (ม.1-ม.3)</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="senior" id="senior" />
              <Label htmlFor="senior" className="cursor-pointer">มัธยมศึกษาตอนปลาย (ม.4-ม.6)</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">4. ดัชนีมวลกาย (โดยประมาณ)</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={watch('bmi')}
            onValueChange={(val) => setValue('bmi', val as any)}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="underweight" id="underweight" />
              <Label htmlFor="underweight" className="cursor-pointer">ผอมกว่าเกณฑ์</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="normal" id="normal" />
              <Label htmlFor="normal" className="cursor-pointer">สมส่วน</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="overweight" id="overweight" />
              <Label htmlFor="overweight" className="cursor-pointer">ท้วม / เริ่มอ้วน</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="obese" id="obese" />
              <Label htmlFor="obese" className="cursor-pointer">อ้วน</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">5. รายได้/เงินค่าขนมที่ได้รับต่อวัน</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={watch('dailyAllowance')}
            onValueChange={(val) => setValue('dailyAllowance', val as any)}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="below50" id="below50" />
              <Label htmlFor="below50" className="cursor-pointer">ต่ำกว่า 50 บาท</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="51-100" id="51-100" />
              <Label htmlFor="51-100" className="cursor-pointer">51 - 100 บาท</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="101-150" id="101-150" />
              <Label htmlFor="101-150" className="cursor-pointer">101 - 150 บาท</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="above150" id="above150" />
              <Label htmlFor="above150" className="cursor-pointer">มากกว่า 150 บาท</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
};
