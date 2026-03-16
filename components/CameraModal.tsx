
import React, { useRef, useState, useEffect } from 'react';
import { X, Camera as CameraIcon, AlertCircle, RotateCcw } from 'lucide-react';

interface CameraModalProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        const constraints = { 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }, 
          audio: false 
        };
        
        const s = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(s);
        
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.setAttribute('muted', 'true');
          
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => setIsReady(true)).catch(e => console.error("Play error:", e));
          };
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        setError("Please allow camera access in your browser settings.");
      }
    }
    
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const capture = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (videoRef.current && canvasRef.current && isReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onCapture(dataUrl);
        if (stream) stream.getTracks().forEach(t => t.stop());
        onClose();
      }
    }
  };

  const handleClose = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black backdrop-blur-md">
      <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 h-20 px-6 flex items-center justify-between z-[2010] bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Camera</span>
            <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Photo Analysis</span>
          </div>
          <button 
            onClick={handleClose}
            className="p-4 bg-white/10 hover:bg-red-500/20 text-white rounded-2xl border border-white/10 active:scale-90 transition-all pointer-events-auto"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center gap-8 max-w-sm">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 border border-red-500/20">
               <AlertCircle size={40} />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Camera Error</h3>
              <p className="text-white/40 text-sm font-bold uppercase tracking-wider leading-relaxed">{error}</p>
            </div>
            <button 
              onClick={handleClose} 
              className="w-full py-4 bg-white text-black font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover" 
            />
            
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-64 h-64 border-2 border-white/20 rounded-3xl relative">
                 <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 -mt-1 -ml-1 rounded-tl-lg" />
                 <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 -mt-1 -mr-1 rounded-tr-lg" />
                 <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 -mb-1 -ml-1 rounded-bl-lg" />
                 <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 -mb-1 -mr-1 rounded-br-lg" />
              </div>
              <p className="mt-8 text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Center the plant in the frame</p>
            </div>
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Shutter Button Container */}
        <div className="absolute bottom-0 inset-x-0 h-40 flex items-center justify-center gap-12 z-[2010] bg-gradient-to-t from-black/60 to-transparent">
          <div className="w-16 h-16" />
          
          <button 
            onClick={capture} 
            disabled={!isReady || !!error}
            className={`group relative p-8 rounded-full transition-all duration-300 pointer-events-auto active:scale-90 ${
              isReady ? 'bg-emerald-500 text-emerald-950 scale-110 shadow-[0_0_50px_rgba(16,185,129,0.3)]' : 'bg-white/10 text-white/20 scale-100'
            }`}
          >
            <CameraIcon size={42} strokeWidth={2.5} />
            {isReady && <div className="absolute inset-[-8px] border-4 border-emerald-500/20 rounded-full animate-ping opacity-20" />}
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className="p-4 bg-white/10 text-white rounded-2xl border border-white/10 active:scale-90 transition-all pointer-events-auto"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
