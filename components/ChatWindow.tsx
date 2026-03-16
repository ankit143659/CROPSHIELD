
import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Message } from '../types';
import { Sprout, Camera, ShieldAlert, HelpCircle } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 md:px-12 lg:px-20 py-6 md:py-10 bg-[#fcfdfd] no-scrollbar scroll-smooth relative"
    >
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center select-none animate-in fade-in zoom-in-95 duration-500 relative z-10 px-4">
          <div className="w-20 h-20 md:w-28 md:h-28 bg-[#f0f7f4] rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center mb-6 md:mb-8 border border-emerald-100 shadow-sm">
            <Sprout size={32} className="text-emerald-600 animate-leaf md:w-[48px]" />
          </div>
          
          <h2 className="text-2xl md:text-4xl font-black text-emerald-950 mb-3 md:mb-4 tracking-tighter">CropShield AI</h2>
          <p className="max-w-md text-[11px] md:text-sm text-emerald-900/40 font-bold leading-relaxed mb-8 md:mb-12 uppercase tracking-wide">
            Protect your crops. Identify diseases and get expert advice instantly.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 w-full max-w-3xl">
             {[
               { title: "Scan Crop", desc: "Identify via photo", icon: <Camera className="text-emerald-500" /> },
               { title: "Diagnosis", desc: "Disease Check", icon: <ShieldAlert className="text-amber-500" /> },
               { title: "Solutions", desc: "Expert tips", icon: <HelpCircle className="text-blue-500" /> }
             ].map(item => (
               <div key={item.title} className="p-5 md:p-8 bg-white border border-emerald-50 rounded-2xl md:rounded-[2rem] flex flex-col items-center text-center gap-2 md:gap-3 hover:border-emerald-300 transition-all cursor-default shadow-sm group">
                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                   {item.icon}
                 </div>
                 <h4 className="text-xs md:text-sm font-black text-emerald-950">{item.title}</h4>
                 <p className="text-[9px] md:text-[10px] font-black text-emerald-900/30 uppercase tracking-widest">{item.desc}</p>
               </div>
             ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-4 relative z-10 max-w-4xl mx-auto">
          {messages.map((msg) => (
            <MessageBubble 
              key={msg.id} 
              role={msg.role} 
              content={msg.content} 
              timestamp={msg.timestamp} 
              imageUrl={msg.imageUrl}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-12">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1 px-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                  <span className="text-[9px] md:text-[10px] font-bold text-emerald-600 uppercase tracking-widest italic">Analyzing Crop...</span>
                </div>
                <div className="bg-white border border-emerald-100 p-6 md:p-8 rounded-2xl md:rounded-[2rem] rounded-tl-none text-emerald-900/40 w-full max-w-[150px] shadow-md">
                   <div className="flex gap-1.5">
                     <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                     <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-100"></div>
                     <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-200"></div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="h-40 md:h-48" />
    </div>
  );
};

export default ChatWindow;
