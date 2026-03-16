
import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, Loader2, ArrowRight, Lock, 
  Sprout, Sun, Wind, Snowflake, 
  Zap, Terminal, Cpu, Globe, Mail
} from 'lucide-react';

const SEASONS = [
  { id: 'spring', name: 'Spring', icon: Sprout, color: 'text-emerald-500', bg: 'bg-emerald-50', plants: ['Tulips', 'Lettuce', 'Peas'] },
  { id: 'summer', name: 'Summer', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50', plants: ['Marigolds', 'Tomatoes', 'Zucchini'] },
  { id: 'autumn', name: 'Autumn', icon: Wind, color: 'text-orange-500', bg: 'bg-orange-50', plants: ['Mums', 'Kale', 'Carrots'] },
  { id: 'winter', name: 'Winter', icon: Snowflake, color: 'text-blue-500', bg: 'bg-blue-50', plants: ['Berries', 'Snowdrops', 'Spinach'] },
];

const AutomationPortal: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const startAlerts = async () => {
    if (!userEmail || !selectedSeason) return;
    setLoading(true);
    setLogs([]);
    
    addLog(`Checking connection...`);
    addLog(`System ready.`);
    addLog(`Configuring alerts for: ${userEmail}...`);
    
    try {
      const response = await fetch('/api/send-automation-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, season: SEASONS.find(s => s.id === selectedSeason)?.name })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLoading(false);
        setStep(3);
        addLog(`Alerts are now active. Email sent.`);
      } else {
        setLoading(false);
        addLog(`Error: ${data.error || 'Failed to configure alerts.'}`);
      }
    } catch (error) {
      setLoading(false);
      addLog(`Error: Network issue. Failed to configure alerts.`);
    }
  };

  const currentSeasonData = SEASONS.find(s => s.id === selectedSeason);

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-10 lg:p-12 overflow-y-auto no-scrollbar bg-[#fcfdfd]">
      <div className="w-full max-w-5xl">
        
        <header className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-emerald-50 pb-6 md:pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#021811] rounded-full mb-3">
              <Zap size={10} className="text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">Automation Service</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-emerald-950 tracking-tight leading-tight">Email Alerts</h1>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
               <Globe className="text-emerald-600" size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-black text-emerald-900/40 uppercase tracking-widest">Status</p>
              <p className="text-[10px] font-bold text-emerald-900 truncate">Service Active</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <div className="bg-white border border-emerald-50 rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-12 shadow-xl shadow-emerald-950/5 relative overflow-hidden flex flex-col justify-center min-h-[400px]">
              
              {step === 1 && (
                <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-emerald-950/30 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                      <Mail size={12} /> Your Email Address
                    </label>
                    <input 
                      type="email" 
                      value={userEmail}
                      placeholder="Enter your email"
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-5 py-4 md:px-8 md:py-5 bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl md:rounded-[2rem] font-bold text-emerald-950 outline-none focus:border-emerald-500 transition-all text-sm md:text-lg"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-emerald-950/30 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                      <Sprout size={12} /> Choose Season
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {SEASONS.map((season) => (
                        <button
                          key={season.id}
                          onClick={() => setSelectedSeason(season.id)}
                          className={`p-4 md:p-6 rounded-xl md:rounded-[2rem] border-2 transition-all flex flex-col md:flex-row items-center gap-3 ${
                            selectedSeason === season.id 
                              ? 'border-emerald-500 bg-emerald-950 text-white shadow-xl' 
                              : 'border-emerald-50 bg-white text-emerald-900/40 hover:border-emerald-200'
                          }`}
                        >
                          <season.icon size={20} className={selectedSeason === season.id ? 'text-emerald-400' : ''} />
                          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{season.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={startAlerts}
                    disabled={loading || !selectedSeason || !userEmail}
                    className="w-full py-5 md:py-7 bg-emerald-950 text-emerald-400 font-black rounded-2xl md:rounded-[2rem] hover:bg-black transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-30 shadow-2xl shadow-emerald-950/20"
                  >
                    {loading ? <Loader2 size={24} className="animate-spin" /> : (
                      <>
                        <span className="uppercase tracking-[0.2em] text-[10px] md:text-sm">Enable Email Alerts</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 md:space-y-10 animate-in fade-in zoom-in-95 duration-1000 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 md:w-28 md:h-28 bg-emerald-500 rounded-[2rem] md:rounded-[3rem] flex items-center justify-center text-white shadow-2xl mb-6">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-2xl md:text-4xl font-black text-emerald-950 tracking-tighter uppercase">Alerts Enabled</h3>
                    <p className="text-[10px] font-bold text-emerald-900/40 uppercase tracking-widest">You will now receive updates</p>
                  </div>

                  <div className="bg-emerald-950 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 text-white relative overflow-hidden border border-white/5 text-left">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-white/10 rounded-xl">
                        <Zap size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-emerald-400/60 uppercase tracking-widest">Status</p>
                        <p className="text-base md:text-lg font-black tracking-tight uppercase">Monitoring Active</p>
                      </div>
                    </div>
                    <p className="text-xs text-emerald-100/40 uppercase font-black tracking-widest">Protocol: {currentSeasonData?.name} Updates</p>
                  </div>

                  <button 
                    onClick={() => setStep(1)}
                    className="w-full py-5 bg-emerald-50 text-emerald-900 font-black rounded-2xl md:rounded-[2rem] hover:bg-emerald-100 transition-all uppercase tracking-[0.2em] text-[10px]"
                  >
                    Turn Off Alerts
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-emerald-950 rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl h-full flex flex-col border border-emerald-900/30 min-h-[250px]">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-900/20">
                <div className="flex items-center gap-3">
                  <Terminal size={16} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">System Status</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              
              <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-[9px] md:text-[11px] space-y-3">
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-3 grayscale">
                    <Cpu size={32} />
                    <p className="text-[8px] font-black uppercase tracking-[0.2em]">Awaiting Input</p>
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="leading-relaxed animate-in fade-in slide-in-from-left-2 text-emerald-400/70">
                      <span className="text-emerald-900 mr-2 opacity-50">#</span>
                      {log}
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationPortal;
