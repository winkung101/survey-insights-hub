import { cn } from '@/lib/utils';

interface SurveyProgressProps {
  currentStep: number;
  totalSteps: number;
}

const stepTitles = [
  'ข้อมูลทั่วไป',
  'พฤติกรรมการซื้อ',
  'ความเสี่ยงสุขภาพ',
  'ข้อเสนอแนะ'
];

export const SurveyProgress = ({ currentStep, totalSteps }: SurveyProgressProps) => {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-4">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                i + 1 <= currentStep
                  ? "gradient-primary text-primary-foreground shadow-lg"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i + 1}
            </div>
            <span className={cn(
              "text-xs mt-2 text-center hidden sm:block",
              i + 1 <= currentStep ? "text-primary font-medium" : "text-muted-foreground"
            )}>
              {stepTitles[i]}
            </span>
          </div>
        ))}
      </div>
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 gradient-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
};
