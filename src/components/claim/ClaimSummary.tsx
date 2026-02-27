import { CostBreakdown } from '@/lib/policyEngine';
import { FraudBadge } from './FraudBadge';
import { IndianRupee, ArrowDown, Percent, AlertCircle } from 'lucide-react';

interface ClaimSummaryProps {
  breakdown: CostBreakdown;
  fraudRisk: 'low' | 'medium' | 'high';
  fraudScore: number;
  fraudReasons: string[];
}

function formatINR(amount: number) {
  return '₹' + amount.toLocaleString('en-IN');
}

const severityColors: Record<string, string> = {
  minor: 'text-success',
  moderate: 'text-warning',
  severe: 'text-danger',
};

export function ClaimSummary({ breakdown, fraudRisk, fraudScore, fraudReasons }: ClaimSummaryProps) {
  return (
    <div className="space-y-4 animate-slide-up">
      {/* Damaged Parts */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-card">
        <h3 className="font-display font-semibold text-card-foreground mb-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-accent" />
          Detected Damage
        </h3>
        <div className="space-y-2">
          {breakdown.parts.map((part) => (
            <div key={part.partName} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
              <div>
                <span className="font-medium text-card-foreground">{part.partLabel}</span>
                <span className={`ml-2 text-xs font-semibold uppercase ${severityColors[part.severity]}`}>
                  {part.severity}
                </span>
              </div>
              <span className="font-mono text-card-foreground">{formatINR(part.finalCost)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-card">
        <h3 className="font-display font-semibold text-card-foreground mb-3 flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-accent" />
          Cost Breakdown
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Damage Cost</span>
            <span className="font-mono font-medium text-card-foreground">{formatINR(breakdown.totalDamageCost)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1">
              <Percent className="h-3 w-3" /> Policy Coverage ({breakdown.coveragePercent}%)
            </span>
            <span className="font-mono text-card-foreground">{formatINR(breakdown.coverageAmount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1">
              <ArrowDown className="h-3 w-3" /> Deductible
            </span>
            <span className="font-mono text-danger">-{formatINR(breakdown.deductible)}</span>
          </div>
          {breakdown.maxLimitApplied && (
            <div className="text-xs text-warning bg-warning/10 rounded p-2">
              ⚠️ Maximum coverage limit applied
            </div>
          )}
          <div className="border-t border-border pt-2 mt-2 flex justify-between">
            <span className="font-semibold text-card-foreground">Final Claimable Amount</span>
            <span className="font-mono font-bold text-lg text-accent">{formatINR(breakdown.claimableAmount)}</span>
          </div>
        </div>
      </div>

      {/* Fraud Assessment */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-card">
        <h3 className="font-display font-semibold text-card-foreground mb-3">Fraud Assessment</h3>
        <div className="mb-3">
          <FraudBadge risk={fraudRisk} score={fraudScore} />
        </div>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {fraudReasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
              {reason}
            </li>
          ))}
        </ul>
        {fraudRisk === 'high' && (
          <div className="mt-3 rounded-md bg-danger/10 border border-danger/20 p-3 text-sm text-danger font-medium">
            ⚠️ This claim has been flagged for manual investigation.
          </div>
        )}
      </div>
    </div>
  );
}
