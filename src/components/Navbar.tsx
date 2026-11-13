import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  BookOpen,
  GraduationCap,
  UserCheck,
  Users,
  BarChart3,
  Download,
  PhoneCall,
  HelpCircle,
  Building2,
  ShieldCheck,
  Radio,
  BookCheck,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

export type TabType = 'home' | 'seats' | 'counselling' | 'paper_access' | 'student_portal' | 'spot' | 'faculty' | 'stats' | 'downloads' | 'contact' | 'faq' | 'hod' | 'admin';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenProspectus: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { systemSettings, t, lang } = useData();
  const { isHod, isAdmin, hodDeptId, hodDeptName } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const isFacultyHod = Boolean(
    isHod && (hodDeptId === 'faculty' || (hodDeptName || '').toLowerCase().trim() === 'faculty')
  );

  const navItems = [
    { id: 'home' as TabType, label: t.home, icon: Home },
    { id: 'seats' as TabType, label: t.subjectsSeats, icon: BookOpen },
    ...(((isHod && !isFacultyHod) || isAdmin) ? [{ id: 'counselling' as TabType, label: t.subjectCounselling, icon: GraduationCap }] : []),
    ...((isHod || isAdmin)
      ? [{
          id: 'paper_access' as TabType,
          label: ((isHod && !isFacultyHod) || isAdmin)
            ? 'Access Major, Minor, MDC, AEC, VAC, SEC'
            : 'Access Minor, MDC, AEC, VAC, SEC',
          icon: BookCheck,
        }]
      : []),
    { id: 'student_portal' as TabType, label: t.studentPortal || 'Student Portal', icon: UserCheck },
    {
      id: 'spot' as TabType,
      label: t.spotRound,
      icon: UserCheck,
      badge: systemSettings.spotRoundEnabled ? (
        <span className="bg-emerald-400 text-slate-950 font-extrabold text-[9px] px-1.5 py-0.2 rounded-full animate-pulse ml-1.5 flex items-center">
          <Radio className="w-2.5 h-2.5 mr-0.5" /> {t.liveBadge}
        </span>
      ) : (
        <span className="bg-violet-950/90 text-violet-200 border border-violet-400/30 font-bold text-[9px] px-1.5 py-0.2 rounded ml-1.5">
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNavClick = (item: (typeof navItems)[number]) => {
    const isSpotLive = item.id === 'spot' && systemSettings.spotRoundEnabled;
    setMenuOpen(false);
    if (isSpotLive) {
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

  const activeNavItem = navItems.find((i) => i.id === activeTab);
  const currentTitle =
    activeTab === 'hod'
      ? t.hodDesk
      : activeTab === 'admin'
      ? t.adminPortal
      : activeNavItem?.label || t.home;

  const navBgClass = 'bg-[#233b56] border-b border-[#18293d] text-white shadow-lg';
  const dropdownPanelClass = 'bg-[#1b314b] border border-[#56789c] text-white';
  const activePillClass = 'bg-white text-[#1b314b] shadow-md font-extrabold';
  const inactiveItemClass = 'hover:bg-[#315073] text-slate-100 hover:text-white';
  const iconColorClass = 'text-sky-300';

  return (
    <nav className={`${navBgClass} sticky top-0 z-20 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Left: Home shortcut + Current Active Section */}
          <div className="flex items-center space-x-2 min-w-0">
            <button
              onClick={() => {
                setMenuOpen(false);
                setActiveTab('home');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs flex items-center whitespace-nowrap transition-all ${
                activeTab === 'home' ? activePillClass : `${inactiveItemClass} font-semibold`
              }`}
            >
              <Home className={`w-3.5 h-3.5 mr-1.5 ${activeTab === 'home' ? 'text-[#1b314b]' : iconColorClass}`} />
              {t.home}
            </button>

            {activeTab !== 'home' && (
              <div className="flex items-center space-x-1.5 text-xs truncate">
                <span className="text-sky-300">/</span>
                <span className="font-bold truncate max-w-[180px] sm:max-w-xs text-white">
                  {currentTitle}
                </span>
              </div>
            )}
          </div>

          {/* Right End: Role Portals + Menu Tab */}
          <div className="flex items-center space-x-2 ml-3 shrink-0" ref={menuContainerRef}>
            {isHod && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setActiveTab('hod');
                }}
                className={`hidden sm:flex px-3 py-1.5 rounded-full text-xs font-bold items-center transition ${
                  activeTab === 'hod'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'bg-[#16273a] text-amber-300 border border-amber-400/50 hover:bg-[#2c4a6e]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 mr-1" /> {t.hodDesk}
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setActiveTab('admin');
                }}
                className={`hidden sm:flex px-3 py-1.5 rounded-full text-xs font-bold items-center transition ${
                  activeTab === 'admin'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'bg-amber-400/20 text-amber-200 border border-amber-400/50 hover:bg-amber-400/30'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-300" /> {t.adminPortal}
              </button>
            )}

            {/* Right-End Menu Tab */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  menuOpen ? activePillClass : `${inactiveItemClass} border border-white/25 bg-white/10`
                }`}
              >
                {menuOpen ? (
                  <X className="w-3.5 h-3.5 text-[#1b314b]" />
                ) : (
                  <Menu className={`w-3.5 h-3.5 ${iconColorClass}`} />
                )}
                <span>{lang === 'or' ? 'ମେନୁ (Menu)' : 'Menu'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${menuOpen ? 'rotate-180 text-[#1b314b]' : 'text-sky-200'}`}
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl shadow-2xl p-2 z-50 space-y-1 max-h-[80vh] overflow-y-auto ${dropdownPanelClass}`}
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-sky-200/80 border-b border-white/15 mb-1">
                    {lang === 'or' ? 'ପୋର୍ଟାଲ୍ ନେଭିଗେସନ୍' : 'Portal Navigation'}
                  </div>

                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const isSpotLive = item.id === 'spot' && systemSettings.spotRoundEnabled;

                    return (
                      <button
                        key={item.id}
                        role="menuitem"
                        onClick={() => handleNavClick(item)}
                        title={isSpotLive ? 'Redirect to https://ug-admission-pcb.vercel.app/' : undefined}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs flex items-center justify-between text-left transition-all ${
                          isActive ? activePillClass : `${inactiveItemClass} font-semibold`
                        }`}
                      >
                        <span className="flex items-center min-w-0">
                          <Icon
                            className={`w-4 h-4 mr-2.5 shrink-0 ${
                              isActive ? 'text-[#1b314b]' : iconColorClass
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.badge}
                      </button>
                    );
                  })}

                  {(isHod || isAdmin) && (
                    <div className="pt-1.5 mt-1.5 border-t border-white/15 space-y-1">
                      {isHod && (
                        <button
                          role="menuitem"
                          onClick={() => {
                            setMenuOpen(false);
                            setActiveTab('hod');
                          }}
                          className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center transition ${
                            activeTab === 'hod'
                              ? 'bg-amber-400 text-slate-950 shadow'
                              : 'bg-[#16273a] text-amber-200 border border-amber-400/35 hover:bg-[#2c4a6e]'
                          }`}
                        >
                          <Building2 className="w-4 h-4 mr-2.5 shrink-0" />
                          <span>{t.hodDesk}</span>
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          role="menuitem"
                          onClick={() => {
                            setMenuOpen(false);
                            setActiveTab('admin');
                          }}
                          className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center transition ${
                            activeTab === 'admin'
                              ? 'bg-amber-400 text-slate-950 shadow'
                              : 'bg-amber-400/15 text-amber-200 border border-amber-400/40 hover:bg-amber-400/25'
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4 mr-2.5 shrink-0 text-amber-300" />
                          <span>{t.adminPortal}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

