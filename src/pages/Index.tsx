import { Shield, Car } from 'lucide-react';
import { ChatBot } from '@/components/claim/ChatBot';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground px-4 py-4 shadow-elevated">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-accent/20 backdrop-blur-sm">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold tracking-tight flex items-center gap-2">
              ShieldCover AI
              <span className="text-xs font-sans font-normal bg-accent/20 px-2 py-0.5 rounded-full">
                Motor Claims
              </span>
            </h1>
            <p className="text-xs text-primary-foreground/70">AI-Powered Insurance Claim Assistant</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-primary-foreground/60">
            <Car className="h-4 w-4" />
            <span className="hidden sm:inline">Motor Insurance</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full">
        <ChatBot />
      </main>
    </div>
  );
};

export default Index;
