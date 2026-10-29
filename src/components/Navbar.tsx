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
  const { systemSettings, t, themeMode } = useData();
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

  const navBgClass =
    themeMode === 'maroon'
      ? 'bg-[#18050e] border-b border-red-950/80 text-pink-100 shadow-xl'
      : themeMode === 'navy'
      ? 'bg-[#061226] border-b border-blue-950/80 text-cyan-100 shadow-xl'
      : 'bg-[#25442b] border-b border-[#1a311f] text-slate-100 shadow-lg';

  return (
    <nav className={`${navBgClass} sticky top-0 z-20 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 overflow-x-auto scrollbar-none">
          
          <div className="flex items-center space-x-1 sm:space-x-2 py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isSpotLive = item.id === 'spot' && systemSettings.spotRoundEnabled;

              const handleNavClick = (e: React.MouseEvent) => {
                if (isSpotLive) {
                  e.preventDefault();
                  const targetUrl = 'https://ug-admission-pcb.vercel.app/';
                  const link = document.createElement('a');
                  link.href = targetUrl;
                  link.target = '_blank';
                  link.rel = 'noopener noreferrer';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  return;
                }
                setActiveTab(item.id);
              };

              return (
                <button
                  key={item.id}
                  onClick={handleNavClick}
                  title={isSpotLive ? 'Redirect to https://ug-admission-pcb.vercel.app/' : undefined}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center whitespace-nowrap transition-all ${
                    isActive
                      ? themeMode === 'navy'
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.4)] font-bold'
                        : themeMode === 'maroon'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)] font-bold'
                        : 'bg-[#d2eb4b] text-[#16291a] shadow-md font-extrabold'
                      : themeMode === 'maroon'
                      ? 'hover:bg-red-950/60 text-pink-200/80 hover:text-white'
                      : themeMode === 'navy'
                      ? 'hover:bg-blue-950/60 text-blue-200/80 hover:text-white'
                      : 'hover:bg-[#1f3824] text-emerald-100/90 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 mr-1.5 ${
                    isActive
                      ? 'text-[#16291a]'
                      : themeMode === 'navy'
                      ? 'text-cyan-400'
                      : themeMode === 'maroon'
                      ? 'text-amber-400'
                      : 'text-[#d2eb4b]'
                  }`} />
                  {item.label}
                  {item.badge}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 ml-4 shrink-0">

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
