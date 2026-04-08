import { useState, useEffect, useCallback } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Sun, Moon, Camera, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

// Image imports
import mountainsImg from '@/assets/gallery/mountains.jpg';
import cityNightImg from '@/assets/gallery/city-night.jpg';
import lionImg from '@/assets/gallery/lion.jpg';
import beachImg from '@/assets/gallery/beach.jpg';
import forestImg from '@/assets/gallery/forest.jpg';
import parrotImg from '@/assets/gallery/parrot.jpg';
import portraitImg from '@/assets/gallery/portrait.jpg';
import sakuraImg from '@/assets/gallery/sakura.jpg';
import marketImg from '@/assets/gallery/market.jpg';
import owlImg from '@/assets/gallery/owl.jpg';
import waterfallImg from '@/assets/gallery/waterfall.jpg';
import friendsImg from '@/assets/gallery/friends.jpg';

interface GalleryImage {
  id: number;
  src: string;
  title: string;
  tags: string[];
  category: string;
}

const IMAGES: GalleryImage[] = [
  { id: 1, src: mountainsImg, title: 'Mountain Sunset', tags: ['nature', 'mountains', 'sunset', 'landscape'], category: 'nature' },
  { id: 2, src: cityNightImg, title: 'City Nightscape', tags: ['city', 'night', 'urban', 'lights'], category: 'city' },
  { id: 3, src: lionImg, title: 'Majestic Lion', tags: ['animals', 'wildlife', 'lion', 'safari'], category: 'animals' },
  { id: 4, src: beachImg, title: 'Tropical Paradise', tags: ['nature', 'beach', 'ocean', 'travel'], category: 'nature' },
  { id: 5, src: forestImg, title: 'Misty Forest', tags: ['nature', 'forest', 'trees', 'morning'], category: 'nature' },
  { id: 6, src: parrotImg, title: 'Colorful Parrot', tags: ['animals', 'bird', 'tropical', 'wildlife'], category: 'animals' },
  { id: 7, src: portraitImg, title: 'Golden Hour Portrait', tags: ['people', 'portrait', 'sunset', 'candid'], category: 'people' },
  { id: 8, src: sakuraImg, title: 'Cherry Blossom Garden', tags: ['nature', 'flowers', 'japan', 'spring'], category: 'nature' },
  { id: 9, src: marketImg, title: 'Indian Street Market', tags: ['people', 'culture', 'market', 'india'], category: 'people' },
  { id: 10, src: owlImg, title: 'Snowy Owl in Flight', tags: ['animals', 'bird', 'owl', 'winter'], category: 'animals' },
  { id: 11, src: waterfallImg, title: 'Iceland Waterfall', tags: ['nature', 'waterfall', 'iceland', 'dramatic'], category: 'nature' },
  { id: 12, src: friendsImg, title: 'Friends Together', tags: ['people', 'lifestyle', 'friends', 'candid'], category: 'people' },
];

const CATEGORIES = ['all', 'nature', 'city', 'animals', 'people'];

const Gallery = () => {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [dark, setDark] = useState(() => localStorage.getItem('gallery-theme') === 'dark');
  const [loaded, setLoaded] = useState<Set<number>>(new Set());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('gallery-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const filtered = IMAGES.filter((img) => {
    const matchesSearch = !search || img.title.toLowerCase().includes(search.toLowerCase()) || img.tags.some(t => t.includes(search.toLowerCase()));
    const matchesTag = !activeTag || img.tags.includes(activeTag);
    const matchesCat = activeCategory === 'all' || img.category === activeCategory;
    return matchesSearch && matchesTag && matchesCat;
  });

  const allTags = [...new Set(IMAGES.flatMap(i => i.tags))];

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  const navigate = useCallback((dir: number) => {
    if (lightboxIndex === null) return;
    const next = lightboxIndex + dir;
    if (next >= 0 && next < filtered.length) setLightboxIndex(next);
  }, [lightboxIndex, filtered.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex, navigate]);

  const handleImageLoad = (id: number) => {
    setLoaded(prev => new Set(prev).add(id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border shadow-card">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 mr-2">
            <div className="h-9 w-9 rounded-xl gradient-hero flex items-center justify-center">
              <Camera className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg hidden sm:inline">Gallery</span>
          </Link>

          {/* Search */}
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search images..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setDark(!dark)}
            className="ml-auto h-9 w-9 rounded-xl bg-muted flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setActiveTag(null); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all duration-300 ${
                activeCategory === cat
                  ? 'gradient-accent text-accent-foreground shadow-glow'
                  : 'bg-muted text-muted-foreground hover:bg-accent/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                activeTag === tag
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-fade-in">
            <ImageIcon className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">No results found</p>
            <p className="text-sm">Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((img, idx) => (
              <div
                key={img.id}
                onClick={() => openLightbox(idx)}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer shadow-card hover:shadow-elevated transition-all duration-500 ${
                  loaded.has(img.id) ? 'animate-fade-in' : 'opacity-0'
                } ${img.id === 7 || img.id === 11 ? 'sm:row-span-2' : ''}`}
              >
                <img
                  src={img.src}
                  alt={img.title}
                  loading="lazy"
                  onLoad={() => handleImageLoad(img.id)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-75"
                  style={{ minHeight: '220px' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-sm font-semibold text-white">{img.title}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {img.tags.slice(0, 3).map(t => (
                      <span key={t} className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">#{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center animate-fade-in"
          onClick={closeLightbox}
        >
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/70 hover:text-white z-50">
            <X className="h-8 w-8" />
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={e => { e.stopPropagation(); navigate(-1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {lightboxIndex < filtered.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); navigate(1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          <div className="max-w-5xl max-h-[85vh] px-4" onClick={e => e.stopPropagation()}>
            <img
              src={filtered[lightboxIndex].src}
              alt={filtered[lightboxIndex].title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="text-center mt-3">
              <p className="text-white font-medium">{filtered[lightboxIndex].title}</p>
              <p className="text-white/50 text-sm">{lightboxIndex + 1} / {filtered.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
