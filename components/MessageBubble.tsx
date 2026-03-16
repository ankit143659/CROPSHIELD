
import React from 'react';
import { Role } from '../types';
import { UserCircle, ShieldCheck, Heart, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  role: Role;
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content, timestamp, imageUrl }) => {
  const isUser = role === 'user';

  return (
    <div className={`flex w-full mb-10 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col w-full max-w-[95%] lg:max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-3 mb-2 px-2">
          {!isUser ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center shadow-md">
                <Shield size={16} className="text-white" fill="currentColor" />
              </div>
              <span className="text-[11px] font-black text-emerald-900 uppercase tracking-widest">
                CropShield AI
              </span>
              <div className="flex items-center gap-1 ml-3 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                <ShieldCheck size={10} className="text-emerald-500" />
                <span className="text-[9px] font-bold text-emerald-700 uppercase">Expert Analysis</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
               <span className="text-[11px] font-black text-emerald-900/40 uppercase tracking-widest">
                Your Message
              </span>
              <UserCircle size={18} className="text-emerald-500" />
            </div>
          )}
        </div>
        
        <div
          className={`relative p-8 rounded-[2.5rem] border transition-all duration-300 ${
            isUser
              ? 'bg-[#021811] text-white rounded-tr-none border-[#010a08] shadow-lg'
              : 'bg-white text-emerald-950 rounded-tl-none border-emerald-100 shadow-sm'
          }`}
        >
          {imageUrl && (
            <div className="mb-6 rounded-2xl overflow-hidden border-2 border-white shadow-xl max-w-sm">
              <img src={imageUrl} alt="Uploaded" className="w-full h-auto object-cover" />
              <div className="bg-emerald-50 px-3 py-2 text-[9px] font-bold text-emerald-700 uppercase tracking-widest text-center">
                 Crop Photo
              </div>
            </div>
          )}
          <div className="markdown-content text-[15px] leading-relaxed font-medium">
            {isUser ? (
              <p className="whitespace-pre-wrap">{content}</p>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            )}
          </div>
          
          <div className={`mt-6 pt-4 border-t ${isUser ? 'border-white/5' : 'border-emerald-50'} flex items-center justify-between`}>
            {!isUser && (
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Heart size={12} className="text-red-400 fill-red-400" />
                    <span className="text-[10px] font-bold text-emerald-800/60 uppercase">AI Verified</span>
                  </div>
               </div>
            )}
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isUser ? 'text-white/20' : 'text-emerald-900/20'}`}>
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
