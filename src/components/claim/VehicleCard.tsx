import { Car, User, FileText, Calendar, IndianRupee, ShieldCheck } from 'lucide-react';
import { Vehicle } from '@/data/mockDatabase';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const isExpired = new Date(vehicle.policyExpiry) < new Date();

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <div className="rounded-full bg-primary/10 p-2">
          <Car className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-display font-semibold text-card-foreground">Vehicle Details</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground text-xs">Owner</p>
            <p className="font-medium text-card-foreground">{vehicle.ownerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Car className="h-3.5 w-3.5 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground text-xs">Vehicle</p>
            <p className="font-medium text-card-foreground">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground text-xs">Policy ID</p>
            <p className="font-medium text-card-foreground">{vehicle.policyId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground text-xs">Expiry</p>
            <p className={`font-medium ${isExpired ? 'text-danger' : 'text-success'}`}>
              {vehicle.policyExpiry} {isExpired && '(Expired)'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground text-xs">Coverage</p>
            <p className="font-medium text-card-foreground">{vehicle.coveragePercent}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground text-xs">Max Limit</p>
            <p className="font-medium text-card-foreground">₹{vehicle.maxCoverageLimit.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
