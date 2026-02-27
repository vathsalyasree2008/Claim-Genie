interface QuickRepliesProps {
  options: string[];
  onSelect: (option: string) => void;
}

export function QuickReplies({ options, onSelect }: QuickRepliesProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-2 animate-slide-up">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className="text-xs px-3 py-1.5 rounded-full border border-accent/40 text-accent bg-accent/5 hover:bg-accent/15 transition-colors font-medium"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
