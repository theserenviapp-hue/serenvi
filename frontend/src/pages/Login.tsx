import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import api from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [animData, setAnimData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    fetch('https://lottie.host/4db68bbd-31f6-4cd8-84eb-189572c9ac68/H2ixkioCEF.json')
      .then(r => r.json())
      .then(setAnimData)
      .catch(() => {
        // Fallback: try another animation
        fetch('https://assets2.lottiefiles.com/packages/lf20_jcikwtux.json')
          .then(r => r.json())
          .then(setAnimData)
          .catch(() => {});
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex overflow-hidden relative">
      {/* CSS for 3D animations */}
      <style>{`
        @keyframes float3d {
          0%, 100% { transform: translateY(0px) rotateX(0deg) rotateY(0deg); }
          25% { transform: translateY(-20px) rotateX(5deg) rotateY(5deg); }
          50% { transform: translateY(-10px) rotateX(0deg) rotateY(10deg); }
          75% { transform: translateY(-25px) rotateX(-5deg) rotateY(5deg); }
        }
        @keyframes float3dSlow {
          0%, 100% { transform: translateY(0px) rotateZ(0deg); }
          50% { transform: translateY(-30px) rotateZ(5deg); }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(150px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(150px) rotate(-360deg); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-60px) rotateY(15deg); }
          to { opacity: 1; transform: translateX(0) rotateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px) rotateY(-15deg); }
          to { opacity: 1; transform: translateX(0) rotateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(34,211,238,0.15); }
          50% { box-shadow: 0 0 40px rgba(34,211,238,0.3), 0 0 80px rgba(34,211,238,0.1); }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(34,211,238,0.2); }
          50% { border-color: rgba(34,211,238,0.5); }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-100px) scale(1.5); opacity: 0.7; }
        }
        .animate-float3d { animation: float3d 6s ease-in-out infinite; }
        .animate-float3dSlow { animation: float3dSlow 8s ease-in-out infinite; }
        .animate-orbit { animation: orbit 20s linear infinite; }
        .animate-slideInLeft { animation: slideInLeft 0.8s ease-out forwards; }
        .animate-slideInRight { animation: slideInRight 0.8s ease-out forwards; }
        .animate-glowPulse { animation: glowPulse 3s ease-in-out infinite; }
        .animate-borderGlow { animation: borderGlow 3s ease-in-out infinite; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/20 rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `particleFloat ${4 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(34,211,238,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.4) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Left side - 3D Animated Section */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative z-10 perspective-1000">
        <div className={`text-center space-y-6 px-12 ${mounted ? 'animate-slideInLeft' : 'opacity-0'}`}>
          {/* Lottie animation with 3D float */}
          <div className="animate-float3d" style={{ transformStyle: 'preserve-3d' }}>
            {animData ? (
              <Lottie animationData={animData} loop style={{ width: 380, height: 380, margin: '0 auto' }} />
            ) : (
              /* 3D Animated fallback */
              <div className="w-[380px] h-[380px] mx-auto relative" style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 animate-spin" style={{ animationDuration: '8s' }} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-cyan-500/50 animate-pulse">S</div>
                </div>
                {/* Orbiting dots */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-orbit"><div className="w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" /></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-orbit" style={{ animationDelay: '-7s' }}><div className="w-2 h-2 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50" /></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-orbit" style={{ animationDelay: '-14s' }}><div className="w-2.5 h-2.5 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50" /></div>
                </div>
              </div>
            )}
          </div>

          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
            Welcome to SERENVI
          </h2>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Your gateway to financial freedom through our powerful network marketing platform
          </p>

          {/* Animated stats with 3D card feel */}
          <div className="flex justify-center gap-6 pt-4">
            {[
              { val: '10K+', label: 'Active Members', color: 'cyan' },
              { val: '₹5Cr+', label: 'Total Earnings', color: 'blue' },
              { val: '50+', label: 'Products', color: 'purple' },
            ].map((s, i) => (
              <div key={i} className="text-center bg-slate-900/60 border border-slate-800 rounded-xl px-5 py-3 hover:scale-110 hover:-translate-y-1 transition-all duration-300 cursor-default" style={{ animationDelay: `${i * 0.2}s` }}>
                <p className={`text-2xl font-bold text-${s.color}-400`}>{s.val}</p>
                <p className="text-slate-500 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login Form with 3D effect */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 perspective-1000">
        <div className={`w-full max-w-md ${mounted ? 'animate-slideInRight' : 'opacity-0'}`}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-cyan-500/30 hover:rotate-12 transition-transform">
                S
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                SERENVI
              </h1>
            </div>
            <p className="text-slate-500">Sign in to your account</p>
          </div>

          {/* Form Card with glow */}
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl animate-glowPulse animate-borderGlow hover:translate-y-[-2px] transition-transform duration-300">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group">
                <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">📧</span>
                  <input
                    type="email"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all focus:translate-x-1"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">🔒</span>
                  <input
                    type="password"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all focus:translate-x-1"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm flex items-center gap-2 animate-pulse">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group"
                disabled={loading}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Signing in...
                  </span>
                ) : 'Sign In →'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
              <p className="text-center text-slate-400 text-sm">
                Don't have an account?{' '}
                <a href="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition">Create account</a>
              </p>
              <p className="text-center">
                <a href="/forgot-password" className="text-slate-500 hover:text-cyan-400 text-sm transition">Forgot your password?</a>
              </p>
            </div>
          </div>

          <p className="text-center text-slate-600 text-xs mt-6">© 2026 SERENVI. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
