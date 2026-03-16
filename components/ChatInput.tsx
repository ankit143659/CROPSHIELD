
import React, { useState, useRef } from 'react';
import { Send, Camera, Image as ImageIcon, X, Loader2, Sparkles, Command, Mic, Square, AlertTriangle } from 'lucide-react';
import CameraModal from './CameraModal';

interface ChatInputProps {
  onSend: (message: string, image?: { mimeType: string, data: string, url: string }) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ mimeType: string, data: string, url: string } | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          mimeType: file.type,
          data: (reader.result as string).split(',')[1],
          url: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (dataUrl: string) => {
    setSelectedImage({
      mimeType: 'image/jpeg',
      data: dataUrl.split(',')[1],
      url: dataUrl
    });
  };

  const toggleListening = () => {
    setVoiceError(null);

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setVoiceError("Voice input is not supported in this browser.");
      setTimeout(() => setVoiceError(null), 3000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => {
          const spacer = prev && !prev.endsWith(' ') ? ' ' : '';
          return prev + spacer + transcript;
        });
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error === 'network') {
          setVoiceError("Network Error: Check internet connection.");
        } else if (event.error === 'not-allowed') {
          setVoiceError("Access Denied: Check microphone permissions.");
        } else {
          setVoiceError("Voice input failed. Please type.");
        }
        setTimeout(() => setVoiceError(null), 4000);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setVoiceError("Could not start microphone.");
      setTimeout(() => setVoiceError(null), 3000);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((input.trim() || selectedImage) && !disabled) {
      onSend(input.trim() || "Analyze this photo.", selectedImage || undefined);
      setInput('');
      setSelectedImage(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-8 pt-10 bg-gradient-to-t from-[#fcfdfd] via-[#fcfdfd] to-transparent pointer-events-none z-30">
      {showCamera && <CameraModal onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />}
      
      <div className="max-w-4xl mx-auto pointer-events-auto">
        {voiceError && (
          <div className="mb-2 mx-auto w-fit flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full border border-red-100 shadow-sm animate-in slide-in-from-bottom-2 fade-in">
             <AlertTriangle size={14} />
             <span className="text-[10px] font-bold uppercase tracking-wide">{voiceError}</span>
             <button onClick={() => setVoiceError(null)} className="ml-2 hover:bg-red-100 rounded-full p-0.5"><X size={12} /></button>
          </div>
        )}

        {selectedImage && (
          <div className="mb-3 md:mb-6 flex items-center p-3 md:p-4 bg-white/80 backdrop-blur-2xl rounded-2xl md:rounded-3xl border border-emerald-100 w-fit shadow-xl animate-in slide-in-from-bottom-4">
            <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-xl md:rounded-2xl overflow-hidden border-2 md:border-4 border-white shadow-md">
              <img src={selectedImage.url} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-1 right-1 p-1 bg-emerald-950 text-white rounded-full hover:bg-black"
              >
                <X size={10} strokeWidth={3} />
              </button>
            </div>
            <div className="ml-3 md:ml-5 pr-4 md:pr-10">
              <p className="text-[10px] md:text-xs font-black text-emerald-950 uppercase tracking-widest flex items-center gap-2 text-nowrap">
                <Sparkles size={14} className="text-emerald-500 md:w-[16px]" />
                Photo Uploaded
              </p>
              <p className="text-[8px] md:text-[9px] text-emerald-600/50 uppercase tracking-[0.2em] font-black mt-0.5">Ready to analyze</p>
            </div>
          </div>
        )}

        <div className="relative">
          <div className={`flex items-center gap-1 bg-white border shadow-xl rounded-[2rem] md:rounded-[3rem] p-1.5 md:p-2 pr-2 md:pr-4 pl-2 md:pl-4 transition-all duration-500 group ${voiceError ? 'border-red-200' : 'border-emerald-50 focus-within:border-emerald-500'}`}>
            <div className="flex items-center gap-0 md:gap-1">
              <button 
                type="button"
                onClick={() => setShowCamera(true)}
                className="p-3 md:p-4 text-emerald-600 hover:bg-emerald-50 rounded-full active:scale-90 transition-colors focus:outline-none"
                title="Camera"
              >
                <Camera size={20} className="md:w-[22px]" />
              </button>
              
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 md:p-4 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full active:scale-90 transition-colors focus:outline-none"
                title="Upload Photo"
              >
                <ImageIcon size={20} className="md:w-[22px]" />
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </button>
            </div>
            
            <div className="w-[1px] h-8 md:h-10 bg-emerald-50 mx-1 md:mx-2" />

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Ask a question..."}
              rows={1}
              className={`flex-1 bg-transparent border-none focus:ring-0 outline-none text-sm md:text-[15px] font-bold py-3 md:py-4 placeholder-emerald-950/20 text-emerald-950 resize-none no-scrollbar transition-opacity ${isListening ? 'animate-pulse opacity-50' : ''}`}
              disabled={disabled}
            />

            <button
              type="button"
              onClick={toggleListening}
              className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300 shrink-0 focus:outline-none mr-2 ${
                isListening 
                  ? 'bg-red-50 text-red-500 animate-pulse' 
                  : 'text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600'
              }`}
              title={isListening ? "Stop Recording" : "Speak"}
            >
              {isListening ? <Square size={16} fill="currentColor" /> : <Mic size={20} className="md:w-[22px]" />}
            </button>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={( !input.trim() && !selectedImage ) || disabled}
              className={`flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full transition-all duration-500 shrink-0 focus:outline-none ${
                (input.trim() || selectedImage) && !disabled
                  ? 'bg-emerald-950 text-emerald-400 shadow-lg hover:scale-105 active:scale-95'
                  : 'bg-emerald-50 text-emerald-100 cursor-not-allowed'
              }`}
            >
              {disabled ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="md:w-[24px]" strokeWidth={2.5} />}
            </button>
          </div>
          
          <div className="hidden md:flex justify-center gap-8 mt-5 opacity-40">
             {[
               { label: 'Check Disease', icon: Command },
               { label: 'Identify Plant', icon: Command }
             ].map(tag => (
               <button 
                 key={tag.label}
                 type="button"
                 onClick={() => setInput(prev => (prev ? prev + ', ' : '') + tag.label)}
                 className="flex items-center gap-2 text-[9px] font-black text-emerald-900 hover:text-emerald-500 uppercase tracking-[0.2em] transition-all focus:outline-none"
               >
                 <tag.icon size={12} />
                 {tag.label}
               </button>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
