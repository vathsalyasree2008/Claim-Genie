import { useState } from 'react';
import { Shield, ArrowLeft, Filter, CheckCircle2, XCircle, Search, AlertTriangle, Clock, TrendingUp, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FraudBadge } from '@/components/claim/FraudBadge';
import { getAllClaims, updateClaimStatus, Claim, MOCK_VEHICLES } from '@/data/mockDatabase';
import { Link } from 'react-router-dom';

function formatINR(amount: number) {
  return '₹' + amount.toLocaleString('en-IN');
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
  approved: { label: 'Approved', className: 'bg-success/10 text-success border-success/20' },
  rejected: { label: 'Rejected', className: 'bg-danger/10 text-danger border-danger/20' },
  under_investigation: { label: 'Investigating', className: 'bg-accent/10 text-accent border-accent/20' },
};

const AdminDashboard = () => {
  const [claims, setClaims] = useState<Claim[]>(getAllClaims());
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const refreshClaims = () => setClaims(getAllClaims());

  const filteredClaims = claims.filter(c => {
    const matchesFilter = filter === 'all' || c.fraudRisk === filter || c.status === filter;
    const matchesSearch = !search || c.claimId.toLowerCase().includes(search.toLowerCase()) || c.numberPlate.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalAmount = claims.reduce((sum, c) => sum + c.claimableAmount, 0);
  const highRiskCount = claims.filter(c => c.fraudRisk === 'high').length;
  const pendingCount = claims.filter(c => c.status === 'pending' || c.status === 'under_investigation').length;

  const handleStatusChange = (claimId: string, status: Claim['status']) => {
    updateClaimStatus(claimId, status);
    refreshClaims();
    if (selectedClaim?.claimId === claimId) {
      setSelectedClaim({ ...selectedClaim, status });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground px-4 py-4 shadow-elevated">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-accent/20 backdrop-blur-sm">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-xs text-primary-foreground/70">Claims Management & Analytics</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <FileText className="h-4 w-4" />
              Total Claims
            </div>
            <p className="text-2xl font-display font-bold text-card-foreground">{claims.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              Total Value
            </div>
            <p className="text-2xl font-display font-bold text-accent">{formatINR(totalAmount)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <AlertTriangle className="h-4 w-4" />
              High Risk
            </div>
            <p className="text-2xl font-display font-bold text-danger">{highRiskCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Clock className="h-4 w-4" />
              Pending
            </div>
            <p className="text-2xl font-display font-bold text-warning">{pendingCount}</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Claim ID or Plate..." className="pl-10" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['all', 'low', 'medium', 'high', 'pending', 'approved', 'rejected', 'under_investigation'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  filter === f ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {f === 'all' ? 'All' : f === 'under_investigation' ? 'Investigating' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Claims Table */}
        <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-semibold text-card-foreground">Claim ID</th>
                  <th className="text-left p-3 font-semibold text-card-foreground">Plate</th>
                  <th className="text-left p-3 font-semibold text-card-foreground">Date</th>
                  <th className="text-left p-3 font-semibold text-card-foreground">Amount</th>
                  <th className="text-left p-3 font-semibold text-card-foreground">Fraud Risk</th>
                  <th className="text-left p-3 font-semibold text-card-foreground">Status</th>
                  <th className="text-left p-3 font-semibold text-card-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No claims found</td></tr>
                ) : filteredClaims.map(claim => (
                  <tr key={claim.claimId} className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelectedClaim(claim)}>
                    <td className="p-3 font-mono text-card-foreground">{claim.claimId}</td>
                    <td className="p-3 font-medium text-card-foreground">{claim.numberPlate}</td>
                    <td className="p-3 text-muted-foreground">{new Date(claim.timestamp).toLocaleDateString('en-IN')}</td>
                    <td className="p-3 font-mono text-card-foreground">{formatINR(claim.claimableAmount)}</td>
                    <td className="p-3"><FraudBadge risk={claim.fraudRisk} score={claim.fraudScore} /></td>
                    <td className="p-3">
                      <Badge variant="outline" className={statusConfig[claim.status].className}>
                        {statusConfig[claim.status].label}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-success hover:text-success" onClick={() => handleStatusChange(claim.claimId, 'approved')}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-danger hover:text-danger" onClick={() => handleStatusChange(claim.claimId, 'rejected')}>
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Claim Detail Panel */}
        {selectedClaim && (
          <div className="rounded-lg border border-border bg-card p-6 shadow-elevated animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-card-foreground">Claim Details: {selectedClaim.claimId}</h2>
              <button onClick={() => setSelectedClaim(null)} className="text-muted-foreground hover:text-card-foreground">✕</button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3 text-sm">
                <div><span className="text-muted-foreground">Number Plate:</span> <span className="font-medium text-card-foreground">{selectedClaim.numberPlate}</span></div>
                <div><span className="text-muted-foreground">Total Damage:</span> <span className="font-medium text-card-foreground">{formatINR(selectedClaim.totalDamageCost)}</span></div>
                <div><span className="text-muted-foreground">Claimable:</span> <span className="font-bold text-accent">{formatINR(selectedClaim.claimableAmount)}</span></div>
                <div><span className="text-muted-foreground">Location:</span> <span className="text-card-foreground">{selectedClaim.userEnteredLocation || 'GPS Coordinates'}</span></div>
                <div><span className="text-muted-foreground">Filed:</span> <span className="text-card-foreground">{new Date(selectedClaim.timestamp).toLocaleString('en-IN')}</span></div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-card-foreground">Damaged Parts</h3>
                {selectedClaim.detectedParts.map(p => (
                  <div key={p.partName} className="flex justify-between text-sm">
                    <span className="text-card-foreground">{p.partLabel} <span className="text-xs text-muted-foreground">({p.severity})</span></span>
                    <span className="font-mono text-card-foreground">{formatINR(p.finalCost)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border">
                  <h3 className="font-semibold text-card-foreground mb-1">Fraud Indicators</h3>
                  <FraudBadge risk={selectedClaim.fraudRisk} score={selectedClaim.fraudScore} />
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {selectedClaim.fraudReasons.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => handleStatusChange(selectedClaim.claimId, 'approved')} className="bg-success text-success-foreground hover:bg-success/90">
                <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
              </Button>
              <Button onClick={() => handleStatusChange(selectedClaim.claimId, 'rejected')} variant="destructive">
                <XCircle className="h-4 w-4 mr-1" /> Reject
              </Button>
              <Button onClick={() => handleStatusChange(selectedClaim.claimId, 'under_investigation')} variant="outline">
                <AlertTriangle className="h-4 w-4 mr-1" /> Investigate
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
