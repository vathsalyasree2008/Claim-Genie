import ExifReader from 'exifreader';

export interface GeotagResult {
  hasGeotag: boolean;
  latitude?: number;
  longitude?: number;
  error?: string;
}

export async function extractGeotag(file: File): Promise<GeotagResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const tags = ExifReader.load(arrayBuffer, { expanded: true });

    if (tags.gps && tags.gps.Latitude !== undefined && tags.gps.Longitude !== undefined) {
      return {
        hasGeotag: true,
        latitude: tags.gps.Latitude,
        longitude: tags.gps.Longitude,
      };
    }

    return {
      hasGeotag: false,
      error: 'No GPS metadata found in image',
    };
  } catch {
    return {
      hasGeotag: false,
      error: 'Could not read image metadata',
    };
  }
}
