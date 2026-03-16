
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Leaf, Mail, Lock, User, ArrowRight, 
  Loader2, AlertTriangle, ShieldCheck, Shield, Sprout, KeyRound
} from 'lucide-react';

const AuthPortal: React.FC = () => {
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<{message: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        if (!name.trim()) {
          setError({ message: "Please enter your name." });
          setLoading(false);
          return;
        }

        if (!showOTP) {
          // Send OTP
          const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name })
          });
          
          const data = await response.json();
          if (data.success) {
            setShowOTP(true);
          } else {
            setError({ message: data.error || "Failed to send OTP." });
          }
        } else {
          // Verify OTP
          if (!otp.trim()) {
            setError({ message: "Please enter the OTP." });
            setLoading(false);
            return;
          }
          
          const response = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
          });
          
          const data = await response.json();
          if (data.success) {
            await register(email, password, name);
          } else {
            setError({ message: data.error || "Invalid OTP." });
          }
        }
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      let msg = isRegistering ? "Registration failed." : "Login failed.";
      if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
      else if (err.code === 'auth/user-not-found') msg = "Account not found.";
      else if (err.code === 'auth/email-already-in-use') msg = "Email already in use.";
      setError({ message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fbf9] overflow-hidden text-emerald-950 font-sans">
      <div className="hidden lg:flex w-[50%] bg-[#021811] relative overflow-hidden items-center justify-center p-24">
        <div className="absolute inset-0 z-0">
           <img 
             src="https://images.unsplash.com/photo-1625246333195-5848c4282185?q=80&w=2000&auto=format&fit=crop" 
             className="w-full h-full object-cover opacity-10"
             alt="Agriculture"
           />
           <div className="absolute inset-0 bg-gradient-to-tr from-[#021811] via-transparent to-[#021811]/60"></div>
        </div>

        <div className="relative z-10 text-white space-y-12">
           <div className="flex items-center gap-5">
              <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.3)] relative overflow-hidden">
                 <Shield size={48} className="text-[#021811] absolute" strokeWidth={2} />
                 <Sprout size={28} className="text-[#021811] absolute mt-2" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-6xl font-black tracking-tighter block leading-none">CROP<br/>SHIELD</h1>
              </div>
           </div>
           
           <div className="space-y-6 max-w-lg">
              <h2 className="text-3xl font-bold text-emerald-50 leading-tight tracking-tight">Advanced Crop Protection & Analysis.</h2>
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 w-fit">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Secure Agriculture Node</span>
              </div>
              <p className="text-emerald-100/40 text-lg font-medium leading-relaxed">
                Protect your harvest. Identify diseases, optimize growth, and automate seasonal monitoring with AI.
              </p>
           </div>
        </div>
      </div>

      <div className="w-full lg:w-[50%] flex items-center justify-center p-6 md:p-12 relative overflow-y-auto no-scrollbar">
        <div className="w-full max-w-md space-y-10">
          
          <div className="text-center lg:text-left space-y-3">
            <h3 className="text-4xl font-black tracking-tighter uppercase">
              {isRegistering ? (showOTP ? 'Verify Email' : 'Sign Up') : 'Login'}
            </h3>
            <p className="text-emerald-900/30 text-[10px] font-black uppercase tracking-[0.3em]">
              {isRegistering ? (showOTP ? 'Enter the code sent to your email' : 'Create account to protect crops') : 'Welcome back to CropShield'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegistering && !showOTP && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[9px] font-black text-emerald-900/40 uppercase tracking-[0.3em] ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-200 group-focus-within:text-emerald-600 transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white border border-emerald-50 rounded-2xl focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold transition-all shadow-sm"
                    placeholder="Your Name"
                  />
                </div>
              </div>
            )}

            {!showOTP && (
              <>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-emerald-900/40 uppercase tracking-[0.3em] ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-200 group-focus-within:text-emerald-600 transition-colors" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-white border border-emerald-50 rounded-2xl focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold transition-all shadow-sm"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-emerald-900/40 uppercase tracking-[0.3em] ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-200 group-focus-within:text-emerald-600 transition-colors" size={18} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-white border border-emerald-50 rounded-2xl focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold transition-all shadow-sm"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>
              </>
            )}

            {showOTP && (
              <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
                <label className="text-[9px] font-black text-emerald-900/40 uppercase tracking-[0.3em] ml-1">Verification Code</label>
                <div className="relative group">
                  <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-200 group-focus-within:text-emerald-600 transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white border border-emerald-50 rounded-2xl focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold transition-all shadow-sm tracking-[0.5em] text-center"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[10px] font-black flex items-start gap-3 text-red-600 animate-in slide-in-from-top-1">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span className="leading-normal">{error.message.toUpperCase()}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-[#021811] text-emerald-400 font-black rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 shadow-2xl shadow-emerald-950/20"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span className="uppercase tracking-[0.2em]">{isRegistering ? (showOTP ? 'Verify & Register' : 'Send OTP') : 'Login'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-8 border-t border-emerald-50">
            <button
              onClick={() => { 
                setIsRegistering(!isRegistering); 
                setShowOTP(false);
                setError(null); 
              }}
              className="text-[10px] font-black text-emerald-950/40 hover:text-emerald-950 transition-colors uppercase tracking-[0.3em]"
            >
              {isRegistering ? 'Already have an account? Login' : 'New here? Sign up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPortal;
