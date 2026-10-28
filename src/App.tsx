import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Header } from './components/Header';
import { Navbar, TabType } from './components/Navbar';
import { Footer } from './components/Footer';
import { CommonProspectusModal } from './components/CommonProspectusModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { HodLoginModal } from './components/HodLoginModal';

import { HomeView } from './views/HomeView';
import { SeatMatrixView } from './views/SeatMatrixView';
import { SpotRoundView } from './views/SpotRoundView';
import { FacultyView } from './views/FacultyView';
import { StatsView } from './views/StatsView';
import { DownloadsView } from './views/DownloadsView';
import { ContactView } from './views/ContactView';
import { HodPortalView } from './views/HodPortalView';
import { AdminPortalView } from './views/AdminPortalView';
import { FaqView } from './views/FaqView';

function AppContent() {
  const { themeMode, isQuotaExceeded } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showProspectus, setShowProspectus] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showHodModal, setShowHodModal] = useState(false);

  // Dynamic Theme Classes
  const themeContainerClass =
    themeMode === 'maroon'
      ? 'theme-maroon bg-[#0c0307] text-[#fce7f3]'
      : themeMode === 'navy'
      ? 'theme-navy bg-[#030712] text-[#f0f9ff]'
      : 'theme-light bg-[#f4f6f1] text-[#131f15]';

  return (
    <div
      data-theme={themeMode}
      className={`min-h-screen ${themeContainerClass} flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300`}
    >
      
      {/* Header */}
      <Header
        onOpenAdminModal={() => setShowAdminModal(true)}
        onOpenHodModal={() => setShowHodModal(true)}
      />

      {isQuotaExceeded && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-300 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold uppercase tracking-wider bg-amber-500/20 px-2 py-0.5 rounded text-[10px]">
              Local Cache Mode
            </span>
            <span>
              Cloud database daily free write quota reached for today. All changes are saved safely in your local browser storage and the portal is fully operational.
            </span>
          </div>
          <a
            href="https://console.firebase.google.com/project/gen-lang-client-0743522657/firestore/databases/ai-studio-d7d173c0-b7d1-4d2c-8274-6f17561cf0cf/data?openUpgradeDialog=true"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-100 font-semibold shrink-0"
          >
            Upgrade Plan / Firebase Console &rarr;
          </a>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProspectus={() => setShowProspectus(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'home' && (
          <HomeView
            onNavigateTab={setActiveTab}
            onOpenProspectus={() => setShowProspectus(true)}
            onOpenAdminModal={() => setShowAdminModal(true)}
          />
        )}

        {activeTab === 'seats' && (
          <SeatMatrixView onNavigateSpot={() => setActiveTab('spot')} />
        )}

        {activeTab === 'spot' && <SpotRoundView />}

        {activeTab === 'faculty' && <FacultyView />}

        {activeTab === 'faq' && <FaqView />}

        {activeTab === 'stats' && <StatsView />}

        {activeTab === 'downloads' && (
          <DownloadsView onOpenProspectus={() => setShowProspectus(true)} />
        )}

        {activeTab === 'contact' && <ContactView />}

        {activeTab === 'hod' && (
          <HodPortalView onOpenHodModal={() => setShowHodModal(true)} />
        )}

        {activeTab === 'admin' && (
          <AdminPortalView onOpenAdminModal={() => setShowAdminModal(true)} />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <CommonProspectusModal
        isOpen={showProspectus}
        onClose={() => setShowProspectus(false)}
      />

      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSuccess={() => setActiveTab('admin')}
      />

      <HodLoginModal
        isOpen={showHodModal}
        onClose={() => setShowHodModal(false)}
        onSuccess={() => setActiveTab('hod')}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
