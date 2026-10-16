import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Home, BookOpen, UserCheck, Users, BarChart3, Download, PhoneCall, HelpCircle, Building2, ShieldCheck, Radio } from 'lucide-react';

export type TabType = 'home' | 'seats' | 'spot' | 'faculty' | 'stats' | 'downloads' | 'contact' | 'faq' | 'hod' | 'admin';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenProspectus: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenProspectus }) => {
  const { systemSettings, t } = useData();
  const { isHod, isAdmin } = useAuth();

  const navItems = [
    { id: 'home' as TabType, label: t.home, icon: Home },
    { id: 'seats' as TabType, label: t.subjectsSeats, icon: BookOpen },
    {
      id: 'spot' as TabType,
      label: t.spotRound,
      icon: UserCheck,
      badge: systemSettings.spotRoundEnabled ? (
        <span className="bg-emerald-500 text-slate-950 font-extrabold text-[9px] px-1.5 py-0.2 rounded-full animate-pulse ml-1 flex items-center">
          <Radio className="w-2.5 h-2.5 mr-0.5" /> {t.liveBadge}
        </span>
      ) : (
        <span className="bg-slate-700 text-slate-400 font-bold text-[9px] px-1.5 py-0.2 rounded ml-1">
          {t.offBadge}
        </span>
      ),
    },
    { id: 'faculty' as TabType, label: t.facultyDir, icon: Users },
    { id: 'faq' as TabType, label: t.faqs, icon: HelpCircle },
    { id: 'stats' as TabType, label: t.samsStats, icon: BarChart3 },
    { id: 'downloads' as TabType, label: t.downloads, icon: Download },
    { id: 'contact' as TabType, label: t.contactUs, icon: PhoneCall },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-slate-200 sticky top-0 z-20 shadow-xl">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 overflow-x-auto scrollbar-none">
          
          <div className="flex items-center space-x-1 sm:space-x-2 py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 mr-1.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  {item.label}
                  {item.badge}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 ml-4 shrink-0">
            <button
              onClick={onOpenProspectus}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-medium whitespace-nowrap transition"
            >
              {t.commonProspectus}
            </button>

            {isHod && (
              <button
                onClick={() => setActiveTab('hod')}
                className={`px-3 py-1 rounded text-xs font-bold flex items-center ${
                  activeTab === 'hod' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400 border border-amber-500/40'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 mr-1" /> {t.hodDesk}
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1 rounded text-xs font-bold flex items-center ${
                  activeTab === 'admin' ? 'bg-amber-500 text-slate-950' : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-400" /> {t.adminPortal}
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};
