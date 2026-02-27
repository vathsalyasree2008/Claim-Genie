import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, MapPin, Mic, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VehicleCard } from './VehicleCard';
import { ClaimSummary } from './ClaimSummary';
import { LocationMap } from './LocationMap';
import { ImageUpload } from './ImageUpload';
import { ProgressTracker } from './ProgressTracker';
import { QuickReplies } from './QuickReplies';
import { DocumentChecklist } from './DocumentChecklist';
import { ClaimHistory } from './ClaimHistory';
import { lookupVehicle, isPolicyExpired, saveClaim, getClaimsByPlate, getSettlementEstimate, getRequiredDocuments, Vehicle, Claim } from '@/data/mockDatabase';
import { detectDamage } from '@/lib/damageDetection';
import { calculateClaimCost, CostBreakdown } from '@/lib/policyEngine';
import { detectFraud, FraudResult } from '@/lib/fraudDetection';
import { extractGeotag, GeotagResult } from '@/lib/exifExtractor';
import ReactMarkdown from 'react-markdown';

type ChatStep =
  | 'welcome'
  | 'awaiting_plate'
  | 'vehicle_found'
  | 'awaiting_otp'
  | 'awaiting_aadhaar'
  | 'otp_verified'
  | 'awaiting_image'
  | 'awaiting_location'
  | 'analyzing'
  | 'results'
  | 'escalation'
  | 'submitted';

interface Message {
  id: string;
  role: 'bot' | 'user';
  text: string;
  component?: React.ReactNode;
  quickReplies?: string[];
}

let msgId = 0;
const newId = () => `msg-${++msgId}`;

// Mock OTP storage
let generatedOTP = '';

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
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addMsg = useCallback((role: 'bot' | 'user', text: string, component?: React.ReactNode, quickReplies?: string[]) => {
    setMessages(prev => [...prev, { id: newId(), role, text, component, quickReplies }]);
  }, []);

  const addBotDelayed = useCallback((text: string, component?: React.ReactNode, quickReplies?: string[], delay = 600) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMsg('bot', text, component, quickReplies);
    }, delay);
  }, [addMsg]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  // Initial welcome
  useEffect(() => {
    if (step === 'welcome') {
      setTimeout(() => {
        addMsg('bot', '👋 Welcome to **ShieldCover AI** — your intelligent motor insurance claim assistant!\n\nI\'ll guide you through the entire claim process. Let\'s start by verifying your vehicle.\n\nPlease enter your **vehicle number plate** to begin.', undefined, ['MH01AB1234', 'DL05CE5678', 'Show test plates']);
        setStep('awaiting_plate');
      }, 500);
    }
  }, [step, addMsg]);

  const processInput = (val: string) => {
    if (!val.trim()) return;
    const text = val.trim();
    setInput('');

    // Context-aware intent parsing
    if (step === 'results' || step === 'awaiting_plate') {
      // Policy Q&A mode
      const lowerText = text.toLowerCase();
      if (vehicle && (lowerText.includes('deductible') || lowerText.includes('what is my deductible'))) {
        addMsg('user', text);
        addBotDelayed(`Your deductible is **₹${vehicle.deductible.toLocaleString('en-IN')}**. This amount is subtracted from the covered amount before final settlement.`);
        return;
      }
      if (vehicle && (lowerText.includes('coverage') || lowerText.includes('how much coverage'))) {
        addMsg('user', text);
        addBotDelayed(`Your policy covers **${vehicle.coveragePercent}%** of the total damage cost, up to a maximum of **₹${vehicle.maxCoverageLimit.toLocaleString('en-IN')}**.`);
        return;
      }
      if (vehicle && (lowerText.includes('policy expire') || lowerText.includes('when does my policy'))) {
        addMsg('user', text);
        addBotDelayed(`Your policy **${vehicle.policyId}** expires on **${vehicle.policyExpiry}**.`);
        return;
      }
      if (vehicle && (lowerText.includes('why') && (lowerText.includes('reduced') || lowerText.includes('less')))) {
        addMsg('user', text);
        addBotDelayed(`Your claim amount may be reduced due to:\n- **Depreciation** applied on parts based on vehicle age\n- **Deductible** of ₹${vehicle.deductible.toLocaleString('en-IN')} subtracted\n- **Coverage limit** of ${vehicle.coveragePercent}% applied\n- **Maximum cap** of ₹${vehicle.maxCoverageLimit.toLocaleString('en-IN')}\n\n${vehicle.addOns.includes('Zero Depreciation') ? '✅ You have Zero Depreciation — no depreciation was deducted!' : '💡 Tip: Adding Zero Depreciation add-on can increase your claim amount.'}`);
        return;
      }
      if (vehicle && (lowerText.includes('previous claim') || lowerText.includes('claim history') || lowerText.includes('show my'))) {
        addMsg('user', text);
        addBotDelayed(`Here are the claims on record for **${vehicle.numberPlate}**:`, <ClaimHistory numberPlate={vehicle.numberPlate} />);
        return;
      }
      if (vehicle && (lowerText.includes('ncb') || lowerText.includes('no claim bonus'))) {
        addMsg('user', text);
        addBotDelayed(`Your current **No Claim Bonus (NCB)** is **${vehicle.ncbPercent}%**.\n\n⚠️ Note: Filing a claim will reset your NCB to 0%. NCB provides a discount on your annual premium renewal.`);
        return;
      }
      if (vehicle && (lowerText.includes('idv') || lowerText.includes('insured declared value'))) {
        addMsg('user', text);
        addBotDelayed(`Your **Insured Declared Value (IDV)** is **₹${vehicle.idvValue.toLocaleString('en-IN')}**.\n\nThis is the maximum amount payable in case of total loss or theft of the vehicle.`);
        return;
      }
      if (vehicle && (lowerText.includes('add-on') || lowerText.includes('addon') || lowerText.includes('add on'))) {
        addMsg('user', text);
        if (vehicle.addOns.length > 0) {
          addBotDelayed(`Your active add-on covers:\n${vehicle.addOns.map(a => `- ✅ **${a}**`).join('\n')}`);
        } else {
          addBotDelayed('You don\'t have any add-on covers. Consider adding **Zero Depreciation** and **Engine Protect** for better coverage.');
        }
        return;
      }
    }

    // Step-based handling
    switch (step) {
      case 'awaiting_plate':
        handlePlateInput(text);
        break;
      case 'awaiting_otp':
        handleOTPInput(text);
        break;
      case 'awaiting_aadhaar':
        handleAadhaarInput(text);
        break;
      case 'awaiting_location':
        handleLocationInput(text);
        break;
      case 'results':
        addMsg('user', text);
        addBotDelayed('I\'m not sure I understood that. You can **Submit Claim**, ask about your policy, or enter a new number plate.\n\nTry asking: "What is my deductible?" or "Show my claim history"', undefined, ['Submit Claim', 'Show my claim history', 'What is my deductible?', 'New Claim']);
        break;
      default:
        addMsg('user', text);
        addBotDelayed('Please follow the current step to proceed. 😊');
        break;
    }
  };

  const handleSend = () => {
    processInput(input);
  };

  const handleQuickReply = (option: string) => {
    if (option === 'Show test plates') {
      addMsg('user', option);
      addBotDelayed('Here are test plates you can use:\n\n- **MH01AB1234** — Maruti Ciaz (0 claims)\n- **DL05CE5678** — Hyundai Creta (1 claim)\n- **KA03MN9012** — Tata Altroz (3 claims, expired)\n- **TN07PQ3456** — Honda City (0 claims)\n- **GJ01RS7890** — Mahindra XUV700 (2 claims)', undefined, ['MH01AB1234', 'DL05CE5678', 'TN07PQ3456']);
      return;
    }
    if (option === 'Submit Claim') {
      handleSubmitClaim();
      return;
    }
    if (option === 'New Claim') {
      setStep('awaiting_plate');
      setVehicle(null);
      setCostBreakdown(null);
      setFraudResult(null);
      addMsg('user', option);
      addBotDelayed('Ready for a new claim. Please enter a vehicle number plate.');
      return;
    }
    if (option === 'Connect to Advisor') {
      handleEscalation();
      return;
    }
    if (option === 'Continue with Claim') {
      addMsg('user', option);
      handleSubmitClaim();
      return;
    }
    processInput(option);
  };

  const handlePlateInput = (plate: string) => {
    addMsg('user', plate);

    // Validate format
    const plateRegex = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{1,4}$/i;
    const normalized = plate.replace(/[\s-]/g, '');
    if (!plateRegex.test(normalized)) {
      addBotDelayed('❌ **Invalid number plate format.**\n\nPlease enter a valid Indian vehicle number plate (e.g., MH01AB1234).', undefined, ['MH01AB1234', 'Show test plates']);
      return;
    }

    const found = lookupVehicle(plate);

    if (!found) {
      addBotDelayed('❌ **Vehicle insurance record not found in database.**\n\nPlease contact support or verify your policy details.\n\nYou can try again with another number plate.', undefined, ['Show test plates']);
      setStep('awaiting_plate');
      return;
    }

    if (isPolicyExpired(found)) {
      addBotDelayed(`⚠️ Policy for **${found.numberPlate}** has **expired** on ${found.policyExpiry}.\n\nClaim submission is blocked. Please renew your policy before filing a claim.`, <VehicleCard vehicle={found} />);
      setStep('awaiting_plate');
      return;
    }

    setVehicle(found);
    addBotDelayed(`✅ Vehicle **${found.numberPlate}** verified!\n\nHello **${found.ownerName}**! Here are your vehicle and policy details:`, <VehicleCard vehicle={found} />);

    // Start OTP verification
    setTimeout(() => {
      generatedOTP = String(Math.floor(100000 + Math.random() * 900000));
      const maskedMobile = found.registeredMobile.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMsg('bot', `🔐 For security verification, we've sent a **6-digit OTP** to your registered mobile **${maskedMobile}**.\n\n_Mock OTP for testing: **${generatedOTP}**_\n\nPlease enter the OTP to proceed.`);
        setStep('awaiting_otp');
      }, 800);
    }, 1200);
  };

  const handleOTPInput = (otp: string) => {
    addMsg('user', `OTP: ${'•'.repeat(otp.length)}`);
    
    if (otp !== generatedOTP) {
      addBotDelayed('❌ **OTP verification failed.** Please recheck the OTP and try again.\n\n_Mock OTP: **' + generatedOTP + '**_');
      return;
    }

    addBotDelayed('✅ **OTP verified successfully!**\n\nFor additional security, please confirm the **last 4 digits of your Aadhaar** (or type "skip" to continue).', undefined, ['skip']);
    setStep('awaiting_aadhaar');
  };

  const handleAadhaarInput = (text: string) => {
    addMsg('user', text.toLowerCase() === 'skip' ? 'Skip' : `Aadhaar: ••••${text}`);

    if (text.toLowerCase() !== 'skip' && vehicle) {
      if (text !== vehicle.aadhaarLast4) {
        addBotDelayed('⚠️ Aadhaar digits do not match our records. Proceeding with caution.\n\nPlease upload an image of the vehicle damage.');
      } else {
        addBotDelayed('✅ **Identity verified!** All checks passed.\n\nPlease upload an image of the vehicle damage to proceed.', undefined, ['🎤 Voice input (coming soon)']);
      }
    } else {
      addBotDelayed('Identity verification skipped.\n\nPlease upload an image of the vehicle damage to proceed.');
    }
    setStep('awaiting_image');
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    addMsg('user', `📷 Uploaded: ${file.name}`);

    const url = URL.createObjectURL(file);
    setImagePreview(url);
    addBotDelayed('Image received! Extracting metadata...', (
      <img src={url} alt="Damage" className="rounded-lg max-h-48 mt-2 border border-border" />
    ));

    const geo = await extractGeotag(file);
    setGeoResult(geo);

    await new Promise(r => setTimeout(r, 1200));

    if (geo.hasGeotag && geo.latitude && geo.longitude) {
      addBotDelayed(`📍 GPS location extracted from image metadata.`, <LocationMap latitude={geo.latitude} longitude={geo.longitude} />);
      setUploading(false);
      setTimeout(() => runAnalysis(geo), 800);
    } else {
      setIsTyping(false);
      addMsg('bot', '⚠️ No GPS metadata found in the image.\n\nPlease enter the **accident location** manually (city, landmark, or address):');
      setUploading(false);
      setStep('awaiting_location');
    }
  };

  const handleLocationInput = (location: string) => {
    addMsg('user', `📍 ${location}`);
    setUserLocation(location);
    const mockLat = 19.076 + (Math.random() - 0.5) * 0.1;
    const mockLng = 72.877 + (Math.random() - 0.5) * 0.1;
    addBotDelayed(`Location noted: **${location}**. Proceeding with damage analysis...`, <LocationMap latitude={mockLat} longitude={mockLng} />);
    setTimeout(() => runAnalysis(geoResult, location), 800);
  };

  const runAnalysis = (geo: GeotagResult | null, manualLocation?: string) => {
    setStep('analyzing');
    addMsg('bot', '🔍 **Analyzing damage with AI...** This may take a moment.\n\n_Detecting damaged parts, assessing severity, calculating costs..._');

    setTimeout(() => {
      if (!vehicle) return;

      const detection = detectDamage();
      const breakdown = calculateClaimCost(detection.parts, vehicle);
      setCostBreakdown(breakdown);

      const fraud = detectFraud({
        vehicle,
        claimAmount: breakdown.totalDamageCost,
        geotagLocation: geo?.hasGeotag ? { lat: geo.latitude!, lng: geo.longitude! } : null,
        userEnteredLocation: manualLocation || userLocation,
        hasGeotag: geo?.hasGeotag ?? false,
        damageSeverities: detection.parts.map(p => p.severity),
      });
      setFraudResult(fraud);

      const hasSevere = detection.parts.some(p => p.severity === 'severe');
      const settlement = getSettlementEstimate(fraud.risk, hasSevere);
      const requiredDocs = getRequiredDocuments(
        detection.parts.map(p => p.severity),
        fraud.risk
      );

      addMsg('bot', '✅ **Analysis complete!** Here is your claim assessment report:', (
        <ClaimSummary
          breakdown={breakdown}
          fraudRisk={fraud.risk}
          fraudScore={fraud.score}
          fraudReasons={fraud.reasons}
          vehicleName={`${vehicle.make} ${vehicle.model} (${vehicle.year})`}
          accidentLocation={manualLocation || userLocation || 'GPS Location'}
          settlementEstimate={settlement}
        />
      ));

      // Document checklist
      setTimeout(() => {
        addMsg('bot', '📄 Based on the damage severity, here are the documents you\'ll need:', <DocumentChecklist documents={requiredDocs} />);

        setTimeout(() => {
          // Escalation check
          const needsEscalation = fraud.risk === 'high' || breakdown.claimableAmount > 200000 || hasSevere;
          
          if (fraud.risk === 'high') {
            addMsg('bot', '🚨 This claim has been **flagged for manual investigation** due to high fraud risk.\n\nOur team will review your case within **24 hours**.');
          }

          if (needsEscalation) {
            addMsg('bot', `⚡ This claim ${breakdown.claimableAmount > 200000 ? `exceeds ₹2,00,000` : 'has elevated risk'}. Would you like to connect with a **human claims advisor** for faster resolution?`, undefined, ['Connect to Advisor', 'Continue with Claim', 'Show my claim history']);
          } else {
            addMsg('bot', `📆 **Estimated settlement: ${settlement}**\n\nClick **Submit Claim** to file, or ask me anything about your policy!`, undefined, ['Submit Claim', 'What is my deductible?', 'Show my claim history', 'Why is my claim reduced?', 'New Claim']);
          }
          setStep('results');
        }, 600);
      }, 500);
    }, 2500);
  };

  const handleEscalation = () => {
    addMsg('user', 'Connect to Advisor');
    setStep('escalation');
    addBotDelayed('📞 **Connecting you to a claims advisor...**\n\n🧑‍💼 **Advisor Ravi Menon** is available.\n\n_"Hello! I can see your claim details. Let me review this for you. I\'ll process this on priority. You should hear from us within 4-6 hours."_\n\n---\n_This is a simulated handover. In production, this connects to a live agent._', undefined, ['Submit Claim', 'New Claim']);
    setTimeout(() => setStep('results'), 100);
  };

  const handleSubmitClaim = () => {
    if (!vehicle || !costBreakdown || !fraudResult) return;

    const hasSevere = costBreakdown.parts.some(p => p.severity === 'severe');
    const settlement = getSettlementEstimate(fraudResult.risk, hasSevere);
    const requiredDocs = getRequiredDocuments(
      costBreakdown.parts.map(p => p.severity),
      fraudResult.risk
    );

    const claim: Claim = {
      claimId: `CLM-${Date.now()}`,
      numberPlate: vehicle.numberPlate,
      detectedParts: costBreakdown.parts,
      totalDamageCost: costBreakdown.totalDamageCost,
      claimableAmount: costBreakdown.claimableAmount,
      fraudRisk: fraudResult.risk,
      fraudScore: fraudResult.score,
      fraudReasons: fraudResult.reasons,
      status: fraudResult.risk === 'high' ? 'under_investigation' : 'pending',
      timestamp: new Date().toISOString(),
      geotagLocation: geoResult?.hasGeotag ? { lat: geoResult.latitude!, lng: geoResult.longitude! } : undefined,
      userEnteredLocation: userLocation || undefined,
      settlementEstimate: settlement,
      requiredDocuments: requiredDocs,
    };

    saveClaim(claim);
    addMsg('user', '✅ Submit Claim');
    addBotDelayed(`🎉 **Claim submitted successfully!**\n\n**Claim ID:** ${claim.claimId}\n**Status:** ${claim.status === 'under_investigation' ? '🔍 Under Investigation' : '⏳ Pending Review'}\n**Claimable Amount:** ₹${claim.claimableAmount.toLocaleString('en-IN')}\n**Est. Settlement:** ${settlement}\n\nYou will receive updates on your registered mobile. Thank you for using ShieldCover AI! 🙏\n\nEnter another number plate to file a new claim.`, undefined, ['New Claim', 'Show my claim history']);

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

  const showInput = step === 'awaiting_plate' || step === 'awaiting_location' || step === 'awaiting_otp' || step === 'awaiting_aadhaar' || step === 'results';
  const showImageUpload = step === 'awaiting_image';
  const showSubmit = step === 'results';

  const getPlaceholder = () => {
    switch (step) {
      case 'awaiting_plate': return 'Enter vehicle number plate (e.g., MH01AB1234)';
      case 'awaiting_otp': return 'Enter 6-digit OTP';
      case 'awaiting_aadhaar': return 'Last 4 digits of Aadhaar (or type "skip")';
      case 'awaiting_location': return 'Enter accident location...';
      case 'results': return 'Ask about your policy or type a command...';
      default: return 'Type a message...';
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-5rem)]">
      {/* Progress Tracker */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <ProgressTracker currentStep={step} />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'bot' && (
              <div className="flex-shrink-0 h-8 w-8 rounded-full gradient-primary flex items-center justify-center shadow-glow">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
              <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-chat-user text-chat-user-foreground rounded-br-md'
                  : 'bg-chat-bot text-chat-bot-foreground rounded-bl-md'
              }`}>
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-strong:text-inherit prose-ul:my-1 prose-li:my-0">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
              {msg.component && <div className="mt-2">{msg.component}</div>}
              {msg.quickReplies && msg.id === messages[messages.length - 1]?.id && (
                <QuickReplies options={msg.quickReplies} onSelect={handleQuickReply} />
              )}
            </div>
            {msg.role === 'user' && (
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {(isTyping || step === 'analyzing') && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex-shrink-0 h-8 w-8 rounded-full gradient-primary flex items-center justify-center shadow-glow">
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
              placeholder={getPlaceholder()}
              className="flex-1"
              type={step === 'awaiting_otp' ? 'password' : 'text'}
              maxLength={step === 'awaiting_otp' ? 6 : step === 'awaiting_aadhaar' ? 4 : undefined}
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
          <div className="flex gap-2 mt-2">
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
                addMsg('bot', 'Ready for a new claim. Please enter a vehicle number plate.', undefined, ['Show test plates']);
              }}
            >
              New Claim
            </Button>
          </div>
        )}

        <div className="mt-2 text-xs text-muted-foreground text-center flex items-center justify-center gap-3">
          <span>Powered by ShieldCover AI</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Mic className="h-3 w-3" /> Voice (coming soon)</span>
        </div>
      </div>
    </div>
  );
}
