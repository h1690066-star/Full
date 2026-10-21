import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Smartphone,
  User,
  Lock,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  ShieldCheck,
  Server,
  LockKeyhole,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('adminxon77');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || "Kirishda xatolik yuz berdi. Login yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center items-center p-4 font-sans text-slate-100 relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl" />

      <div className="w-full max-w-[440px] bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 relative z-10">
        {/* Brand Icon Header */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-violet-600 to-emerald-500 rounded-2xl p-[1px] shadow-xl shadow-indigo-500/25">
            <div className="w-full h-full bg-[#0b1120] rounded-[15px] flex items-center justify-center text-white">
              <Smartphone className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
        </div>

        {/* Header Titles */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[11px] font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>XON BOZOR ADMIN v2.5</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            Boshqaruv Markazi
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Statistika, mahsulotlar, buyurtmalar va mijozlar tizimi
          </p>
        </div>

        {/* Error Banner Alert */}
        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start justify-between gap-3 text-rose-300">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <div className="font-bold text-rose-200">Kirishda xatolik yuz berdi</div>
                <div className="text-rose-300/90">{error}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Admin Login
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Maxfiy Parol
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 accent-indigo-600"
              />
              Sessiyani eslab qolish
            </label>
            <span className="text-indigo-400 font-semibold">Default: admin / adminxon77</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-4 disabled:opacity-75 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Tizimga kirish</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-7 pt-5 border-t border-white/10 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            HIMOYALANGAN ADMIN PANEL
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500 relative z-10">
        <div className="flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-indigo-400" />
          <span>Convex & Atlas Sync</span>
        </div>
        <div className="flex items-center gap-1.5">
          <LockKeyhole className="w-3.5 h-3.5 text-emerald-400" />
          <span>256-bit JWT Auth</span>
        </div>
      </div>
    </div>
  );
}
