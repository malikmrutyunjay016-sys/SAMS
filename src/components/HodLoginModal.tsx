import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Building2, Lock, X, AlertCircle } from 'lucide-react';

export const HodLoginModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginAsHod } = useAuth();
  const { hodAccounts } = useData();

  const [selectedDeptId, setSelectedDeptId] = useState(hodAccounts[0]?.id || 'physics_regular');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentAccount = hodAccounts.find((h) => h.id === selectedDeptId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentAccount) return;

    const success = loginAsHod(
      currentAccount.id,
      currentAccount.deptName,
      password,
      currentAccount.password
    );

    if (success) {
      onSuccess();
      onClose();
      setPassword('');
    } else {
      setErrorMsg(`Invalid password for Department of ${currentAccount.deptName}. (Default: ${currentAccount.password})`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 relative space-y-4">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-serif">HOD Departmental Login</h2>
            <p className="text-xs text-amber-400 font-mono">SAMS Panchayat College, Baragada</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Department</label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {hodAccounts.map((h) => (
                <option key={h.id} value={h.id}>
                  Dept of {h.deptName} ({h.username})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">HOD Security Password</label>
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
            {currentAccount && (
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                Default Hint: <code className="text-amber-400">{currentAccount.password}</code>
              </p>
            )}
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
              Log In as HOD
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
