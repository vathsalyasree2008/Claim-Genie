interface LocationMapProps {
  latitude: number;
  longitude: number;
}

export function LocationMap({ latitude, longitude }: LocationMapProps) {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div className="rounded-lg border border-border overflow-hidden shadow-card animate-slide-up">
      <div className="bg-primary/5 px-3 py-2 text-xs font-medium text-muted-foreground">
        📍 Accident Location ({latitude.toFixed(4)}, {longitude.toFixed(4)})
      </div>
      <iframe
        title="Accident Location"
        src={mapUrl}
        className="w-full h-48 border-0"
        loading="lazy"
      />
    </div>
  );
}
