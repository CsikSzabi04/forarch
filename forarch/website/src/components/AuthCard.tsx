import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export function AuthCard() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Admin Override removed
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto glass-panel p-8 rounded-[2.5rem] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 w-full flex justify-end opacity-20 pointer-events-none">
        <Lock size={120} className="text-brand-500 -rotate-12 translate-x-10 -translate-y-10" />
      </div>

      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-white mb-2">
          {isLogin ? 'Authentication Required' : 'Create Access Key'}
        </h3>
        <p className="text-slate-400 text-sm mb-8">
          Secure your session to access global real-time synchronization.
        </p>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs mb-6 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase px-2">Email Address</label>
            <div className="flex bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-brand-500/50 transition-colors">
              <div className="pl-4 flex items-center justify-center">
                <Mail size={18} className="text-zinc-500" />
              </div>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent flex-1 px-4 py-3 outline-none text-white text-sm" 
                placeholder="archaeologist@hub.com" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase px-2">Secure Passphrase</label>
            <div className="flex bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-brand-500/50 transition-colors">
              <div className="pl-4 flex items-center justify-center">
                <Lock size={18} className="text-zinc-500" />
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent flex-1 px-4 py-3 outline-none text-white text-sm" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                {isLogin ? 'Authenticate Session' : 'Initialize Credentials'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold transition-colors"
          >
            {isLogin ? 'Need an access key? Initialize here.' : 'Already have credentials? Authenticate here.'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
