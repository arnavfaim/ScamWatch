
import React, { useState, useEffect, useRef } from 'react';
import { Mail, ShieldCheck, ArrowRight, Lock, X, RefreshCw, Info, Key, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, role: string) => void;
  type: 'login' | 'verify';
  targetAction?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, type, targetAction }) => {
  const [step, setStep] = useState<'email' | 'password' | 'otp'>(type === 'login' ? 'email' : 'otp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [googleVerified, setGoogleVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (type === 'verify' && isOpen) {
      handleSendOtp();
    }
    if (!isOpen) {
      setOtp(['', '', '', '', '', '']);
      setGoogleVerified(false);
    }
  }, [type, isOpen]);

  if (!isOpen) return null;

  const handleNextToPassword = () => {
    if (!email) return;
    setStep('password');
  };

  const handleLogin = () => {
    if (email === 'admin@sotorko.com' && password !== 'Admin786@') {
      alert("Invalid admin password!");
      return;
    }
    handleSendOtp();
  };

  const handleSendOtp = () => {
    setLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 8000);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }, 800);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    const digit = value.substring(value.length - 1);
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    e.preventDefault();
  };

  const handleVerify = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp === generatedOtp) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onSuccess(email, ''); // Role logic handled in App
        onClose();
        setOtp(['', '', '', '', '', '']);
        setStep('email');
      }, 600);
    } else {
      alert("Invalid verification code. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      {showNotification && (
        <div className="fixed top-6 right-6 w-80 bg-white border-l-4 border-indigo-500 shadow-2xl rounded-lg p-4 animate-in slide-in-from-right-10 duration-500 z-[110]">
          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 p-2 rounded-full">
              <Mail className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inbox (1 New)</p>
              <p className="text-sm font-bold text-slate-900">Your Verification Code</p>
              <p className="text-xs text-slate-600 mt-1">
                Your code is: <span className="font-mono font-black text-indigo-600 text-base">{generatedOtp}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
        <div className="p-8 text-center border-b border-slate-100">
          <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {type === 'login' ? <Lock className="h-8 w-8 text-indigo-600" /> : <ShieldCheck className="h-8 w-8 text-indigo-600" />}
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {type === 'login' ? 'Welcome Back' : 'Security Check'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {type === 'login' 
              ? 'Sign in with your email and password to access the community.' 
              : `Verify your identity to ${targetAction || 'proceed'}.`}
          </p>
        </div>

        <div className="p-8">
          {step === 'email' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input 
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
                  />
                </div>
              </div>
              <button 
                onClick={handleNextToPassword}
                disabled={!email || loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100"
              >
                Continue <ArrowRight className="h-5 w-5" />
              </button>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <Info className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Demo Access</span>
                </div>
                <ul className="text-[11px] space-y-1.5 text-slate-600 font-medium">
                  <li className="flex justify-between items-center">
                    <span>Admin:</span>
                    <code className="bg-slate-200 px-1.5 py-0.5 rounded text-indigo-700 font-black">admin@sotorko.com</code>
                  </li>
                  <li className="flex justify-between items-center text-[9px] text-slate-400">
                    <span>Admin Pass:</span>
                    <code>Admin786@</code>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {step === 'password' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input 
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Simulated Bot Verification */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                 <button 
                    type="button"
                    onClick={() => setGoogleVerified(true)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border ${googleVerified ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'} transition-all`}
                 >
                    <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${googleVerified ? 'bg-green-600 border-green-600' : 'border-slate-300'}`}>
                           {googleVerified && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm font-bold text-slate-700">I'm not a robot</span>
                    </div>
                    <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" className="h-6 opacity-60" alt="Recaptcha" />
                 </button>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setStep('email')}
                  className="w-1/3 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={handleLogin}
                  disabled={!password || !googleVerified || loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100"
                >
                  {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Login'}
                </button>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block text-center">Enter 6-digit Code</label>
                <div className="flex justify-between gap-2" onPaste={handlePaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-12 h-14 text-center text-2xl font-black text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all shadow-sm"
                    />
                  ))}
                </div>
                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-tighter">Tip: You can paste the code from your clipboard</p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleVerify}
                  disabled={otp.some(d => !d) || loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 text-lg"
                >
                  {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Verify & Continue'}
                </button>
                <button 
                  onClick={() => setStep('password')}
                  className="text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors uppercase tracking-widest"
                >
                  Back to Password
                </button>
              </div>
            </div>
          )}
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
