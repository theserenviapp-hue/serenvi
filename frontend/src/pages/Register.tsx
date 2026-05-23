import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import api from '../services/api';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    sponsorId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [animData, setAnimData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    fetch('https://lottie.host/5ac41ea7-830b-4e8e-b1f0-68b42b5a1995/uQUFJH4KoW.json')
      .then(r => r.json())
      .then(setAnimData)
      .catch(() => {
        fetch('https://assets2.lottiefiles.com/packages/lf20_iorpbol0.json')
          .then(r => r.json())
          .then(setAnimData)
          .catch(() => {});
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.register(
        formData.email,
        formData.password,
        formData.name,
        formData.phone,
        formData.sponsorId || undefined
      );
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.message || 
        'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex overflow-hidden relative">
      {/* CSS for 3D animations */}
      <style>{`
        @keyframes float3dReg {
          0%, 100% { transform: translateY(0px) rotateX(0deg) rotateY(0deg); }
          25% { transform: translateY(-15px) rotateX(3deg) rotateY(-5deg); }
          50% { transform: translateY(-8px) rotateX(-2deg) rotateY(8deg); }
          75% { transform: translateY(-20px) rotateX(4deg) rotateY(-3deg); }
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(80px) rotateY(-10deg); }
          to { opacity: 1; transform: translateX(0) rotateY(0); }
        }
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-80px) rotateY(10deg); }
          to { opacity: 1; transform: translateX(0) rotateY(0); }
        }
        @keyframes glowPulseGreen {
          0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.15); }
          50% { box-shadow: 0 0 40px rgba(16,185,129,0.3), 0 0 80px rgba(16,185,129,0.1); }
        }
        @keyframes borderGlowGreen {
          0%, 100% { border-color: rgba(16,185,129,0.2); }
          50% { border-color: rgba(16,185,129,0.5); }
        }
        @keyframes hexFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-60px) rotate(180deg); opacity: 0.3; }
        }
        @keyframes cardHoverIn {
          from { transform: translateX(30px) scale(0.9); opacity: 0; }
          to { transform: translateX(0) scale(1); opacity: 1; }
        }
        .animate-float3dReg { animation: float3dReg 7s ease-in-out infinite; }
        .animate-slideUpFade { animation: slideUpFade 0.6s ease-out forwards; }
        .animate-slideInFromRight { animation: slideInFromRight 0.8s ease-out forwards; }
        .animate-slideInFromLeft { animation: slideInFromLeft 0.8s ease-out forwards; }
        .animate-glowPulseGreen { animation: glowPulseGreen 3s ease-in-out infinite; }
        .animate-borderGlowGreen { animation: borderGlowGreen 3s ease-in-out infinite; }
        .animate-cardHoverIn { animation: cardHoverIn 0.5s ease-out forwards; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-cyan-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
        {/* Floating hexagons */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-8 h-8 border border-emerald-500/10 rotate-45"
            style={{
              left: `${10 + i * 20}%`,
              top: `${15 + (i % 3) * 30}%`,
              animation: `hexFloat ${5 + i * 1.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(16,185,129,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.4) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Left side - Form with 3D entrance */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 perspective-1000">
        <div className={`w-full max-w-md ${mounted ? 'animate-slideInFromLeft' : 'opacity-0'}`}>
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-emerald-500/30 hover:rotate-12 transition-transform">
                S
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                SERENVI
              </h1>
            </div>
            <p className="text-slate-500">Create your account & start earning</p>
          </div>

          {/* Form Card with glow */}
          <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl animate-glowPulseGreen animate-borderGlowGreen hover:translate-y-[-2px] transition-transform duration-300">
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Full Name', icon: '👤', type: 'text', name: 'name', placeholder: 'John Doe', required: true },
                { label: 'Email Address', icon: '📧', type: 'email', name: 'email', placeholder: 'you@example.com', required: true },
                { label: 'Phone Number', icon: '📱', type: 'tel', name: 'phone', placeholder: '9876543210', required: true },
                { label: 'Password', icon: '🔒', type: 'password', name: 'password', placeholder: 'Create a strong password', required: true },
              ].map((field, i) => (
                <div key={field.name} className="group" style={{ animationDelay: `${i * 0.1}s` }}>
                  <label className="block text-slate-300 text-sm font-medium mb-1.5">{field.label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">{field.icon}</span>
                    <input
                      type={field.type}
                      name={field.name}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all focus:translate-x-1"
                      placeholder={field.placeholder}
                      value={(formData as any)[field.name]}
                      onChange={handleChange}
                      required={field.required}
                    />
                  </div>
                </div>
              ))}

              <div className="group">
                <label className="block text-slate-300 text-sm font-medium mb-1.5">
                  Sponsor's Referral Code <span className="text-slate-600">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">🔗</span>
                  <input
                    type="text"
                    name="sponsorId"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all uppercase focus:translate-x-1"
                    placeholder="e.g. A1B2C3"
                    value={formData.sponsorId}
                    onChange={handleChange}
                    maxLength={6}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">Join your sponsor's network to earn commissions</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm flex items-center gap-2 animate-pulse">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-700 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group"
                disabled={loading}
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Creating account...
                  </span>
                ) : 'Create Account →'}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-slate-800">
              <p className="text-center text-slate-400 text-sm">
                Already have an account?{' '}
                <a href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition">Sign in</a>
              </p>
            </div>
          </div>

          <p className="text-center text-slate-600 text-xs mt-6">© 2026 SERENVI. All rights reserved.</p>
        </div>
      </div>

      {/* Right side - 3D Animated Section */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative z-10 perspective-1000">
        <div className={`text-center space-y-6 px-12 ${mounted ? 'animate-slideInFromRight' : 'opacity-0'}`}>
          {/* Lottie with 3D float */}
          <div className="animate-float3dReg" style={{ transformStyle: 'preserve-3d' }}>
            {animData ? (
              <Lottie animationData={animData} loop style={{ width: 350, height: 350, margin: '0 auto' }} />
            ) : (
              /* 3D Animated fallback - network graph */
              <div className="w-[350px] h-[350px] mx-auto relative" style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-44 h-44 rounded-full border-2 border-emerald-500/20 animate-spin" style={{ animationDuration: '10s' }} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border-2 border-cyan-500/20 animate-spin" style={{ animationDuration: '7s', animationDirection: 'reverse' }} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-emerald-500/50 animate-pulse">S</div>
                </div>
                {/* Network nodes */}
                {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                  <div key={i} className="absolute inset-0 flex items-center justify-center" style={{ transform: `rotate(${deg}deg)` }}>
                    <div className="w-4 h-4 bg-emerald-400/60 rounded-full shadow-lg shadow-emerald-400/30" style={{ transform: `translateX(100px) rotate(-${deg}deg)` }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Join the Network
          </h2>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Start your journey to financial independence. Build your team and earn unlimited commissions.
          </p>

          {/* Animated feature cards with staggered entrance */}
          <div className="space-y-3 text-left max-w-sm mx-auto">
            {[
              { icon: '💰', color: 'emerald', title: '25% Direct Commission', desc: 'On every sale from your referrals', delay: 0.3 },
              { icon: '📈', color: 'cyan', title: 'Leadership Salary', desc: 'Monthly salary up to ₹50 Lakhs', delay: 0.5 },
              { icon: '🏆', color: 'blue', title: 'Achievement Rewards', desc: 'Unlock rewards as you grow your team', delay: 0.7 },
            ].map((f, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 bg-slate-900/50 border border-${f.color}-500/10 rounded-lg px-4 py-3 hover:scale-105 hover:border-${f.color}-500/30 transition-all duration-300 cursor-default`}
                style={{ animation: mounted ? `cardHoverIn 0.5s ease-out ${f.delay}s forwards` : 'none', opacity: 0 }}
              >
                <span className={`text-${f.color}-400 text-xl`}>{f.icon}</span>
                <div>
                  <p className="text-slate-200 text-sm font-semibold">{f.title}</p>
                  <p className="text-slate-500 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
