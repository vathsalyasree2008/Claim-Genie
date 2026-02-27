import { Check, Circle } from 'lucide-react';

interface Step {
  label: string;
  key: string;
}

const STEPS: Step[] = [
  { label: 'Verify Vehicle', key: 'vehicle' },
  { label: 'Identity Check', key: 'otp' },
  { label: 'Upload Damage', key: 'image' },
  { label: 'AI Analysis', key: 'analysis' },
  { label: 'Review & Submit', key: 'submit' },
];

const STEP_MAP: Record<string, number> = {
  welcome: 0,
  awaiting_plate: 0,
  vehicle_found: 0,
  awaiting_otp: 1,
  awaiting_aadhaar: 1,
  otp_verified: 1,
  awaiting_image: 2,
  awaiting_location: 2,
  analyzing: 3,
  results: 4,
  escalation: 4,
  submitted: 5,
};

interface ProgressTrackerProps {
  currentStep: string;
}

export function ProgressTracker({ currentStep }: ProgressTrackerProps) {
  const activeIdx = STEP_MAP[currentStep] ?? 0;

  return (
    <div className="flex items-center justify-between px-2 py-3">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < activeIdx;
        const isActive = idx === activeIdx;
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                isCompleted ? 'bg-success text-success-foreground' :
                isActive ? 'bg-accent text-accent-foreground ring-2 ring-accent/30 ring-offset-2 ring-offset-background' :
                'bg-muted text-muted-foreground'
              }`}>
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : <span>{idx + 1}</span>}
              </div>
              <span className={`text-[10px] font-medium text-center leading-tight max-w-[60px] ${
                isActive ? 'text-accent' : isCompleted ? 'text-success' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mt-[-14px] transition-all duration-500 ${
                idx < activeIdx ? 'bg-success' : 'bg-muted'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
