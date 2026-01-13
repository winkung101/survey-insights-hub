import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { SurveyResponse } from '@/types/survey';
import { saveResponse } from '@/lib/storage';
import { SurveyProgress } from './SurveyProgress';
import { Part1GeneralInfo } from './Part1GeneralInfo';
import { Part2Behavior } from './Part2Behavior';
import { Part3HealthRisk } from './Part3HealthRisk';
import { Part4Suggestions } from './Part4Suggestions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const SurveyForm = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<Partial<SurveyResponse>>({
    defaultValues: {
      purchaseTime: [],
      drinkTypes: [],
      purchaseFactors: [],
      suggestions: ''
    }
  });

  const validateStep = (currentStep: number): boolean => {
    const values = form.getValues();
    
    switch (currentStep) {
      case 1:
        if (!values.gender || !values.ageGroup || !values.educationLevel || !values.bmi || !values.dailyAllowance) {
          toast.error('กรุณาตอบคำถามให้ครบทุกข้อ');
          return false;
        }
        return true;
      case 2:
        if (!values.purchaseFrequency || !values.purchaseTime?.length || !values.drinkTypes?.length || 
            !values.sugarLevel || !values.purchaseReason || !values.purchaseFactors?.length || !values.dailyExpense) {
          toast.error('กรุณาตอบคำถามให้ครบทุกข้อ');
          return false;
        }
        return true;
      case 3:
        if (!values.knowledge1 || !values.knowledge2 || !values.knowledge3 ||
            !values.awareness1 || !values.awareness2 || !values.awareness3 || !values.awareness4 ||
            !values.intention1 || !values.intention2 || !values.intention3 || !values.intention4) {
          toast.error('กรุณาให้คะแนนทุกข้อ');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // แก้ไขส่วนนี้ให้เป็น Async/Await เพื่อรอ Database
  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    
    setIsSubmitting(true);
    
    try {
      const values = form.getValues();
      const response: SurveyResponse = {
        id: uuidv4(),
        createdAt: new Date(),
        ...values as Omit<SurveyResponse, 'id' | 'createdAt'>
      };
      
      // รอให้บันทึกเสร็จก่อน
      await saveResponse(response);
      
      setIsComplete(true);
      toast.success('บันทึกข้อมูลสำเร็จ!');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-6 animate-scale-in">
          <div className="mx-auto w-24 h-24 rounded-full gradient-primary flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">ส่งแบบสอบถามสำเร็จ!</h2>
          <p className="text-muted-foreground max-w-md">
            ขอขอบคุณที่สละเวลาตอบแบบสอบถาม ข้อมูลของท่านจะถูกนำไปใช้เพื่อการศึกษาวิจัยต่อไป
          </p>
          <Button onClick={() => navigate('/')} className="gradient-primary">
            กลับหน้าหลัก
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24">
      <SurveyProgress currentStep={step} totalSteps={4} />
      
      <div className="mb-8">
        {step === 1 && <Part1GeneralInfo form={form} />}
        {step === 2 && <Part2Behavior form={form} />}
        {step === 3 && <Part3HealthRisk form={form} />}
        {step === 4 && <Part4Suggestions form={form} />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border p-4">
        <div className="max-w-3xl mx-auto flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={step === 1}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            ย้อนกลับ
          </Button>
          
          {step < 4 ? (
            <Button onClick={handleNext} className="flex-1 gradient-primary">
              ถัดไป
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex-1 gradient-primary"
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'ส่งแบบสอบถาม'}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};