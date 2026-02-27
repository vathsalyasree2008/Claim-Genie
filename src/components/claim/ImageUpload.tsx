import { useRef } from 'react';
import { Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onUpload: (file: File) => void;
  uploading?: boolean;
}

export function ImageUpload({ onUpload, uploading }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="animate-slide-up">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <Button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
      >
        {uploading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent" />
            Analyzing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Upload Damage Image
          </>
        )}
      </Button>
      <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
        <Image className="h-3 w-3" />
        JPG, PNG supported. Original photo with metadata preferred.
      </p>
    </div>
  );
}
