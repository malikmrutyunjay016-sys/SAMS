import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, X, Globe, AlertCircle, Sparkles } from 'lucide-react';

export const AdminLoginModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginAsAdmin, loginWithGoogle } = useAuth();
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = loginAsAdmin(password);
    if (success) {
      onSuccess();
      onClose();
      setPassword('');
    } else {
      setErrorMsg('Invalid Super Admin password. (Hint: Sams@2026!)');
    }
  };

  const handleGoogleSubmit = async () => {
    try {
      await loginWithGoogle();
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg('Google Sign-In failed.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 relative space-y-5">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-serif">Super Admin Security Login</h2>
            <p className="text-xs text-amber-400 font-mono">SAMS Panchayat College, Baragada</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" /> {errorMsg}
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSubmit}
          className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center space-x-2 transition shadow"
        >
          <Globe className="w-4 h-4 text-amber-400" />
          <span>Sign In with Google Account (Firebase Auth)</span>
        </button>

        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900 px-2 text-slate-500 font-mono">OR Master Password</span>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Super Admin Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              Default Hint: <code className="text-amber-400">Sams@2026!</code>
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs shadow"
            >
              Authenticate Admin
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
