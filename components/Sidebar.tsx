
import React from 'react';
import { 
  Plus, LogOut as LogOutIcon, 
  History, 
  MessageSquare,
  Cpu,
  Shield,
  Sprout
} from 'lucide-react';
import { ChatSession } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  currentView: 'diagnostic' | 'automation';
  onSetView: (view: 'diagnostic' | 'automation') => void;
  automationEnabled: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  activeSessionId, 
  onNewChat, 
  onSelectSession, 
  currentView, 
  onSetView,
}) => {
  const { currentUser, signOut } = useAuth();

  return (
    <div className="w-full h-full flex flex-col bg-emerald-950 text-white border-r border-emerald-900/40 relative overflow-hidden">
      
      {/* Brand Header */}
      <div className="p-6 md:p-8 pb-4 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group">
            <Shield size={24} className="text-emerald-950 absolute" strokeWidth={2.5} />
            <Sprout size={14} className="text-emerald-950 absolute mt-1" strokeWidth={3} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight leading-none text-white uppercase">CropShield</span>
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-1">AI Crop Protection</span>
          </div>
        </div>

        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black rounded-2xl transition-all shadow-xl active:scale-95"
        >
          <Plus size={16} strokeWidth={3} />
          <span className="text-[10px] uppercase tracking-wider">New Analysis</span>
        </button>
      </div>

      {/* Navigation Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 space-y-6 relative z-10">
        
        {/* Core Menu */}
        <div className="space-y-1.5">
          <button 
            onClick={() => onSetView('diagnostic')}
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${currentView === 'diagnostic' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
          >
            <MessageSquare size={16} />
            <span>Crop Doctor</span>
          </button>
          <button 
            onClick={() => onSetView('automation')}
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${currentView === 'automation' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
          >
            <Cpu size={16} />
            <span>Shield Alerts</span>
          </button>
        </div>

        {/* History Area */}
        <div>
          <div className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em] px-3 mb-3">
            Recent Reports
          </div>
          <div className="space-y-1">
            {sessions.length === 0 ? (
              <p className="px-4 py-4 text-[9px] text-white/10 font-bold uppercase tracking-widest italic">No reports yet...</p>
            ) : (
              sessions.slice(0, 10).map((session) => (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[10px] transition-all text-left uppercase font-bold tracking-widest ${
                    activeSessionId === session.id && currentView === 'diagnostic'
                      ? 'bg-emerald-500/5 text-emerald-400 border border-emerald-500/10'
                      : 'text-white/20 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <History size={14} className="opacity-40 shrink-0" />
                  <span className="truncate">{session.title}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Identity Card */}
      <div className="p-6 mt-auto border-t border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-lg shrink-0">
            {currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-white truncate uppercase tracking-tighter">{currentUser?.displayName || 'User'}</p>
            <p className="text-[8px] text-emerald-400/40 truncate font-bold uppercase tracking-widest">{currentUser?.email}</p>
          </div>
        </div>

        <button 
          onClick={() => signOut()}
          className="w-full py-4 flex items-center justify-center gap-2 bg-emerald-500 text-emerald-950 rounded-xl hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 group"
        >
          <LogOutIcon size={14} className="group-hover:rotate-12 transition-transform" />
          Logout
        </button>
      </div>

      <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
    </div>
  );
};

export default Sidebar;
