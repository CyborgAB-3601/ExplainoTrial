import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturesGrid } from './components/FeaturesGrid';
import { BackgroundWaves } from './components/BackgroundWaves';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { X, Play, CheckCircle2 } from 'lucide-react';
import { AccessibilityProvider } from './context/AccessibilityContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'hero' | 'auth' | 'dashboard'>('hero');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string }>({
    name: 'Abhinav',
    email: 'jasmin@nilo.ai',
  });
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthInitialMode(mode);
    setCurrentPage('auth');
  };

  const handleLoginSuccess = (user: { name?: string; email: string }) => {
    setIsLoggedIn(true);
    setCurrentUser({
      name: user.name || 'Abhinav',
      email: user.email,
    });
    triggerToast(`Welcome back, ${user.name || 'Abhinav'}! Loading your dashboard...`);
    setTimeout(() => {
      setCurrentPage('dashboard');
    }, 800);
  };

  const handleHomeNavigation = () => {
    if (isLoggedIn) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('hero');
    }
  };

  return (
    <AccessibilityProvider>
      <div className="relative min-h-screen bg-[#F8F7FD] overflow-hidden flex flex-col font-sans selection:bg-[#7C5CFF]/20 selection:text-[#1E1B2E]">

      {/* ============= 1. HERO MARKETING PAGE ============= */}
      {currentPage === 'hero' && (
        <div className="relative min-h-screen flex flex-col">
          <BackgroundWaves />
          <div className="relative z-30">
            <Navbar
              currentPage="home"
              onLoginClick={() => openAuth('login')}
              onHomeClick={handleHomeNavigation}
            />
          </div>
          <main className="relative z-10 flex-1 flex flex-col">
            <Hero
              onStartLearning={() => {
                if (isLoggedIn) {
                  setCurrentPage('dashboard');
                } else {
                  openAuth('signup');
                }
              }}
              onWatchDemo={() => setShowDemoModal(true)}
            />
            <FeaturesGrid />
          </main>
        </div>
      )}

      {/* ============= 2. LOGIN / SIGNUP PAGE (UNIFIED IN-CARD TOGGLE) ============= */}
      {currentPage === 'auth' && (
        <div className="relative min-h-screen flex flex-col">
          <BackgroundWaves />
          <main className="relative z-20 flex-1 flex flex-col">
            <LoginPage
              initialMode={authInitialMode}
              onHomeClick={handleHomeNavigation}
              onSuccessAuth={handleLoginSuccess}
            />
          </main>
        </div>
      )}

      {/* ============= 3. DASHBOARD / HOME PAGE (LOGGED IN) ============= */}
      {currentPage === 'dashboard' && (
        <Dashboard
          userName={currentUser.name}
          onLogout={() => {
            setIsLoggedIn(false);
            triggerToast("Logged out successfully.");
            setCurrentPage('hero');
          }}
        />
      )}

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#1E1B2E] text-white text-sm font-medium rounded-2xl shadow-xl border border-white/10 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#A855F7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Watch Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-100 flex flex-col items-center text-center">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#EC4899] flex items-center justify-center text-white shadow-lg shadow-purple-500/30 mb-4">
              <Play className="w-7 h-7 fill-white ml-0.5" />
            </div>
            <h3 className="text-2xl font-bold text-[#1E1B2E]">
              Watch EXO in Action
            </h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Experience voice-first Feynman learning: explain any concept to EXO, receive instantaneous verification, pinpoint knowledge gaps, and get short targeted video fixes.
            </p>
            <div className="mt-6 w-full p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#7C5CFF]">
                <span>Demo Flow:</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                1. Select Topic &rarr; 2. Speak Explanation &rarr; 3. EXO Verifies &rarr; 4. Advance or Review
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3 w-full">
              <button
                onClick={() => {
                  setShowDemoModal(false);
                  openAuth('login');
                }}
                className="flex-1 py-3 rounded-full text-white text-sm font-semibold bg-gradient-to-r from-[#6366F1] via-[#7C5CFF] to-[#EC4899] hover:opacity-95 shadow-md shadow-purple-500/25 transition-all"
              >
                Go to Dashboard / Login &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </AccessibilityProvider>
  );
}
