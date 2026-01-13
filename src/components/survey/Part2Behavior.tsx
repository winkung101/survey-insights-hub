import { UseFormReturn } from 'react-hook-form';
import { SurveyResponse } from '@/types/survey';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Part2Props {
  form: UseFormReturn<Partial<SurveyResponse>>;
}

export const Part2Behavior = ({ form }: Part2Props) => {
  const { setValue, watch } = form;

  const handleCheckboxChange = (field: 'purchaseTime' | 'drinkTypes' | 'purchaseFactors', value: string, checked: boolean) => {
    const current = watch(field) || [];
    if (checked) {
      setValue(field, [...current, value]);
    } else {
      setValue(field, current.filter((v: string) => v !== value));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">2.1 ท่านซื้อเครื่องดื่มจากสหกรณ์โรงเรียนบ่อยเพียงใด</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={watch('purchaseFrequency')}
            onValueChange={(val) => setValue('purchaseFrequency', val as any)}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily" className="cursor-pointer">ทุกวัน</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="3-4times" id="3-4times" />
              <Label htmlFor="3-4times" className="cursor-pointer">3-4 ครั้งต่อสัปดาห์</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="1-2times" id="1-2times" />
              <Label htmlFor="1-2times" className="cursor-pointer">1-2 ครั้งต่อสัปดาห์</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="rarely" id="rarely" />
              <Label htmlFor="rarely" className="cursor-pointer">นานๆ ครั้ง</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">2.2 ช่วงเวลาใดที่ท่านนิยมซื้อเครื่องดื่มมากที่สุด (เลือกได้มากกว่า 1 ข้อ)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { value: 'morning', label: 'ก่อนเข้าเรียนตอนเช้า' },
              { value: 'lunch', label: 'พักกลางวัน' },
              { value: 'afternoon', label: 'หลังเลิกเรียน' },
              { value: 'break', label: 'ช่วงพักเบรกระหว่างคาบ' },
            ].map((item) => (
              <div key={item.value} className="flex items-center space-x-3">
                <Checkbox
                  id={`time-${item.value}`}
                  checked={(watch('purchaseTime') || []).includes(item.value)}
                  onCheckedChange={(checked) => handleCheckboxChange('purchaseTime', item.value, !!checked)}
                />
                <Label htmlFor={`time-${item.value}`} className="cursor-pointer">{item.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">2.3 ประเภทเครื่องดื่มที่ท่านเลือกซื้อบ่อยที่สุด (เลือกได้มากกว่า 1 ข้อ)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { value: 'soda', label: 'น้ำอัดลม' },
              { value: 'tea', label: 'ชาเขียว / ชาเย็น / ชานมไข่มุก' },
              { value: 'yogurt', label: 'นมเปรี้ยว / โยเกิร์ตพร้อมดื่ม' },
              { value: 'juice', label: 'น้ำผลไม้ / น้ำสมุนไพร' },
              { value: 'energy', label: 'เครื่องดื่มชูกำลัง / เกลือแร่' },
            ].map((item) => (
              <div key={item.value} className="flex items-center space-x-3">
                <Checkbox
                  id={`drink-${item.value}`}
                  checked={(watch('drinkTypes') || []).includes(item.value)}
                  onCheckedChange={(checked) => handleCheckboxChange('drinkTypes', item.value, !!checked)}
                />
                <Label htmlFor={`drink-${item.value}`} className="cursor-pointer">{item.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">2.4 ปริมาณน้ำตาล (ระดับความหวาน) ที่ท่านสั่งเป็นประจำ</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={watch('sugarLevel')}
            onValueChange={(val) => setValue('sugarLevel', val as any)}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="100%" id="sugar100" />
              <Label htmlFor="sugar100" className="cursor-pointer">หวานปกติ (100%)</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="50%" id="sugar50" />
              <Label htmlFor="sugar50" className="cursor-pointer">หวานน้อย (50% หรือต่ำกว่า)</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="extra" id="sugarExtra" />
              <Label htmlFor="sugarExtra" className="cursor-pointer">หวานมาก (เพิ่มหวาน)</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="none" id="sugarNone" />
              <Label htmlFor="sugarNone" className="cursor-pointer">ไม่ใส่น้ำตาลเลย</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">2.5 เหตุผลหลักในการตัดสินใจเลือกซื้อเครื่องดื่มผสมน้ำตาล</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={watch('purchaseReason')}
            onValueChange={(val) => setValue('purchaseReason', val)}
          >
            {[
              { value: 'taste', label: 'รสชาติอร่อย / สดชื่น' },
              { value: 'thirst', label: 'แก้กระหาย / คลายร้อน' },
              { value: 'price', label: 'ราคาถูก / มีโปรโมชั่น' },
              { value: 'friends', label: 'เพื่อนชวนซื้อ / ซื้อตามเพื่อน' },
              { value: 'habit', label: 'ความเคยชิน / ติดหวาน' },
            ].map((item) => (
              <div key={item.value} className="flex items-center space-x-3">
                <RadioGroupItem value={item.value} id={`reason-${item.value}`} />
                <Label htmlFor={`reason-${item.value}`} className="cursor-pointer">{item.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">2.6 ปัจจัยด้านข้อจำกัดและกฎระเบียบที่ทำให้ท่านเลือกซื้อในสหกรณ์โรงเรียน (เลือกได้มากกว่า 1 ข้อ)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { value: 'rule', label: 'กฎโรงเรียนไม่อนุญาตให้ออกไปซื้อของนอกบริเวณโรงเรียน' },
              { value: 'only', label: 'ร้านค้าสหกรณ์เป็นทางเลือกเดียวที่มีให้บริการ' },
              { value: 'time', label: 'เวลาพักมีจำกัด ไม่สามารถเดินไปซื้อที่ร้านค้าอื่นได้ทัน' },
              { value: 'convenience', label: 'ความสะดวกในการเข้าถึงและสถานที่ตั้งของสหกรณ์' },
              { value: 'none', label: 'ไม่มีข้อจำกัด (เลือกซื้อเพราะความพอใจส่วนตัว)' },
            ].map((item) => (
              <div key={item.value} className="flex items-center space-x-3">
                <Checkbox
                  id={`factor-${item.value}`}
                  checked={(watch('purchaseFactors') || []).includes(item.value)}
                  onCheckedChange={(checked) => handleCheckboxChange('purchaseFactors', item.value, !!checked)}
                />
                <Label htmlFor={`factor-${item.value}`} className="cursor-pointer">{item.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">2.7 ค่าใช้จ่ายเฉลี่ยในการซื้อเครื่องดื่มต่อวัน</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={watch('dailyExpense')}
            onValueChange={(val) => setValue('dailyExpense', val as any)}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="below20" id="expense-below20" />
              <Label htmlFor="expense-below20" className="cursor-pointer">ต่ำกว่า 20 บาท</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="20-40" id="expense-20-40" />
              <Label htmlFor="expense-20-40" className="cursor-pointer">20 - 40 บาท</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="41-60" id="expense-41-60" />
              <Label htmlFor="expense-41-60" className="cursor-pointer">41 - 60 บาท</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="above60" id="expense-above60" />
              <Label htmlFor="expense-above60" className="cursor-pointer">มากกว่า 60 บาท</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
};
