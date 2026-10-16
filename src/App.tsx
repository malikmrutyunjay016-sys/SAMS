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
  const { themeMode } = useData();
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
      : 'theme-light bg-slate-50 text-slate-900';

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
