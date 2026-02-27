import { FileText, CheckCircle2, Circle } from 'lucide-react';

interface DocumentChecklistProps {
  documents: string[];
}

export function DocumentChecklist({ documents }: DocumentChecklistProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card animate-slide-up">
      <h3 className="font-display font-semibold text-card-foreground mb-3 flex items-center gap-2">
        <FileText className="h-5 w-5 text-accent" />
        Required Documents
      </h3>
      <ul className="space-y-2">
        {documents.map((doc, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-card-foreground">{doc}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Please keep these documents ready for claim processing.
      </p>
    </div>
  );
}
