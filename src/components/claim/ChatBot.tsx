import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VehicleCard } from './VehicleCard';
import { ClaimSummary } from './ClaimSummary';
import { LocationMap } from './LocationMap';
import { ImageUpload } from './ImageUpload';
import { lookupVehicle, isPolicyExpired, saveClaim, Vehicle, Claim } from '@/data/mockDatabase';
import { detectDamage } from '@/lib/damageDetection';
import { calculateClaimCost, CostBreakdown } from '@/lib/policyEngine';
import { detectFraud, FraudResult } from '@/lib/fraudDetection';
import { extractGeotag, GeotagResult } from '@/lib/exifExtractor';

type ChatStep =
  | 'welcome'
  | 'awaiting_plate'
  | 'vehicle_found'
  | 'awaiting_image'
  | 'awaiting_location'
  | 'analyzing'
  | 'results'
  | 'submitted';

interface Message {
  id: string;
  role: 'bot' | 'user';
  text: string;
  component?: React.ReactNode;
}

let msgId = 0;
const newId = () => `msg-${++msgId}`;

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<ChatStep>('welcome');
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [geoResult, setGeoResult] = useState<GeotagResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [fraudResult, setFraudResult] = useState<FraudResult | null>(null);
  const [userLocation, setUserLocation] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addMsg = useCallback((role: 'bot' | 'user', text: string, component?: React.ReactNode) => {
    setMessages(prev => [...prev, { id: newId(), role, text, component }]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Initial welcome
  useEffect(() => {
    if (step === 'welcome') {
      setTimeout(() => {
        addMsg('bot', 'Welcome to **ShieldCover AI** — your intelligent motor insurance claim assistant. 🚗\n\nPlease enter your vehicle number plate to begin.');
        setStep('awaiting_plate');
      }, 500);
    }
  }, [step, addMsg]);

  const handleSend = () => {
    const val = input.trim();
    if (!val) return;
    setInput('');

    if (step === 'awaiting_plate') {
      handlePlateInput(val);
    } else if (step === 'awaiting_location') {
      handleLocationInput(val);
    }
  };

  const handlePlateInput = (plate: string) => {
    addMsg('user', plate);
    const found = lookupVehicle(plate);

    if (!found) {
      addMsg('bot', '❌ **Vehicle insurance record not found in database.**\n\nPlease contact support or verify your policy details.\n\nYou can try again with another number plate.');
      setStep('awaiting_plate');
      return;
    }

    if (isPolicyExpired(found)) {
      addMsg('bot', '⚠️ Your policy has **expired**. Claim submission is blocked.\n\nPlease renew your policy before filing a claim.', <VehicleCard vehicle={found} />);
      setStep('awaiting_plate');
      return;
    }

    setVehicle(found);
    addMsg('bot', `✅ Vehicle **${found.numberPlate}** verified! Here are your details:`, <VehicleCard vehicle={found} />);

    setTimeout(() => {
      addMsg('bot', 'Please upload an image of the vehicle damage to proceed with the claim.');
      setStep('awaiting_image');
    }, 800);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    addMsg('user', `📷 Uploaded: ${file.name}`);

    // Show image preview
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    addMsg('bot', 'Image received. Extracting metadata...', (
      <img src={url} alt="Damage" className="rounded-lg max-h-48 mt-2 border border-border" />
    ));

    // Extract EXIF
    const geo = await extractGeotag(file);
    setGeoResult(geo);

    await new Promise(r => setTimeout(r, 1000));

    if (geo.hasGeotag && geo.latitude && geo.longitude) {
      addMsg('bot', `📍 GPS location extracted from image metadata.`, <LocationMap latitude={geo.latitude} longitude={geo.longitude} />);
      setUploading(false);
      runAnalysis(geo);
    } else {
      addMsg('bot', '⚠️ No GPS metadata found in the image.\n\nPlease enter the accident location manually (city or address):');
      setUploading(false);
      setStep('awaiting_location');
    }
  };

  const handleLocationInput = (location: string) => {
    addMsg('user', `📍 ${location}`);
    setUserLocation(location);
    // Generate a mock location for display
    const mockLat = 19.076 + (Math.random() - 0.5) * 0.1;
    const mockLng = 72.877 + (Math.random() - 0.5) * 0.1;
    addMsg('bot', 'Location noted. Proceeding with damage analysis...', <LocationMap latitude={mockLat} longitude={mockLng} />);
    runAnalysis(geoResult, location);
  };

  const runAnalysis = (geo: GeotagResult | null, manualLocation?: string) => {
    setStep('analyzing');
    addMsg('bot', '🔍 **Analyzing damage...** Please wait.');

    setTimeout(() => {
      if (!vehicle) return;

      // Detect damage
      const detection = detectDamage();
      
      // Calculate costs
      const breakdown = calculateClaimCost(detection.parts, vehicle);
      setCostBreakdown(breakdown);

      // Fraud detection
      const fraud = detectFraud({
        vehicle,
        claimAmount: breakdown.totalDamageCost,
        geotagLocation: geo?.hasGeotag ? { lat: geo.latitude!, lng: geo.longitude! } : null,
        userEnteredLocation: manualLocation || userLocation,
        hasGeotag: geo?.hasGeotag ?? false,
        damageSeverities: detection.parts.map(p => p.severity),
      });
      setFraudResult(fraud);

      addMsg('bot', '✅ **Analysis complete!** Here is your claim summary:', (
        <ClaimSummary
          breakdown={breakdown}
          fraudRisk={fraud.risk}
          fraudScore={fraud.score}
          fraudReasons={fraud.reasons}
        />
      ));

      setTimeout(() => {
        if (fraud.risk === 'high') {
          addMsg('bot', '🚨 This claim has been **flagged for manual investigation** due to high fraud risk. A claims officer will review your case.');
        }
        addMsg('bot', 'Click **Submit Claim** to file this claim, or enter a new number plate to start over.');
        setStep('results');
      }, 600);
    }, 2000);
  };

  const handleSubmitClaim = () => {
    if (!vehicle || !costBreakdown || !fraudResult) return;

    const claim: Claim = {
      claimId: `CLM-${Date.now()}`,
      numberPlate: vehicle.numberPlate,
      detectedParts: costBreakdown.parts,
      totalDamageCost: costBreakdown.totalDamageCost,
      claimableAmount: costBreakdown.claimableAmount,
      fraudRisk: fraudResult.risk,
      fraudReasons: fraudResult.reasons,
      status: fraudResult.risk === 'high' ? 'under_investigation' : 'pending',
      timestamp: new Date().toISOString(),
      geotagLocation: geoResult?.hasGeotag ? { lat: geoResult.latitude!, lng: geoResult.longitude! } : undefined,
      userEnteredLocation: userLocation || undefined,
    };

    saveClaim(claim);
    addMsg('user', 'Submit Claim');
    addMsg('bot', `🎉 **Claim submitted successfully!**\n\n**Claim ID:** ${claim.claimId}\n**Status:** ${claim.status === 'under_investigation' ? 'Under Investigation' : 'Pending Review'}\n**Claimable Amount:** ₹${claim.claimableAmount.toLocaleString('en-IN')}\n\nYou will receive updates on your registered contact. Enter another number plate to file a new claim.`);

    setStep('awaiting_plate');
    setVehicle(null);
    setCostBreakdown(null);
    setFraudResult(null);
    setGeoResult(null);
    setImagePreview(null);
    setUserLocation('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const showInput = step === 'awaiting_plate' || step === 'awaiting_location';
  const showImageUpload = step === 'awaiting_image';
  const showSubmit = step === 'results';

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-5rem)]">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'bot' && (
              <div className="flex-shrink-0 h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
              <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-chat-user text-chat-user-foreground rounded-br-md'
                  : 'bg-chat-bot text-chat-bot-foreground rounded-bl-md'
              }`}>
                {msg.text.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
                    {line.split(/(\*\*.*?\*\*)/).map((seg, j) =>
                      seg.startsWith('**') && seg.endsWith('**')
                        ? <strong key={j}>{seg.slice(2, -2)}</strong>
                        : seg
                    )}
                  </p>
                ))}
              </div>
              {msg.component && <div className="mt-2">{msg.component}</div>}
            </div>
            {msg.role === 'user' && (
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {step === 'analyzing' && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex-shrink-0 h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="bg-chat-bot rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" />
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: '0.3s' }} />
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        {showInput && (
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={step === 'awaiting_plate' ? 'Enter vehicle number plate (e.g., MH01AB1234)' : 'Enter accident location...'}
              className="flex-1"
            />
            <Button onClick={handleSend} size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {step === 'awaiting_location' ? <MapPin className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        )}

        {showImageUpload && (
          <ImageUpload onUpload={handleImageUpload} uploading={uploading} />
        )}

        {showSubmit && (
          <div className="flex gap-2">
            <Button onClick={handleSubmitClaim} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
              ✅ Submit Claim
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStep('awaiting_plate');
                setVehicle(null);
                setCostBreakdown(null);
                setFraudResult(null);
                addMsg('bot', 'Ready for a new claim. Please enter a vehicle number plate.');
              }}
            >
              New Claim
            </Button>
          </div>
        )}

        <div className="mt-2 text-xs text-muted-foreground text-center">
          Test plates: MH01AB1234, DL05CE5678, KA03MN9012, TN07PQ3456, GJ01RS7890
        </div>
      </div>
    </div>
  );
}
