import { getClaimsByPlate, Claim } from '@/data/mockDatabase';
import { FraudBadge } from './FraudBadge';
import { Clock, IndianRupee, FileText } from 'lucide-react';

interface ClaimHistoryProps {
  numberPlate: string;
}

function formatINR(amount: number) {
  return '₹' + amount.toLocaleString('en-IN');
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-danger/10 text-danger',
  under_investigation: 'bg-accent/10 text-accent',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  under_investigation: 'Under Investigation',
};

export function ClaimHistory({ numberPlate }: ClaimHistoryProps) {
  const claims = getClaimsByPlate(numberPlate);

  if (claims.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 shadow-card animate-slide-up text-center">
        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No previous claims found for this vehicle.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card animate-slide-up">
      <h3 className="font-display font-semibold text-card-foreground mb-3 flex items-center gap-2">
        <Clock className="h-5 w-5 text-accent" />
        Claim History ({claims.length})
      </h3>
      <div className="space-y-3">
        {claims.map(claim => (
          <div key={claim.claimId} className="rounded-md border border-border p-3 text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-medium text-card-foreground">{claim.claimId}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[claim.status]}`}>
                {statusLabels[claim.status]}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Date: </span>
                <span className="text-card-foreground">{new Date(claim.timestamp).toLocaleDateString('en-IN')}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Amount: </span>
                <span className="text-card-foreground font-medium">{formatINR(claim.claimableAmount)}</span>
              </div>
            </div>
            <div className="mt-2">
              <FraudBadge risk={claim.fraudRisk} score={claim.fraudScore} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
